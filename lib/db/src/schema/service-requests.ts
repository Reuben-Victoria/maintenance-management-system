import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { categoriesTable } from "./categories";

export const serviceRequestsTable = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id),
  status: text("status")
    .$type<"pending" | "assigned" | "in_progress" | "completed" | "rejected">()
    .notNull()
    .default("pending"),
  priority: text("priority")
    .$type<"low" | "medium" | "high" | "urgent">()
    .notNull()
    .default("medium"),
  location: text("location"),
  evidenceUrl: text("evidence_url"),
  submittedBy: integer("submitted_by")
    .notNull()
    .references(() => usersTable.id),
  assignedTo: integer("assigned_to").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertServiceRequestSchema = createInsertSchema(
  serviceRequestsTable
).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;
