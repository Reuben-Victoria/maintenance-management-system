import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { serviceRequestsTable } from "./service-requests";

export const assignmentsTable = pgTable("assignments", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id")
    .notNull()
    .references(() => serviceRequestsTable.id, { onDelete: "cascade" }),
  officerId: integer("officer_id")
    .notNull()
    .references(() => usersTable.id),
  assignedBy: integer("assigned_by")
    .notNull()
    .references(() => usersTable.id),
  notes: text("notes"),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
});

export const insertAssignmentSchema = createInsertSchema(assignmentsTable).omit(
  { id: true, assignedAt: true }
);

export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type Assignment = typeof assignmentsTable.$inferSelect;
