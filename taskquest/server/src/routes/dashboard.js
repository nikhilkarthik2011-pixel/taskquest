const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { pointsForPriority } = require("../lib/gamification");

const router = express.Router();
router.use(requireAuth);

function dateStr(d) {
  return d.toISOString().slice(0, 10);
}

function lastNDayStrings(n) {
  const today = new Date();
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(dateStr(d));
  }
  return days;
}

// Aggregates everything the Productivity Dashboard needs from the same
// small per-user dataset — simplest to pull it once and reduce in JS rather
// than run four separate SQL aggregations.
router.get("/", async (req, res, next) => {
  try {
    const userId = req.userId;

    const { rows: completed } = await pool.query(
      `SELECT priority, completed_at, completed_local_hour, list_id
       FROM tasks
       WHERE user_id = $1 AND completed = 1 AND completed_at IS NOT NULL`,
      [userId]
    );

    // --- Weekly XP: last 7 days including today ---
    const week = lastNDayStrings(7);
    const xpByDay = Object.fromEntries(week.map((d) => [d, 0]));
    for (const row of completed) {
      const day = dateStr(new Date(row.completed_at));
      if (day in xpByDay) xpByDay[day] += pointsForPriority(row.priority);
    }
    const weeklyXp = week.map((date) => ({ date, xp: xpByDay[date] }));

    // --- Streak graph: last 14 days, tasks completed per day ---
    const fortnight = lastNDayStrings(14);
    const countByDay = Object.fromEntries(fortnight.map((d) => [d, 0]));
    for (const row of completed) {
      const day = dateStr(new Date(row.completed_at));
      if (day in countByDay) countByDay[day] += 1;
    }
    const streakGraph = fortnight.map((date) => ({ date, count: countByDay[date] }));

    // --- Category breakdown: completed tasks per list, all-time ---
    const { rows: lists } = await pool.query(
      "SELECT id, name, emoji FROM lists WHERE user_id = $1 ORDER BY position ASC, id ASC",
      [userId]
    );
    const countByList = {};
    for (const row of completed) {
      if (row.list_id) countByList[row.list_id] = (countByList[row.list_id] || 0) + 1;
    }
    // colorIndex is the list's position among the user's own lists (stable,
    // tied to the entity) — kept separate from the count-based sort below so
    // a list's chart color never shifts just because its rank changed.
    const categoryBreakdown = lists
      .map((list, colorIndex) => ({
        listId: list.id,
        name: list.name,
        emoji: list.emoji,
        count: countByList[list.id] || 0,
        colorIndex,
      }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    // --- Most productive hour (0-23) ---
    // Only completions made after this feature shipped carry a local hour,
    // so an account with older history may have partial (or no) data yet.
    const hourCounts = new Array(24).fill(0);
    let haveHourData = false;
    for (const row of completed) {
      if (typeof row.completed_local_hour === "number") {
        hourCounts[row.completed_local_hour] += 1;
        haveHourData = true;
      }
    }
    let mostProductiveHour = null;
    if (haveHourData) {
      let best = 0;
      for (let h = 1; h < 24; h++) if (hourCounts[h] > hourCounts[best]) best = h;
      if (hourCounts[best] > 0) mostProductiveHour = best;
    }

    res.json({
      weeklyXp,
      streakGraph,
      categoryBreakdown,
      hourCounts,
      mostProductiveHour,
      totalCompleted: completed.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
