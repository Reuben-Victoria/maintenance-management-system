import { Router } from "express";
import { eq, and, ilike, SQL, desc, sql } from "drizzle-orm";
import {
  db,
  serviceRequestsTable,
  usersTable,
  categoriesTable,
  assignmentsTable,
  statusLogsTable,
} from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

// Helper: build a service request row with joined names and submitter email
async function getRequestRow(id: number) {
  const result = await db
    .select({
      id: serviceRequestsTable.id,
      title: serviceRequestsTable.title,
      description: serviceRequestsTable.description,
      categoryId: serviceRequestsTable.categoryId,
      categoryName: categoriesTable.name,
      status: serviceRequestsTable.status,
      priority: serviceRequestsTable.priority,
      location: serviceRequestsTable.location,
      evidenceUrl: serviceRequestsTable.evidenceUrl,
      submittedBy: serviceRequestsTable.submittedBy,
      submitterName: usersTable.name,
      submitterEmail: usersTable.email,
      assignedTo: serviceRequestsTable.assignedTo,
      createdAt: serviceRequestsTable.createdAt,
      updatedAt: serviceRequestsTable.updatedAt,
    })
    .from(serviceRequestsTable)
    .leftJoin(usersTable, eq(serviceRequestsTable.submittedBy, usersTable.id))
    .leftJoin(categoriesTable, eq(serviceRequestsTable.categoryId, categoriesTable.id))
    .where(eq(serviceRequestsTable.id, id))
    .limit(1);

  return result[0] ?? null;
}

router.get("/requests", requireAuth, async (req, res) => {
  const {
    status,
    priority,
    categoryId,
    search,
    submittedBy,
    assignedTo,
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions: SQL[] = [];

  // Role-based filtering
  const { role, userId } = req.user!;
  if (role === "student" || role === "staff") {
    // Students/staff only see requests they submitted
    conditions.push(eq(serviceRequestsTable.submittedBy, userId));
  } else if (role === "maintenance_officer") {
    // Officers only see requests assigned to them
    conditions.push(eq(serviceRequestsTable.assignedTo, userId));
  }
  // admin sees everything — no filter added

  if (status) conditions.push(eq(serviceRequestsTable.status, status as any));
  if (priority) conditions.push(eq(serviceRequestsTable.priority, priority as any));
  if (categoryId) conditions.push(eq(serviceRequestsTable.categoryId, parseInt(categoryId)));
  if (search) conditions.push(ilike(serviceRequestsTable.title, `%${search}%`));
  if (submittedBy && role === "admin") conditions.push(eq(serviceRequestsTable.submittedBy, parseInt(submittedBy)));
  if (assignedTo && role === "admin") conditions.push(eq(serviceRequestsTable.assignedTo, parseInt(assignedTo)));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countRows] = await Promise.all([
    db
      .select({
        id: serviceRequestsTable.id,
        title: serviceRequestsTable.title,
        description: serviceRequestsTable.description,
        categoryId: serviceRequestsTable.categoryId,
        categoryName: categoriesTable.name,
        status: serviceRequestsTable.status,
        priority: serviceRequestsTable.priority,
        location: serviceRequestsTable.location,
        evidenceUrl: serviceRequestsTable.evidenceUrl,
        submittedBy: serviceRequestsTable.submittedBy,
        submitterName: usersTable.name,
        assignedTo: serviceRequestsTable.assignedTo,
        officerName: sql<string | null>`NULL`,
        createdAt: serviceRequestsTable.createdAt,
        updatedAt: serviceRequestsTable.updatedAt,
      })
      .from(serviceRequestsTable)
      .leftJoin(usersTable, eq(serviceRequestsTable.submittedBy, usersTable.id))
      .leftJoin(categoriesTable, eq(serviceRequestsTable.categoryId, categoriesTable.id))
      .where(where)
      .orderBy(desc(serviceRequestsTable.createdAt))
      .limit(limitNum)
      .offset(offset),
    db.select({ id: serviceRequestsTable.id }).from(serviceRequestsTable).where(where),
  ]);

  res.json({ data: rows, total: countRows.length, page: pageNum, limit: limitNum });
});

