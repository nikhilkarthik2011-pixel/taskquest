const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function formatDayLabel(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return DAY_LETTERS[date.getDay()];
}

function formatFullDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

// Single-series bar chart: one hue (the app's brand accent), direct value
// labels on every bar since there are only 7 of them, no axis ticks needed.
export default function WeeklyXpChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.xp, 0);
  const max = Math.max(1, ...data.map((d) => d.xp));

  if (total === 0) {
    return (
      <div className="card-pop p-5">
        <h2 className="font-display text-sm font-bold text-slate-500 dark:text-slate-300">
          This week's XP
        </h2>
        <p className="mt-6 text-center text-sm text-slate-400">
          Complete a task to start earning XP this week! ✨
        </p>
      </div>
    );
  }

  return (
    <div className="card-pop p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-bold text-slate-500 dark:text-slate-300">
          This week's XP
        </h2>
        <p className="font-display text-lg font-extrabold text-brand-600 dark:text-brand-200">
          {total} XP
        </p>
      </div>

      <div className="flex justify-between gap-2">
        {data.map((d) => {
          const heightPct = d.xp === 0 ? 4 : Math.max(8, (d.xp / max) * 100);
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center">
              <span className="mb-1 h-4 text-center text-[10px] font-bold text-slate-400 dark:text-slate-400">
                {d.xp > 0 ? d.xp : ""}
              </span>

              {/* Fixed-height track so the bar's percentage height resolves
                  against a definite size, not an ambiguous stretched flex item. */}
              <div className="group relative flex h-20 w-full items-end justify-center">
                <div
                  className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-100 dark:text-slate-800"
                  role="tooltip"
                >
                  {formatFullDate(d.date)}: {d.xp} XP
                </div>
                <button
                  type="button"
                  aria-label={`${formatFullDate(d.date)}: ${d.xp} XP`}
                  className="w-full max-w-[28px] rounded-t-[4px] bg-brand-500 transition hover:bg-brand-600 dark:bg-brand-400 dark:hover:bg-brand-300"
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              <span className="mt-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-400">
                {formatDayLabel(d.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
