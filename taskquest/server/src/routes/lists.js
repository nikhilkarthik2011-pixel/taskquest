const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { publicUser } = require("./auth");
const { maybeUnlockOnCreate, maybeRelockOnDelete } = require("../lib/devToolsUnlock");

const router = express.Router();
router.use(requireAuth);

async function loadUser(userId) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
  return result.rows[0];
}

router.get("/", async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM lists WHERE user_id = $1 ORDER BY position ASC, id ASC",
      [req.userId]
    );
    res.json({ lists: result.rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, emoji } = req.body || {};
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "List name is required" });
    }

    const posResult = await pool.query(
      "SELECT COALESCE(MAX(position), -1) + 1 AS next FROM lists WHERE user_id = $1",
      [req.userId]
    );

    const inserted = await pool.query(
      "INSERT INTO lists (user_id, name, emoji, position) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.userId, name.trim(), emoji || "📋", posResult.rows[0].next]
    );
    const list = inserted.rows[0];

    await maybeUnlockOnCreate(pool, req.userId, list);
    const user = await loadUser(req.userId);

    res.status(201).json({ list, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existing = await pool.query("SELECT * FROM lists WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);
    if (!existing.rows[0]) return res.status(404).json({ error: "List not found" });

    const { name, emoji } = req.body || {};
    const finalName = name !== undefined && name.trim() ? name.trim() : existing.rows[0].name;
    const finalEmoji = emoji !== undefined ? emoji : existing.rows[0].emoji;

    const updated = await pool.query(
      "UPDATE lists SET name = $1, emoji = $2 WHERE id = $3 RETURNING *",
      [finalName, finalEmoji, req.params.id]
    );

    res.json({ list: updated.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    // Check existence first — otherwise deleting a list that isn't yours (or
    // doesn't exist) at a time you only have one real list incorrectly
    // returns "you need at least one list" instead of "not found".
    const existing = await pool.query("SELECT * FROM lists WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.userId,
    ]);
    if (!existing.rows[0]) return res.status(404).json({ error: "List not found" });

    const countResult = await pool.query("SELECT COUNT(*)::int AS count FROM lists WHERE user_id = $1", [
      req.userId,
    ]);
    if (countResult.rows[0].count <= 1) {
      return res.status(400).json({ error: "You need at least one list — create another before deleting this one." });
    }

    // Tasks in this list aren't deleted — they just become unassigned (still
    // visible under "All"). See the tasks table's list_id foreign key.
    await pool.query("DELETE FROM lists WHERE id = $1", [req.params.id]);

    await maybeRelockOnDelete(pool, req.userId, existing.rows[0]);
    const user = await loadUser(req.userId);

    res.json({ ok: true, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