router.post("/requests", requireAuth, async (req, res) => {
  const { title, description, categoryId, priority = "medium", location, evidenceUrl } = req.body;

  if (!title || title.length < 5) {
    res.status(400).json({ error: "title must be at least 5 characters" });
    return;
  }
  if (!description || description.length < 10) {
    res.status(400).json({ error: "description must be at least 10 characters" });
    return;
  }

  const [request] = await db
    .insert(serviceRequestsTable)
    .values({
      title,
      description,
      categoryId: categoryId ?? null,
      priority,
      location: location ?? null,
      evidenceUrl: evidenceUrl ?? null,
      submittedBy: req.user!.userId,
    })
    .returning();

  // Log initial status
  await db.insert(statusLogsTable).values({
    requestId: request.id,
    changedBy: req.user!.userId,
    oldStatus: null,
    newStatus: "pending",
    note: "Request submitted",
  });

  const row = await getRequestRow(request.id);
  res.status(201).json(row ?? request);
});

router.get("/requests/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const row = await getRequestRow(id);
  if (!row) { res.status(404).json({ error: "Request not found" }); return; }

  // Check permission
  const { role, userId } = req.user!;
  if (role === "student" || role === "staff") {
    if (row.submittedBy !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
  }

  // Get assignment
  const [assignment] = await db
    .select({
      id: assignmentsTable.id,
      requestId: assignmentsTable.requestId,
      officerId: assignmentsTable.officerId,
      officerName: usersTable.name,
      assignedBy: assignmentsTable.assignedBy,
      assignedByName: sql<string | null>`NULL`,
      notes: assignmentsTable.notes,
      assignedAt: assignmentsTable.assignedAt,
    })
    .from(assignmentsTable)
    .leftJoin(usersTable, eq(assignmentsTable.officerId, usersTable.id))
    .where(eq(assignmentsTable.requestId, id))
    .limit(1);

  // Get logs
  const logs = await db
    .select({
      id: statusLogsTable.id,
      requestId: statusLogsTable.requestId,
      changedBy: statusLogsTable.changedBy,
      changedByName: usersTable.name,
      oldStatus: statusLogsTable.oldStatus,
      newStatus: statusLogsTable.newStatus,
      note: statusLogsTable.note,
      createdAt: statusLogsTable.createdAt,
    })
    .from(statusLogsTable)
    .leftJoin(usersTable, eq(statusLogsTable.changedBy, usersTable.id))
    .where(eq(statusLogsTable.requestId, id))
    .orderBy(statusLogsTable.createdAt);

  // submitterEmail is already included from getRequestRow (no extra query needed)
  res.json({
    ...row,
    assignment: assignment ?? null,
    logs,
  });
});

router.patch("/requests/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const existing = await db
    .select()
    .from(serviceRequestsTable)
    .where(eq(serviceRequestsTable.id, id))
    .limit(1);

  if (!existing[0]) { res.status(404).json({ error: "Request not found" }); return; }

  const { role, userId } = req.user!;
  if ((role === "student" || role === "staff") && existing[0].submittedBy !== userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const { title, description, categoryId, priority, location, evidenceUrl } = req.body;
  const updates: Partial<typeof serviceRequestsTable.$inferInsert> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (categoryId !== undefined) updates.categoryId = categoryId;
  if (priority !== undefined) updates.priority = priority;
  if (location !== undefined) updates.location = location;
  if (evidenceUrl !== undefined) updates.evidenceUrl = evidenceUrl;
  updates.updatedAt = new Date();

  await db.update(serviceRequestsTable).set(updates).where(eq(serviceRequestsTable.id, id));
  const row = await getRequestRow(id);
  res.json(row);
});

