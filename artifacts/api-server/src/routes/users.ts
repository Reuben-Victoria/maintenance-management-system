import { Router } from "express";
import { eq, ilike, and, SQL } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { role, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions: SQL[] = [];
  if (role) conditions.push(eq(usersTable.role, role as any));
  if (search) conditions.push(ilike(usersTable.name, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        role: usersTable.role,
        department: usersTable.department,
        phone: usersTable.phone,
        staffId: usersTable.staffId,
        isActive: usersTable.isActive,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .where(where)
      .limit(limitNum)
      .offset(offset),
    db.select({ id: usersTable.id }).from(usersTable).where(where),
  ]);

  res.json({ data, total: countResult.length, page: pageNum, limit: limitNum });
});

router.get("/users/officers", requireAuth, async (_req, res) => {
  const officers = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      department: usersTable.department,
      phone: usersTable.phone,
      staffId: usersTable.staffId,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(and(eq(usersTable.role, "maintenance_officer"), eq(usersTable.isActive, true)));

  res.json(officers);
});

router.get("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      department: usersTable.department,
      phone: usersTable.phone,
      staffId: usersTable.staffId,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(user);
});

router.patch("/users/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  // Non-admins can only update themselves
  if (req.user!.role !== "admin" && req.user!.userId !== id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { name, department, phone, isActive, role } = req.body;
  const updates: Partial<typeof usersTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (department !== undefined) updates.department = department;
  if (phone !== undefined) updates.phone = phone;
  // Only admins can change isActive and role
  if (req.user!.role === "admin") {
    if (isActive !== undefined) updates.isActive = isActive;
    if (role !== undefined) updates.role = role;
  }
  updates.updatedAt = new Date();

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      department: usersTable.department,
      phone: usersTable.phone,
      staffId: usersTable.staffId,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    });

  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json(updated);
});

router.delete("/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ message: "User deleted" });
});

export default router;
