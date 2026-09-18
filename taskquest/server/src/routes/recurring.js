const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { resolveListId } = require("../lib/lists");

const router = express.Router();
router.use(requireAuth);

const VALID_PRIORITIES = new Set(["urgent", "important", "someday"]);
const MAX_SPAN_DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

function parseDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Creates a recurring task definition AND immediately generates one real
// task per day in the range — each is a normal task (same completion,
// points, and streak behavior as any other), just pre-scheduled.
router.post("/", async (req, res, next) => {
  try {
    const { title, notes, priority, listId, startDate, endDate } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);
    if (!start || !end) {
      return res.status(400).json({ error: "A valid start and end date are required" });
    }
    if (end < start) {
      return res.status(400).json({ error: "End date must be on or after the start date" });
    }

    const totalDays = Math.round((end - start) / DAY_MS) + 1;
    if (totalDays > MAX_SPAN_DAYS) {
      return res.status(400).json({
        error: `Repeating tasks can span at most ${MAX_SPAN_DAYS} days — try a shorter range`,
      });
    }

    const finalPriority = VALID_PRIORITIES.has(priority) ? priority : "important";
    const finalListId = await resolveListId(pool, req.userId, listId);
    const trimmedTitle = title.trim();
    const finalNotes = notes || null;

    const insertedRecurring = await pool.query(
      `INSERT INTO recurring_tasks (user_id, list_id, title, notes, priority, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.userId, finalListId, trimmedTitle, finalNotes, finalPriority, startDate, endDate]
    );
    const recurringTask = insertedRecurring.rows[0];

    const valuePlaceholders = [];
    const params = [];
    let p = 1;
    for (let d = new Date(start); d <= end; d = new Date(d.getTime() + DAY_MS)) {
      const dateStr = d.toISOString().slice(0, 10);
      valuePlaceholders.push(
        `($${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++}, $${p++})`
      );
      params.push(req.userId, trimmedTitle, finalNotes, finalPriority, dateStr, finalListId, recurringTask.id);
    }

    const insertedTasks = await pool.query(
      `INSERT INTO tasks (user_id, title, notes, priority, due_date, list_id, recurring_task_id)
       VALUES ${valuePlaceholders.join(", ")} RETURNING *`,
      params
    );

    res.status(201).json({ recurringTask, tasks: insertedTasks.rows });
  } catch (err) {
    next(err);
  }
});

// Cancels a repeating series. Matches what the UI's confirm dialog tells the
// user: only days that haven't been completed yet are removed. Completed
// instances are detached from the series first (so the cascade delete below
// can't take them with it) and survive as normal, independent tasks — still
// checked off, still counted in badges/points/the productivity dashboard.
router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await pool.query(
      "SELECT id FROM recurring_tasks WHERE id = $1 AND user_id = $2",
      [req.params.id, req.userId]
    );
    if (!existing.rows[0]) return res.status(404).json({ error: "Repeating task not found" });

    await pool.query(
      "UPDATE tasks SET recurring_task_id = NULL WHERE recurring_task_id = $1 AND completed = 1",
      [req.params.id]
    );
    // Cascades to delete only the still-linked (i.e. incomplete) instances.
    await pool.query("DELETE FROM recurring_tasks WHERE id = $1", [req.params.id]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
