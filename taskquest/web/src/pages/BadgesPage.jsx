import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api.js";

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .listBadges()
      .then(({ badges }) => setBadges(badges))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-lg font-extrabold text-slate-800 dark:text-white">
          Achievements 🏆
        </h1>
        <Link
          to="/"
          className="rounded-full border-2 border-slate-200 bg-white px-4 py-2 font-display text-sm font-bold text-slate-600 transition hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          ← Back
        </Link>
      </div>

      {!loading && !error && (
        <p className="mb-6 text-sm text-slate-400 dark:text-slate-400">
          {earnedCount} of {badges.length} earned
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-2xl bg-urgent/10 px-4 py-2 text-sm font-semibold text-urgent">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-slate-400">Loading achievements...</p>
      ) : (
        <ul className="space-y-3">
          {badges.map((badge) => (
            <li
              key={badge.key}
              className={`card-pop flex items-center gap-4 p-4 transition ${
                badge.earned ? "" : "opacity-50"
              }`}
            >
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${
                  badge.earned
                    ? "bg-gradient-to-br from-brand-400 to-brand-600"
                    : "bg-slate-200 dark:bg-white/10 grayscale"
                }`}
              >
                {badge.earned ? badge.emoji : "🔒"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold text-slate-800 dark:text-white">
                  {badge.name}
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-400">{badge.description}</p>
                {badge.earned && badge.earnedAt && (
                  <p className="mt-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
