// Points awarded per priority tier when a task is completed.
const POINTS_BY_PRIORITY = {
  urgent: 15,
  important: 10,
  someday: 5,
};

function pointsForPriority(priority) {
  return POINTS_BY_PRIORITY[priority] ?? POINTS_BY_PRIORITY.important;
}

// Level curve: level N requires N*100 total points (level 1 starts at 0).
function levelForPoints(points) {
  return Math.floor(points / 100) + 1;
}

function pointsIntoCurrentLevel(points) {
  return points % 100;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Given a user's current streak/last-completed-date, compute the updated
// streak after they complete a task "today".
function nextStreak(user) {
  const today = todayStr();
  if (user.last_completed_date === today) {
    // Already completed something today; streak doesn't change.
    return user.streak_count;
  }
  if (user.last_completed_date === yesterdayStr()) {
    return user.streak_count + 1;
  }
  // Missed a day (or first ever completion): streak resets to 1.
  return 1;
}

module.exports = {
  POINTS_BY_PRIORITY,
  pointsForPriority,
  levelForPoints,
  pointsIntoCurrentLevel,
  todayStr,
  nextStreak,
};