router.delete("/requests/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { role, userId } = req.user!;
  const [existing] = await db
    .select()
    .from(serviceRequestsTable)
    .where(eq(serviceRequestsTable.id, id))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Request not found" }); return; }
  if ((role === "student" || role === "staff") && existing.submittedBy !== userId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.delete(serviceRequestsTable).where(eq(serviceRequestsTable.id, id));
  res.json({ message: "Request deleted" });
});

router.post("/requests/:id/assign", requireAuth, requireRole("admin"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { officerId, notes } = req.body;
  if (!officerId) { res.status(400).json({ error: "officerId is required" }); return; }

  // Remove any existing assignment
  await db.delete(assignmentsTable).where(eq(assignmentsTable.requestId, id));

  const [assignment] = await db
    .insert(assignmentsTable)
    .values({ requestId: id, officerId, assignedBy: req.user!.userId, notes })
    .returning();

  // Update request status + assignedTo
  const [prev] = await db
    .select({ status: serviceRequestsTable.status })
    .from(serviceRequestsTable)
    .where(eq(serviceRequestsTable.id, id))
    .limit(1);

  await db
    .update(serviceRequestsTable)
    .set({ assignedTo: officerId, status: "assigned", updatedAt: new Date() })
    .where(eq(serviceRequestsTable.id, id));

  await db.insert(statusLogsTable).values({
    requestId: id,
    changedBy: req.user!.userId,
    oldStatus: prev?.status ?? null,
    newStatus: "assigned",
    note: `Assigned to officer${notes ? `: ${notes}` : ""}`,
  });

  const [officerRow] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, officerId))
    .limit(1);

  res.json({ ...assignment, officerName: officerRow?.name ?? null, assignedByName: null });
});

router.post("/requests/:id/status", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { status, note } = req.body;
  if (!status) { res.status(400).json({ error: "status is required" }); return; }

  const validStatuses = ["pending", "assigned", "in_progress", "completed", "rejected"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid status" }); return;
  }

  const [existing] = await db
    .select({ status: serviceRequestsTable.status, assignedTo: serviceRequestsTable.assignedTo, submittedBy: serviceRequestsTable.submittedBy })
    .from(serviceRequestsTable)
    .where(eq(serviceRequestsTable.id, id))
    .limit(1);

  if (!existing) { res.status(404).json({ error: "Request not found" }); return; }

  const { role, userId } = req.user!;
  // Only the assigned maintenance officer may update status.
  // Students/staff cannot update status.
  if (role === "student" || role === "staff") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  // Admins assign officers — they do not update status themselves.
  if (role === "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }
  // Officers can only update status on requests explicitly assigned to them.
  // Use Number() on both sides to guard against string/number type mismatch from JWT decode.
  if (role === "maintenance_officer" && Number(existing.assignedTo) !== Number(userId)) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db
    .update(serviceRequestsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(serviceRequestsTable.id, id));

  const [log] = await db
    .insert(statusLogsTable)
    .values({
      requestId: id,
      changedBy: userId,
      oldStatus: existing.status,
      newStatus: status,
      note: note ?? null,
    })
    .returning();

  const [actor] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  res.json({ ...log, changedByName: actor?.name ?? null });
});

router.get("/requests/:id/logs", requireAuth, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const logs = await db
    .select({
      id: statusLogsTable.id,
      requestId: statusLogsTable.requestId,
      changedBy: statusLogsTable.changedBy,
      changedByName: usersTable.name,
      oldStatus: statusLogsTable.oldStatus,
      newStatus: statusLogsTable.newStatus,
      note: statusLogsTable.note,
      createdAt: statusLogsTable.createdAt,
    })
    .from(statusLogsTable)
    .leftJoin(usersTable, eq(statusLogsTable.changedBy, usersTable.id))
    .where(eq(statusLogsTable.requestId, id))
    .orderBy(statusLogsTable.createdAt);

  res.json(logs);
});

export default router;
