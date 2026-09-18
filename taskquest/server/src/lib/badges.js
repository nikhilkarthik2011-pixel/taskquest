// Achievement catalog. Every badge is earned once and stays earned forever
// (checked via a UNIQUE(user_id, badge_key) constraint + ON CONFLICT DO
// NOTHING) — no gameplay effect, just recognition.
const BADGES = [
  {
    key: "early_bird",
    name: "Early Bird",
    emoji: "🌅",
    description: "Complete a task before 9 AM",
  },
  {
    key: "zero_inbox",
    name: "Zero Inbox",
    emoji: "📭",
    description: "Finish every task in a list",
  },
  {
    key: "streak_master",
    name: "Streak Master",
    emoji: "🔥",
    description: "Reach a 14-day streak",
  },
  {
    key: "scholar",
    name: "Scholar",
    emoji: "🎓",
    description: "Complete 10 homework tasks",
  },
];

const BADGES_BY_KEY = Object.fromEntries(BADGES.map((b) => [b.key, b]));

async function awardBadge(pool, userId, badgeKey) {
  const result = await pool.query(
    `INSERT INTO user_badges (user_id, badge_key) VALUES ($1, $2)
     ON CONFLICT (user_id, badge_key) DO NOTHING
     RETURNING *`,
    [userId, badgeKey]
  );
  // Non-null only when this call is the one that actually inserted the row —
  // i.e. the badge was newly earned just now, not before.
  return result.rows[0] || null;
}

// Run right after a task is marked complete. Checks every badge condition
// that could plausibly have just become true and awards any that have.
// Returns the list of badges newly earned by this specific completion (
// usually empty) so the caller can show a "badge earned!" celebration.
async function checkBadgesOnComplete(pool, { userId, task, updatedUser, localHour }) {
  const newlyEarned = [];

  // Early Bird — completed before 9 AM. The server only knows UTC time, so
  // the client sends the user's own local hour (0-23) with the request.
  if (typeof localHour === "number" && localHour >= 0 && localHour < 9) {
    if (await awardBadge(pool, userId, "early_bird")) {
      newlyEarned.push(BADGES_BY_KEY.early_bird);
    }
  }

  // Streak Master — 14+ day streak.
  if (updatedUser.streak_count >= 14) {
    if (await awardBadge(pool, userId, "streak_master")) {
      newlyEarned.push(BADGES_BY_KEY.streak_master);
    }
  }

  if (task.list_id) {
    const { rows: listRows } = await pool.query("SELECT * FROM lists WHERE id = $1", [
      task.list_id,
    ]);
    const list = listRows[0];

    if (list) {
      // Zero Inbox — every task currently in this list is complete (and
      // there's at least one, so an empty list doesn't count).
      const { rows: counts } = await pool.query(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE completed = 0)::int AS remaining
         FROM tasks WHERE user_id = $1 AND list_id = $2`,
        [userId, task.list_id]
      );
      if (counts[0].total > 0 && counts[0].remaining === 0) {
        if (await awardBadge(pool, userId, "zero_inbox")) {
          newlyEarned.push(BADGES_BY_KEY.zero_inbox);
        }
      }

      // Scholar — 10 completed tasks in a list named "Homework" (however
      // it's capitalized; every account starts with one of these).
      if (list.name.trim().toLowerCase() === "homework") {
        const { rows: done } = await pool.query(
          `SELECT COUNT(*)::int AS count FROM tasks
           WHERE user_id = $1 AND list_id = $2 AND completed = 1`,
          [userId, task.list_id]
        );
        if (done[0].count >= 10) {
          if (await awardBadge(pool, userId, "scholar")) {
            newlyEarned.push(BADGES_BY_KEY.scholar);
          }
        }
      }
    }
  }

  return newlyEarned;
}

module.exports = { BADGES, BADGES_BY_KEY, checkBadgesOnComplete, awardBadge };
