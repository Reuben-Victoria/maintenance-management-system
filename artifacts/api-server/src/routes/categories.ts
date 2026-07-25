import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db, categoriesTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/categories", requireAuth, async (_req, res) => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(categories);
});

router.post("/categories", requireAuth, requireRole("admin"), async (req, res) => {
  const { name, description } = req.body;
  if (!name || name.length < 2) {
    res.status(400).json({ error: "name must be at least 2 characters" });
    return;
  }

  const [category] = await db.insert(categoriesTable).values({ name, description }).returning();
  res.status(201).json(category);
});

router.patch("/categories/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const { name, description } = req.body;
  const updates: Partial<typeof categoriesTable.$inferInsert> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;

  const [updated] = await db
    .update(categoriesTable)
    .set(updates)
    .where(eq(categoriesTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(updated);
});

router.delete("/categories/:id", requireAuth, requireRole("admin"), async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ message: "Category deleted" });
});

export default router;
