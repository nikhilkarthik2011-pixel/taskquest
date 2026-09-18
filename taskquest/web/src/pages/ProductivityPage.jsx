import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../lib/api.js";
import WeeklyXpChart from "../components/charts/WeeklyXpChart.jsx";
import StreakHeatmap from "../components/charts/StreakHeatmap.jsx";
import CategoryBreakdownChart from "../components/charts/CategoryBreakdownChart.jsx";
import ProductiveHourChart from "../components/charts/ProductiveHourChart.jsx";

export default function ProductivityPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-lg font-extrabold text-slate-800 dark:text-white">
          Productivity 📊
        </h1>
        <Link
          to="/"
          className="rounded-full border-2 border-slate-200 bg-white px-4 py-2 font-display text-sm font-bold text-slate-600 transition hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        >
          ← Back
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-2xl bg-urgent/10 px-4 py-2 text-sm font-semibold text-urgent">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-slate-400">Crunching your stats...</p>
      ) : stats ? (
        <div className="space-y-4">
          <WeeklyXpChart data={stats.weeklyXp} />
          <StreakHeatmap data={stats.streakGraph} currentStreak={user?.streak ?? 0} />
          <CategoryBreakdownChart data={stats.categoryBreakdown} />
          <ProductiveHourChart
            hourCounts={stats.hourCounts}
            mostProductiveHour={stats.mostProductiveHour}
          />
        </div>
      ) : null}
    </div>
  );
}
