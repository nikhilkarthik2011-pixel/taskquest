const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { todayStr } = require("../lib/gamification");
const { BADGES, BADGES_BY_KEY, awardBadge } = require("../lib/badges");
const { publicUser } = require("./auth");

const router = express.Router();

// Off by default, everywhere, for every account. Two independent ways to
// turn it on:
//  1. The server's own .env sets ENABLE_DEV_TOOLS=true — turns it on for
//     every account on this server. Meant for your own local machine.
//  2. An account unlocks it for itself by creating a list named
//     "Manchester2023" with the basketball emoji (see lib/devToolsUnlock.js)
//     — no .env editing needed, and it only ever affects that one account.
// A request needs to be logged in either way, and when neither condition is
// met these routes 404 instead of refusing, so a deployed server doesn't
// reveal they exist at all.
router.use(requireAuth);
router.use(async (req, res, next) => {
  try {
    if (process.env.ENABLE_DEV_TOOLS === "true") return next();
    const result = await pool.query("SELECT dev_tools_enabled FROM users WHERE id = $1", [
      req.userId,
    ]);
    if (!result.rows[0]?.dev_tools_enabled) {
      return res.status(404).json({ error: "Not found" });
    }
    next();
  } catch (err) {
    next(err);
  }
});

async function loadUser(userId) {
  const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
  return result.rows[0];
}

// Nudge points by a signed amount (negative to subtract). Floors at 0.
router.post("/points", async (req, res, next) => {
  try {
    const { delta } = req.body || {};
    if (typeof delta !== "number" || !Number.isFinite(delta)) {
      return res.status(400).json({ error: "delta must be a number" });
    }
    const updated = await pool.query(
      "UPDATE users SET points = GREATEST(0, points + $1) WHERE id = $2 RETURNING *",
      [Math.round(delta), req.userId]
    );
    res.json({ user: publicUser(updated.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// Jump straight to a level (sets points to that level's floor: 100 * (level-1)).
router.post("/set-level", async (req, res, next) => {
  try {
    const { level } = req.body || {};
    if (typeof level !== "number" || level < 1 || level > 999) {
      return res.status(400).json({ error: "level must be a number >= 1" });
    }
    const points = (Math.floor(level) - 1) * 100;
    const updated = await pool.query("UPDATE users SET points = $1 WHERE id = $2 RETURNING *", [
      points,
      req.userId,
    ]);
    res.json({ user: publicUser(updated.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// Set the streak directly. last_completed_date is set to today so the next
// real task completion reads as "already active today" instead of looking
// like a gap and resetting what you just set.
router.post("/set-streak", async (req, res, next) => {
  try {
    const { count } = req.body || {};
    if (typeof count !== "number" || count < 0) {
      return res.status(400).json({ error: "count must be a number >= 0" });
    }
    const updated = await pool.query(
      "UPDATE users SET streak_count = $1, last_completed_date = $2 WHERE id = $3 RETURNING *",
      [Math.floor(count), todayStr(), req.userId]
    );
    res.json({ user: publicUser(updated.rows[0]) });
  } catch (err) {
    next(err);
  }
});

// Award one specific badge immediately, bypassing its real condition.
router.post("/award-badge", async (req, res, next) => {
  try {
    const { key } = req.body || {};
    if (!BADGES_BY_KEY[key]) {
      return res.status(400).json({ error: `Unknown badge key. Valid keys: ${BADGES.map((b) => b.key).join(", ")}` });
    }
    await awardBadge(pool, req.userId, key);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Clear every earned badge for this account so you can re-trigger them.
router.post("/reset-badges", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM user_badges WHERE user_id = $1", [req.userId]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Full reset of gamification state — points, streak, avatar, badges — back
// to a brand-new-account baseline. Does NOT touch tasks or lists.
router.post("/reset-progress", async (req, res, next) => {
  try {
    await pool.query(
      "UPDATE users SET points = 0, streak_count = 0, last_completed_date = NULL, avatar = 'hatchling' WHERE id = $1",
      [req.userId]
    );
    await pool.query("DELETE FROM user_badges WHERE user_id = $1", [req.userId]);
    const user = await loadUser(req.userId);
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
