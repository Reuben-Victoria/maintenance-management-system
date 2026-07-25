import { Router } from "express";
import { eq, count, desc, and, gte, lte } from "drizzle-orm";
import { db, serviceRequestsTable, statusLogsTable, assignmentsTable, usersTable, categoriesTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  const { role, userId } = req.user!;

  // Total counts by status
  const allRequests = await db
    .select({ status: serviceRequestsTable.status, submittedBy: serviceRequestsTable.submittedBy, categoryId: serviceRequestsTable.categoryId, priority: serviceRequestsTable.priority })
    .from(serviceRequestsTable);

  const total = allRequests.length;
  const pending = allRequests.filter(r => r.status === "pending").length;
  const assigned = allRequests.filter(r => r.status === "assigned").length;
  const inProgress = allRequests.filter(r => r.status === "in_progress").length;
  const completed = allRequests.filter(r => r.status === "completed").length;
  const rejected = allRequests.filter(r => r.status === "rejected").length;

  let myRequests: number | null = null;
  if (role === "student" || role === "staff") {
    myRequests = allRequests.filter(r => r.submittedBy === userId).length;
  }

  // By category
  const categories = await db.select().from(categoriesTable);
  const byCategory = categories.map(cat => ({
    name: cat.name,
    count: allRequests.filter(r => r.categoryId === cat.id).length,
  })).filter(c => c.count > 0);

  // Uncategorized
  const uncategorizedCount = allRequests.filter(r => r.categoryId === null).length;
  if (uncategorizedCount > 0) {
    byCategory.push({ name: "Uncategorized", count: uncategorizedCount });
  }

  // By priority
  const priorities = ["low", "medium", "high", "urgent"] as const;
  const byPriority = priorities.map(p => ({
    priority: p,
    count: allRequests.filter(r => r.priority === p).length,
  }));

  res.json({ total, pending, assigned, inProgress, completed, rejected, myRequests, byCategory, byPriority });
});

router.get("/dashboard/recent", requireAuth, async (req, res) => {
  const limitNum = Math.min(50, Math.max(1, parseInt((req.query.limit as string) ?? "10")));

  const logs = await db
    .select({
      id: statusLogsTable.id,
      requestId: statusLogsTable.requestId,
      requestTitle: serviceRequestsTable.title,
      actorName: usersTable.name,
      oldStatus: statusLogsTable.oldStatus,
      newStatus: statusLogsTable.newStatus,
      note: statusLogsTable.note,
      createdAt: statusLogsTable.createdAt,
    })
    .from(statusLogsTable)
    .leftJoin(serviceRequestsTable, eq(statusLogsTable.requestId, serviceRequestsTable.id))
    .leftJoin(usersTable, eq(statusLogsTable.changedBy, usersTable.id))
    .orderBy(desc(statusLogsTable.createdAt))
    .limit(limitNum);

  const activity = logs.map(log => ({
    id: log.id,
    type: log.oldStatus === null ? "new_request" : "status_change",
    requestId: log.requestId,
    requestTitle: log.requestTitle ?? "Unknown",
    actorName: log.actorName ?? "Unknown",
    description: log.oldStatus === null
      ? `New request submitted`
      : `Status changed from ${log.oldStatus} to ${log.newStatus}${log.note ? `: ${log.note}` : ""}`,
    createdAt: log.createdAt,
  }));

  res.json(activity);
});

router.get("/reports/export", requireAuth, requireRole("admin"), async (req, res) => {
  const { status, from, to } = req.query as Record<string, string>;

  const rows = await db
    .select({
      id: serviceRequestsTable.id,
      title: serviceRequestsTable.title,
      description: serviceRequestsTable.description,
      status: serviceRequestsTable.status,
      priority: serviceRequestsTable.priority,
      location: serviceRequestsTable.location,
      categoryName: categoriesTable.name,
      submitterName: usersTable.name,
      createdAt: serviceRequestsTable.createdAt,
      updatedAt: serviceRequestsTable.updatedAt,
    })
    .from(serviceRequestsTable)
    .leftJoin(categoriesTable, eq(serviceRequestsTable.categoryId, categoriesTable.id))
    .leftJoin(usersTable, eq(serviceRequestsTable.submittedBy, usersTable.id))
    .where(
      and(
        status ? eq(serviceRequestsTable.status, status as any) : undefined,
        from ? gte(serviceRequestsTable.createdAt, new Date(from)) : undefined,
        to ? lte(serviceRequestsTable.createdAt, new Date(to)) : undefined,
      )
    )
    .orderBy(desc(serviceRequestsTable.createdAt));

  const headers = ["ID", "Title", "Category", "Status", "Priority", "Location", "Submitted By", "Created At", "Updated At"];
  const csvRows = rows.map(r => [
    r.id,
    `"${(r.title ?? "").replace(/"/g, '""')}"`,
    r.categoryName ?? "Uncategorized",
    r.status,
    r.priority,
    `"${(r.location ?? "").replace(/"/g, '""')}"`,
    `"${(r.submitterName ?? "").replace(/"/g, '""')}"`,
    r.createdAt.toISOString(),
    r.updatedAt.toISOString(),
  ].join(","));

  const csv = [headers.join(","), ...csvRows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="maintenance-report-${Date.now()}.csv"`);
  res.send(csv);
});

export default router;
