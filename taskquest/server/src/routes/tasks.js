const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { pointsForPriority, nextStreak, todayStr } = require("../lib/gamification");
const { resolveListId } = require("../lib/lists");
const { checkBadgesOnComplete } = require("../lib/badges");
const { publicUser } = require("./auth");

const router = express.Router();
router.use(requireAuth);

const VALID_PRIORITIES = new Set(["urgent", "important", "someday"]);

async function loadTask(id, userId) {
  const result = await pool.query("SELECT * FROM tasks WHERE id = $1 AND user_id = $2", [
    id,
    userId,
  ]);
  return result.rows[0];
}

async function loadUser(userId) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
  return result.rows[0];
}

// List tasks: most urgent first, dated tasks bubble up soonest-first within
// a priority tier (this is what makes a repeating task's daily instances
// show up in day order), undated tasks after those, newest first.
router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT * FROM tasks WHERE user_id = $1
       ORDER BY completed ASC,
                CASE priority WHEN 'urgent' THEN 0 WHEN 'important' THEN 1 ELSE 2 END ASC,
                CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
                due_date ASC,
                position ASC,
                created_at DESC`,
      [req.userId]
    );
    res.json({ tasks: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, notes, priority, dueDate, listId } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    const finalPriority = VALID_PRIORITIES.has(priority) ? priority : "important";
    const finalListId = await resolveListId(pool, req.userId, listId);

    const inserted = await pool.query(
      `INSERT INTO tasks (user_id, title, notes, priority, due_date, list_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.userId, title.trim(), notes || null, finalPriority, dueDate || null, finalListId]
    );

    res.status(201).json({ task: inserted.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const task = await loadTask(req.params.id, req.userId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const { title, notes, priority, dueDate, listId } = req.body || {};
    const finalTitle = title !== undefined ? title.trim() : task.title;
    const finalPriority = VALID_PRIORITIES.has(priority) ? priority : task.priority;
    const finalListId =
      listId !== undefined ? await resolveListId(pool, req.userId, listId) : task.list_id;

    if (!finalTitle) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    const updated = await pool.query(
      `UPDATE tasks SET title = $1, notes = $2, priority = $3, due_date = $4, list_id = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [
        finalTitle,
        notes !== undefined ? notes : task.notes,
        finalPriority,
        dueDate !== undefined ? dueDate : task.due_date,
        finalListId,
        task.id,
        req.userId,
      ]
    );

    res.json({ task: updated.rows[0] });
  } catch (err) {
    next(err);
  }
});

// Toggle completion. Completing awards points + updates streak;
// un-completing reverses the points (streak is left as-is).
router.patch("/:id/complete", async (req, res, next) => {
  try {
    const task = await loadTask(req.params.id, req.userId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const user = await loadUser(req.userId);
    const willComplete = !task.completed;
    const earned = pointsForPriority(task.priority);
    const { localHour } = req.body || {};

    if (willComplete) {
      const streak = nextStreak(user);
      await pool.query(
        "UPDATE users SET points = points + $1, streak_count = $2, last_completed_date = $3 WHERE id = $4",
        [earned, streak, todayStr(), req.userId]
      );
      await pool.query(
        "UPDATE tasks SET completed = 1, completed_at = NOW(), completed_local_hour = $2 WHERE id = $1",
        [task.id, typeof localHour === "number" ? localHour : null]
      );
    } else {
      await pool.query("UPDATE users SET points = GREATEST(0, points - $1) WHERE id = $2", [
        earned,
        req.userId,
      ]);
      await pool.query(
        "UPDATE tasks SET completed = 0, completed_at = NULL, completed_local_hour = NULL WHERE id = $1",
        [task.id]
      );
    }

    const updatedUser = await loadUser(req.userId);
    const updatedTask = await loadTask(task.id, req.userId);

    let newBadges = [];
    if (willComplete) {
      newBadges = await checkBadgesOnComplete(pool, {
        userId: req.userId,
        task: updatedTask,
        updatedUser,
        localHour: typeof localHour === "number" ? localHour : undefined,
      });
    }

    res.json({ task: updatedTask, user: publicUser(updatedUser), newBadges });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const task = await loadTask(req.params.id, req.userId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    await pool.query("DELETE FROM tasks WHERE id = $1 AND user_id = $2", [task.id, req.userId]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
