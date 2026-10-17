const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { JWT_SECRET, requireAuth } = require("../middleware/auth");
const { levelForPoints, pointsIntoCurrentLevel } = require("../lib/gamification");
const { isAvatarUnlocked } = require("../lib/avatars");

const router = express.Router();

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    points: user.points,
    streak: user.streak_count,
    level: levelForPoints(user.points),
    pointsIntoLevel: pointsIntoCurrentLevel(user.points),
    avatar: user.avatar,
    devToolsEnabled: !!user.dev_tools_enabled,
  };
}

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (existing.rows.length) {
      return res.status(409).json({ error: "An account with that email already exists" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const inserted = await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING *",
      [name.trim(), email.toLowerCase(), passwordHash]
    );

    const user = inserted.rows[0];

    // Starter lists so new users see the list feature in action instead of
    // an empty screen — they can rename, delete, or add their own anytime.
    await pool.query(
      `INSERT INTO lists (user_id, name, emoji, position)
       VALUES ($1, 'Homework', '📚', 0), ($1, 'Chores', '🧹', 1)`,
      [user.id]
    );

    const token = signToken(user.id);

    res.status(201).json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    const user = result.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user), token: signToken(user.id) });
  } catch (err) {
    next(err);
  }
});

router.patch("/me/avatar", requireAuth, async (req, res, next) => {
  try {
    const { avatar } = req.body || {};
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [req.userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const level = levelForPoints(user.points);
    if (!avatar || !isAvatarUnlocked(level, avatar)) {
      return res.status(400).json({ error: "That avatar isn't unlocked yet" });
    }

    const updated = await pool.query(
      "UPDATE users SET avatar = $1 WHERE id = $2 RETURNING *",
      [avatar, req.userId]
    );

    res.json({ user: publicUser(updated.rows[0]) });
  } catch (err) {
    next(err);
  }
});

module.exports = { router, publicUser };
