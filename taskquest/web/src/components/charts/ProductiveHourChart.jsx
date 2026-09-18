function formatHour(h) {
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12} ${period}`;
}

function formatHourRange(h) {
  return `${formatHour(h)}–${formatHour((h + 1) % 24)}`;
}

// Emphasis form: 24 thin hour bars in a de-emphasis gray, with the single
// peak hour highlighted in the brand accent. The story is one hour, not 24
// competing series, so this isn't a categorical chart.
export default function ProductiveHourChart({ hourCounts, mostProductiveHour }) {
  if (mostProductiveHour === null) {
    return (
      <div className="card-pop p-5">
        <h2 className="font-display text-sm font-bold text-slate-500 dark:text-slate-300">
          Most productive hour
        </h2>
        <p className="mt-6 text-center text-sm text-slate-400">
          Complete a few more tasks and we'll figure out your best hour! ⏰
        </p>
      </div>
    );
  }

  const max = Math.max(1, ...hourCounts);

  return (
    <div className="card-pop p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-bold text-slate-500 dark:text-slate-300">
          Most productive hour
        </h2>
        <p className="font-display text-lg font-extrabold text-brand-600 dark:text-brand-200">
          {formatHourRange(mostProductiveHour)}
        </p>
      </div>

      <div className="flex h-16 items-end gap-[3px]">
        {hourCounts.map((count, hour) => {
          const isPeak = hour === mostProductiveHour;
          const heightPct = count === 0 ? 4 : Math.max(10, (count / max) * 100);
          return (
            <div key={hour} className="group relative h-full flex-1">
              <div
                className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-slate-100 dark:text-slate-800"
                role="tooltip"
              >
                {formatHour(hour)}: {count} task{count === 1 ? "" : "s"}
              </div>
              <button
                type="button"
                aria-label={`${formatHour(hour)}: ${count} task${count === 1 ? "" : "s"} completed`}
                className={`absolute bottom-0 w-full rounded-t-[3px] transition ${
                  isPeak ? "bg-brand-500 dark:bg-brand-400" : "bg-slate-200 dark:bg-white/10"
                }`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-slate-400">
        <span>12 AM</span>
        <span>12 PM</span>
        <span>11 PM</span>
      </div>
    </div>
  );
}
