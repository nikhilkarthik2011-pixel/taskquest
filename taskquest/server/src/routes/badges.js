const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { BADGES } = require("../lib/badges");

const router = express.Router();
router.use(requireAuth);

// Full catalog, each one flagged with whether (and when) this user earned it.
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT badge_key, earned_at FROM user_badges WHERE user_id = $1",
      [req.userId]
    );
    const earnedByKey = Object.fromEntries(rows.map((r) => [r.badge_key, r.earned_at]));

    const badges = BADGES.map((badge) => ({
      ...badge,
      earned: Boolean(earnedByKey[badge.key]),
      earnedAt: earnedByKey[badge.key] || null,
    }));

    res.json({ badges });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
