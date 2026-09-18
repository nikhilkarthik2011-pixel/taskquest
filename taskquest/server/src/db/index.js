const { Pool } = require("pg");
const { DEFAULT_AVATAR_KEY } = require("../lib/avatars");

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "DATABASE_URL is not set. Create a free Postgres database (e.g. at neon.tech) " +
      "and put its connection string in server/.env as DATABASE_URL."
  );
}

// Hosted Postgres providers (Neon, Render, etc.) require SSL; a local
// Postgres on your own machine usually doesn't.
const isLocal = connectionString && connectionString.includes("localhost");

const pool = new Pool({
  connectionString,
  ssl: connectionString && !isLocal ? { rejectUnauthorized: false } : false,
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      streak_count INTEGER NOT NULL DEFAULT 0,
      last_completed_date TEXT,
      avatar TEXT NOT NULL DEFAULT '${DEFAULT_AVATAR_KEY}',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lists (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '📋',
      position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS recurring_tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      list_id INTEGER REFERENCES lists(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      notes TEXT,
      priority TEXT NOT NULL DEFAULT 'important' CHECK (priority IN ('urgent', 'important', 'someday')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_key TEXT NOT NULL,
      earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, badge_key)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      notes TEXT,
      priority TEXT NOT NULL DEFAULT 'important' CHECK (priority IN ('urgent', 'important', 'someday')),
      due_date TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      completed_at TIMESTAMP,
      completed_local_hour INTEGER,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      position INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Additive migrations — safe to run every time the server starts, even
  // against a database that was created before lists/recurring tasks existed.
  await pool.query(
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS list_id INTEGER REFERENCES lists(id) ON DELETE SET NULL;`
  );
  await pool.query(
    `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS recurring_task_id INTEGER REFERENCES recurring_tasks(id) ON DELETE CASCADE;`
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT NOT NULL DEFAULT '${DEFAULT_AVATAR_KEY}';`
  );
  // Powers the "most productive hour" chart. Only set going forward — tasks
  // completed before this existed just won't have one, which the dashboard
  // route treats as "no data yet" rather than midnight.
  await pool.query(`ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_local_hour INTEGER;`);
  // Secret, per-account Dev Tools unlock — see lib/devToolsUnlock.js for how
  // it gets flipped. Nobody's account but their own is ever touched by it.
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS dev_tools_enabled BOOLEAN NOT NULL DEFAULT false;`
  );

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON tasks(list_id);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);`);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_recurring_tasks_user_id ON recurring_tasks(user_id);`
  );
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);`);

  await backfillDefaultLists();
}

// Safety net for accounts created before lists existed (or any account that
// somehow ends up with zero lists): give them starter lists and attach any
// orphaned tasks to the first one. New signups get their lists created
// directly in the signup route instead — this just keeps old data valid.
async function backfillDefaultLists() {
  const { rows: users } = await pool.query(`SELECT id FROM users`);

  for (const user of users) {
    const { rows: lists } = await pool.query(
      `SELECT id FROM lists WHERE user_id = $1 ORDER BY position ASC, id ASC`,
      [user.id]
    );

    let firstListId;
    if (lists.length === 0) {
      const inserted = await pool.query(
        `INSERT INTO lists (user_id, name, emoji, position)
         VALUES ($1, 'Homework', '📚', 0), ($1, 'Chores', '🧹', 1)
         RETURNING id, position`,
        [user.id]
      );
      firstListId = inserted.rows.sort((a, b) => a.position - b.position)[0].id;
    } else {
      firstListId = lists[0].id;
    }

    await pool.query(`UPDATE tasks SET list_id = $1 WHERE user_id = $2 AND list_id IS NULL`, [
      firstListId,
      user.id,
    ]);
  }
}

module.exports = { pool, init };
