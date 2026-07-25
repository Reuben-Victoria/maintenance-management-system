import { describe, it, expect, vi, beforeEach } from "vitest";
import { signToken, verifyToken, requireAuth, requireRole } from "../middlewares/auth";
import type { Request, Response, NextFunction } from "express";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function mockRes() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as unknown as Response;
}

const mockNext: NextFunction = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── signToken / verifyToken ──────────────────────────────────────────────────

describe("signToken", () => {
  it("returns a non-empty string", () => {
    const token = signToken({ userId: 1, role: "admin", email: "a@b.com" });
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("round-trips: verifyToken recovers the original payload", () => {
    const payload = { userId: 42, role: "student", email: "s@uni.edu" };
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.email).toBe(payload.email);
  });

  it("produces different tokens for different payloads", () => {
    const t1 = signToken({ userId: 1, role: "admin", email: "a@b.com" });
    const t2 = signToken({ userId: 2, role: "student", email: "b@b.com" });
    expect(t1).not.toBe(t2);
  });
});

describe("verifyToken", () => {
  it("throws on a random string (not a valid JWT)", () => {
    expect(() => verifyToken("not-a-jwt")).toThrow();
  });

  it("throws on a JWT signed with a different secret", () => {
    // Manually craft a token signed with the wrong secret
    const wrongToken =
      "eyJhbGciOiJIUzI1NiJ9." +
      Buffer.from(JSON.stringify({ userId: 1, role: "admin", email: "x@x.com" })).toString("base64url") +
      ".wrongsignature";
    expect(() => verifyToken(wrongToken)).toThrow();
  });

  it("throws on an empty string", () => {
    expect(() => verifyToken("")).toThrow();
  });
});

// ─── requireAuth middleware ───────────────────────────────────────────────────

describe("requireAuth", () => {
  it("responds 401 when Authorization header is absent", () => {
    const req = mockReq({ headers: {} });
    const res = mockRes();
    requireAuth(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Unauthorized" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("responds 401 when Authorization header is not Bearer scheme", () => {
    const req = mockReq({ headers: { authorization: "Basic dXNlcjpwYXNz" } });
    const res = mockRes();
    requireAuth(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("responds 401 when Bearer token is invalid", () => {
    const req = mockReq({ headers: { authorization: "Bearer invalid.token.here" } });
    const res = mockRes();
    requireAuth(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid or expired token" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("calls next() and sets req.user when token is valid", () => {
    const payload = { userId: 5, role: "maintenance_officer", email: "o@uni.edu" };
    const token = signToken(payload);
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    requireAuth(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledOnce();
    expect(req.user).toBeDefined();
    expect(req.user!.userId).toBe(payload.userId);
    expect(req.user!.role).toBe(payload.role);
    expect(req.user!.email).toBe(payload.email);
  });
});

// ─── requireRole middleware ───────────────────────────────────────────────────

describe("requireRole", () => {
  it("responds 401 when req.user is not set", () => {
    const req = mockReq({ user: undefined });
    const res = mockRes();
    requireRole("admin")(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("responds 403 when user role is not in the allowed list", () => {
    const req = mockReq({ user: { userId: 1, role: "student", email: "s@uni.edu" } });
    const res = mockRes();
    requireRole("admin", "maintenance_officer")(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Forbidden" });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("calls next() when user role is in the allowed list", () => {
    const req = mockReq({ user: { userId: 2, role: "admin", email: "a@uni.edu" } });
    const res = mockRes();
    requireRole("admin", "maintenance_officer")(req, res, mockNext);
    expect(mockNext).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("accepts any role in a multi-role allowlist", () => {
    const roles = ["student", "staff", "maintenance_officer", "admin"];
    roles.forEach((role) => {
      vi.clearAllMocks();
      const req = mockReq({ user: { userId: 1, role, email: "x@uni.edu" } });
      const res = mockRes();
      requireRole(...roles)(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledOnce();
    });
  });
});
