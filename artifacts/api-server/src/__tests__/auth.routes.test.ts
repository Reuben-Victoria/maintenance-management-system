/**
 * Auth Routes — integration tests using supertest.
 * The database and bcryptjs are fully mocked so no real DB connection is made.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks (run before any imports) ───────────────────────────────────

const { mockDb, mockBcrypt } = vi.hoisted(() => {
  /** Proxy that is both await-able and infinitely chainable. */
  function makeChain(queue: any[][]): any {
    const proxy: any = new Proxy(
      {},
      {
        get(_: any, key: string) {
          if (key === "then") {
            // Resolve with the next item in the queue (or empty array).
            const result = queue.shift() ?? [];
            return (resolve: (v: any) => void, reject: (e: any) => void) =>
              Promise.resolve(result).then(resolve, reject);
          }
          // Every other property returns a function that returns this proxy.
          return () => proxy;
        },
      },
    );
    return proxy;
  }

  const queue: any[][] = [];

  const mockDb = {
    select: () => makeChain(queue),
    insert: () => makeChain(queue),
    update: () => makeChain(queue),
    delete: () => makeChain(queue),
    /** Enqueue results consumed in order by successive awaits. */
    _enqueue: (...items: any[][]) => queue.push(...items),
    _reset: () => queue.splice(0),
  };

  const mockBcrypt = {
    hash: vi.fn().mockResolvedValue("$2b$10$hashedpassword"),
    compare: vi.fn().mockResolvedValue(true),
  };

  return { mockDb, mockBcrypt };
});

vi.mock("@workspace/db", () => ({
  db: mockDb,
  usersTable: {},
  serviceRequestsTable: {},
  categoriesTable: {},
  assignmentsTable: {},
  statusLogsTable: {},
}));

vi.mock("bcryptjs", () => ({ default: mockBcrypt }));

// Mock drizzle helpers (just return opaque objects used as WHERE conditions)
vi.mock("drizzle-orm", () => ({
  eq: vi.fn(() => ({})),
  and: vi.fn(() => ({})),
  ilike: vi.fn(() => ({})),
  desc: vi.fn(() => ({})),
  sql: vi.fn(() => ({})),
  ne: vi.fn(() => ({})),
  or: vi.fn(() => ({})),
}));

// ─── App import (after mocks are set up) ─────────────────────────────────────

import request from "supertest";
import app from "../app";
import { signToken } from "../middlewares/auth";

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_USER = {
  id: 1,
  name: "Alice",
  email: "alice@uni.edu",
  passwordHash: "$2b$10$hashedpassword",
  role: "student" as const,
  department: null,
  phone: null,
  staffId: null,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  mockDb._reset();
  vi.clearAllMocks();
  // Restore default bcrypt behaviour after each test
  mockBcrypt.hash.mockResolvedValue("$2b$10$hashedpassword");
  mockBcrypt.compare.mockResolvedValue(true);
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("returns 400 when required fields are missing", async () => {
    const res = await request(app).post("/api/auth/register").send({ name: "Bob" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("returns 400 for an invalid role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Bob", email: "b@b.com", password: "pass123", role: "superuser" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid role/i);
  });

  it("returns 409 when email is already in use", async () => {
    // First select (check existing) → returns a user → email taken
    mockDb._enqueue([VALID_USER]);

    const res = await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@uni.edu",
      password: "password123",
      role: "student",
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already in use/i);
  });

  it("returns 201 with token and user on successful registration", async () => {
    // First select (check existing) → empty → email free
    mockDb._enqueue([]);
    // Insert returning → new user row
    mockDb._enqueue([VALID_USER]);

    const res = await request(app).post("/api/auth/register").send({
      name: "Alice",
      email: "alice@uni.edu",
      password: "password123",
      role: "student",
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject({ email: VALID_USER.email });
    // Password hash must NOT be leaked
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  it("returns 400 when email or password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "a@b.com" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  it("returns 401 when user is not found", async () => {
    // Select returns nothing
    mockDb._enqueue([]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ghost@uni.edu", password: "pass" });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it("returns 401 when the account is deactivated", async () => {
    mockDb._enqueue([{ ...VALID_USER, isActive: false }]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@uni.edu", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/deactivated/i);
  });

  it("returns 401 when password is incorrect", async () => {
    mockDb._enqueue([VALID_USER]);
    // bcrypt.compare → wrong password
    mockBcrypt.compare.mockResolvedValue(false);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@uni.edu", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/invalid credentials/i);
  });

  it("returns 200 with token and user on successful login", async () => {
    mockDb._enqueue([VALID_USER]);
    mockBcrypt.compare.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@uni.edu", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject({ email: VALID_USER.email });
    expect(res.body.user.passwordHash).toBeUndefined();
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  it("returns 401 when no Authorization header is provided", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 when the token is invalid", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not.a.valid.token");
    expect(res.status).toBe(401);
  });

  it("returns the authenticated user profile", async () => {
    const token = signToken({ userId: VALID_USER.id, role: VALID_USER.role, email: VALID_USER.email });
    // Select by userId → return user
    mockDb._enqueue([VALID_USER]);

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ email: VALID_USER.email });
    expect(res.body.passwordHash).toBeUndefined();
  });

  it("returns 404 when the token references a deleted user", async () => {
    const token = signToken({ userId: 999, role: "student", email: "gone@uni.edu" });
    mockDb._enqueue([]); // user not in DB

    const res = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
  });
});
