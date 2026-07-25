/**
 * Requests Routes — integration tests focusing on the status-update
 * permission rules (the core business logic of the system).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ────────────────────────────────────────────────────────────

const { mockDb } = vi.hoisted(() => {
  function makeChain(queue: any[][]): any {
    const proxy: any = new Proxy(
      {},
      {
        get(_: any, key: string) {
          if (key === "then") {
            const result = queue.shift() ?? [];
            return (resolve: (v: any) => void, reject: (e: any) => void) =>
              Promise.resolve(result).then(resolve, reject);
          }
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
    _enqueue: (...items: any[][]) => queue.push(...items),
    _reset: () => queue.splice(0),
  };

  return { mockDb };
});

vi.mock("@workspace/db", () => ({
  db: mockDb,
  usersTable: {},
  serviceRequestsTable: {},
  categoriesTable: {},
  assignmentsTable: {},
  statusLogsTable: {},
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn(() => ({})),
  and: vi.fn(() => ({})),
  ilike: vi.fn(() => ({})),
  desc: vi.fn(() => ({})),
  sql: vi.fn(() => ({})),
  ne: vi.fn(() => ({})),
  or: vi.fn(() => ({})),
}));

// ─── App ─────────────────────────────────────────────────────────────────────

import request from "supertest";
import app from "../app";
import { signToken } from "../middlewares/auth";

// ─── Tokens for each role ─────────────────────────────────────────────────────

const studentToken   = signToken({ userId: 10, role: "student",              email: "s@uni.edu"   });
const staffToken     = signToken({ userId: 11, role: "staff",                email: "st@uni.edu"  });
const officerToken   = signToken({ userId: 20, role: "maintenance_officer",  email: "o@uni.edu"   });
const adminToken     = signToken({ userId: 30, role: "admin",                email: "a@uni.edu"   });

// A request assigned to officer 20
const ASSIGNED_REQUEST = {
  id: 5,
  status: "assigned",
  assignedTo: 20,
  submittedBy: 10,
};

// A request assigned to a DIFFERENT officer (99)
const OTHER_OFFICER_REQUEST = {
  id: 6,
  status: "assigned",
  assignedTo: 99,
  submittedBy: 10,
};

beforeEach(() => {
  mockDb._reset();
  vi.clearAllMocks();
});

// ─── POST /api/requests/:id/status ───────────────────────────────────────────

describe("POST /api/requests/:id/status — permission rules", () => {
  it("returns 401 when no Authorization header is provided", async () => {
    const res = await request(app)
      .post("/api/requests/5/status")
      .send({ status: "in_progress" });
    expect(res.status).toBe(401);
  });

  it("returns 403 for a student", async () => {
    mockDb._enqueue([ASSIGNED_REQUEST]); // request lookup
    const res = await request(app)
      .post("/api/requests/5/status")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ status: "in_progress" });
    expect(res.status).toBe(403);
  });

  it("returns 403 for a staff member", async () => {
    mockDb._enqueue([ASSIGNED_REQUEST]);
    const res = await request(app)
      .post("/api/requests/5/status")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ status: "in_progress" });
    expect(res.status).toBe(403);
  });

  it("returns 403 for an admin (admins assign, not update status)", async () => {
    mockDb._enqueue([ASSIGNED_REQUEST]);
    const res = await request(app)
      .post("/api/requests/5/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "in_progress" });
    expect(res.status).toBe(403);
  });

  it("returns 403 for an officer NOT assigned to the request", async () => {
    mockDb._enqueue([OTHER_OFFICER_REQUEST]); // assignedTo = 99, officer token userId = 20
    const res = await request(app)
      .post("/api/requests/6/status")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({ status: "in_progress" });
    expect(res.status).toBe(403);
  });

  it("returns 200 for the assigned officer updating their own request", async () => {
    // 1 — select request  →  assigned to officer 20
    mockDb._enqueue([ASSIGNED_REQUEST]);
    // 2 — update request status  →  (no return value needed)
    mockDb._enqueue([]);
    // 3 — insert status log returning
    mockDb._enqueue([{ id: 1, requestId: 5, changedBy: 20, oldStatus: "assigned", newStatus: "in_progress", note: null, createdAt: new Date().toISOString() }]);
    // 4 — select actor name
    mockDb._enqueue([{ name: "Officer One" }]);

    const res = await request(app)
      .post("/api/requests/5/status")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({ status: "in_progress", note: "Started work" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ newStatus: "in_progress", changedByName: "Officer One" });
  });

  it("returns 400 for a missing status body field", async () => {
    mockDb._enqueue([ASSIGNED_REQUEST]);
    const res = await request(app)
      .post("/api/requests/5/status")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({}); // no status
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid status value", async () => {
    mockDb._enqueue([ASSIGNED_REQUEST]);
    const res = await request(app)
      .post("/api/requests/5/status")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({ status: "flying" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when the request does not exist", async () => {
    mockDb._enqueue([]); // empty → not found
    const res = await request(app)
      .post("/api/requests/9999/status")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({ status: "in_progress" });
    expect(res.status).toBe(404);
  });
});

// ─── POST /api/requests/:id/assign ───────────────────────────────────────────

describe("POST /api/requests/:id/assign — admin-only", () => {
  it("returns 403 for a non-admin user", async () => {
    const res = await request(app)
      .post("/api/requests/5/assign")
      .set("Authorization", `Bearer ${officerToken}`)
      .send({ officerId: 20 });
    expect(res.status).toBe(403);
  });

  it("returns 403 for a student", async () => {
    const res = await request(app)
      .post("/api/requests/5/assign")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ officerId: 20 });
    expect(res.status).toBe(403);
  });

  it("returns 400 when officerId is missing", async () => {
    const res = await request(app)
      .post("/api/requests/5/assign")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/officerId/i);
  });

  it("assigns an officer successfully (admin)", async () => {
    // 1 — delete existing assignment
    mockDb._enqueue([]);
    // 2 — insert new assignment returning
    mockDb._enqueue([{ id: 1, requestId: 5, officerId: 20, assignedBy: 30, notes: null, assignedAt: new Date().toISOString() }]);
    // 3 — select current status
    mockDb._enqueue([{ status: "pending" }]);
    // 4 — update service request
    mockDb._enqueue([]);
    // 5 — insert status log returning
    mockDb._enqueue([{ id: 2, requestId: 5, changedBy: 30, oldStatus: "pending", newStatus: "assigned", note: "Assigned to officer", createdAt: new Date().toISOString() }]);
    // 6 — select officer name
    mockDb._enqueue([{ name: "Officer One" }]);

    const res = await request(app)
      .post("/api/requests/5/assign")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ officerId: 20 });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ officerName: "Officer One" });
  });
});

// ─── GET /api/requests — role-based visibility ───────────────────────────────

describe("GET /api/requests — auth guard", () => {
  it("returns 401 without a token", async () => {
    const res = await request(app).get("/api/requests");
    expect(res.status).toBe(401);
  });

  it("returns 200 with a paginated response for an authenticated user", async () => {
    // Paginated rows + count query
    mockDb._enqueue([]);  // rows
    mockDb._enqueue([]);  // count
    const res = await request(app)
      .get("/api/requests")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("total");
    expect(res.body).toHaveProperty("page");
  });
});
