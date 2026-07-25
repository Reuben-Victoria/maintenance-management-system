import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { serviceRequestsTable } from "./service-requests";

export const statusLogsTable = pgTable("status_logs", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .notNull()
    .references(() => serviceRequestsTable.id, { onDelete: "cascade" }),
  changedBy: integer("changed_by")
    .notNull()
    .references(() => usersTable.id),
  oldStatus: text("old_status"),
  newStatus: text("new_status")
    .$type<"pending" | "assigned" | "in_progress" | "completed" | "rejected">()
    .notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStatusLogSchema = createInsertSchema(statusLogsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertStatusLog = z.infer<typeof insertStatusLogSchema>;
export type StatusLog = typeof statusLogsTable.$inferSelect;
