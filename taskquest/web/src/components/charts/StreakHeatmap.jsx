function formatFullDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Sequential single-hue intensity (teal) — more tasks completed that day is
// darker, matching a familiar "streak calendar" pattern. Level 0 is neutral
// gray rather than the hue at 0% (a hue at zero reads as "some", not "none").
function levelClass(count) {
  if (count === 0) return "bg-slate-200 dark:bg-white/10";
  if (count === 1) return "bg-someday/30";
  if (count === 2) return "bg-someday/60";
  return "bg-someday";
}

export default function StreakHeatmap({ data, currentStreak }) {
  return (
    <div className="card-pop p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-bold text-slate-500 dark:text-slate-300">
          Streak — last 14 days
        </h2>
        <p className="flex items-center gap-1 font-display text-lg font-extrabold text-orange-500">
          🔥 {currentStreak}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.map((d) => (
          <div key={d.date} className="group relative">
            <div
              className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-100 dark:text-slate-800"
              role="tooltip"
            >
              {formatFullDate(d.date)}: {d.count} task{d.count === 1 ? "" : "s"}
            </div>
            <button
              type="button"
              aria-label={`${formatFullDate(d.date)}: ${d.count} task${d.count === 1 ? "" : "s"} completed`}
              className={`h-7 w-7 rounded-lg transition hover:scale-110 ${levelClass(d.count)}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] font-semibold text-slate-400">
        <span>Less</span>
        <span className="h-3 w-3 rounded bg-slate-200 dark:bg-white/10" />
        <span className="h-3 w-3 rounded bg-someday/30" />
        <span className="h-3 w-3 rounded bg-someday/60" />
        <span className="h-3 w-3 rounded bg-someday" />
        <span>More</span>
      </div>
    </div>
  );
}
