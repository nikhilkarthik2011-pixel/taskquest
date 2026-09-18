import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import { isDevToolsUnlocked } from "../lib/devTools.js";

export default function DevToolsPage() {
  const { user, refresh } = useAuth();
  const [badges, setBadges] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [levelInput, setLevelInput] = useState("");
  const [streakInput, setStreakInput] = useState("");

  const unlocked = isDevToolsUnlocked(user);

  useEffect(() => {
    if (unlocked) loadBadges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  // No secret list, no env override — nothing to see here. Bounce home
  // instead of showing an empty or broken-looking page.
  if (!unlocked) return <Navigate to="/" replace />;

  function loadBadges() {
    api.listBadges().then(({ badges }) => setBadges(badges)).catch(() => {});
  }

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await action();
      await refresh();
      loadBadges();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-lg font-extrabold text-slate-800 dark:text-white">
          Dev Tools 🛠️
        </h1>
        <Link
          to="/"
          className="rounded-full border-2 border-slate-200 bg-white px-4 py-2 font-display text-sm font-bold text-slate-600 transition hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          ← Back
        </Link>
      </div>

      <div className="mb-4 rounded-2xl bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-600 dark:text-orange-300">
        ⚠️ Only visible because you unlocked it on this account. These buttons change your real
        account data (points, streak, badges, avatar) — not real progress, just a shortcut for
        testing. Delete the list that unlocked this to hide it again.
      </div>

      {error && (
        <p className="mb-4 rounded-2xl bg-urgent/10 px-4 py-2 text-sm font-semibold text-urgent">
          {error}
        </p>
      )}

      {user && (
        <div className="card-pop mb-4 p-5 text-sm text-slate-500 dark:text-slate-300">
          Currently: <span className="font-bold text-slate-700 dark:text-white">Level {user.level}</span>{" "}
          · {user.points} points · {user.streak}-day streak · avatar{" "}
          <span className="font-bold text-slate-700 dark:text-white">{user.avatar}</span>
        </div>
      )}

      {/* Points / level */}
      <div className="card-pop mb-4 p-5">
        <h2 className="mb-3 font-display text-sm font-bold text-slate-500 dark:text-slate-300">
          Points &amp; level
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {[15, 50, 200, 1000].map((amt) => (
            <button
              key={amt}
              type="button"
              disabled={busy}
              onClick={() => run(() => api.devAddPoints(amt))}
              className="rounded-2xl border-2 border-slate-200 px-3 py-1.5 font-display text-sm font-bold text-slate-600 transition hover:border-brand-400 disabled:opacity-50 dark:border-white/10 dark:text-slate-200"
            >
              +{amt}
            </button>
          ))}
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => api.devAddPoints(-9999))}
            className="rounded-2xl border-2 border-slate-200 px-3 py-1.5 font-display text-sm font-bold text-slate-600 transition hover:border-brand-400 disabled:opacity-50 dark:border-white/10 dark:text-slate-200"
          >
            Reset to 0
          </button>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            placeholder="Jump to level..."
            value={levelInput}
            onChange={(e) => setLevelInput(e.target.value)}
            className="input-pop w-40"
          />
          <button
            type="button"
            disabled={busy || !levelInput}
            onClick={() => run(() => api.devSetLevel(Number(levelInput)))}
            className="btn-pop bg-gradient-to-r from-brand-500 to-brand-600 disabled:opacity-50"
          >
            Go
          </button>
        </div>
      </div>

      {/* Streak */}
      <div className="card-pop mb-4 p-5">
        <h2 className="mb-3 font-display text-sm font-bold text-slate-500 dark:text-slate-300">
          Streak
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {[7, 13, 14, 30].map((n) => (
            <button
              key={n}
              type="button"
              disabled={busy}
              onClick={() => run(() => api.devSetStreak(n))}
              className="rounded-2xl border-2 border-slate-200 px-3 py-1.5 font-display text-sm font-bold text-slate-600 transition hover:border-brand-400 disabled:opacity-50 dark:border-white/10 dark:text-slate-200"
            >
              Set to {n}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Custom streak..."
            value={streakInput}
            onChange={(e) => setStreakInput(e.target.value)}
            className="input-pop w-40"
          />
          <button
            type="button"
            disabled={busy || streakInput === ""}
            onClick={() => run(() => api.devSetStreak(Number(streakInput)))}
            className="btn-pop bg-gradient-to-r from-brand-500 to-brand-600 disabled:opacity-50"
          >
            Go
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="card-pop mb-4 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-slate-500 dark:text-slate-300">
            Badges
          </h2>
          <button
            type="button"
            disabled={busy}
            onClick={() => run(() => api.devResetBadges())}
            className="text-xs font-bold text-urgent hover:underline disabled:opacity-50"
          >
            Reset all badges
          </button>
        </div>
        <div className="space-y-2">
          {badges.map((badge) => (
            <div key={badge.key} className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-200">
                {badge.emoji} {badge.name}
                {badge.earned && (
                  <span className="ml-2 text-xs font-bold text-brand-600 dark:text-brand-300">
                    earned
                  </span>
                )}
              </span>
              <button
                type="button"
                disabled={busy || badge.earned}
                onClick={() => run(() => api.devAwardBadge(badge.key))}
                className="shrink-0 rounded-xl border-2 border-slate-200 px-3 py-1 font-display text-xs font-bold text-slate-600 transition hover:border-brand-400 disabled:opacity-40 dark:border-white/10 dark:text-slate-200"
              >
                Award
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Full reset */}
      <div className="card-pop p-5">
        <h2 className="mb-2 font-display text-sm font-bold text-slate-500 dark:text-slate-300">
          Full reset
        </h2>
        <p className="mb-3 text-xs text-slate-400">
          Sets points, streak, and avatar back to a fresh account, and clears all badges. Your
          tasks and lists are left alone.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (window.confirm("Reset points, streak, avatar, and badges back to a fresh account?")) {
              run(() => api.devResetProgress());
            }
          }}
          className="btn-pop bg-urgent disabled:opacity-50"
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}
