import { colorForListIndex } from "../../lib/chartColors.js";

// Horizontal bar chart, one bar per list. Each row's own emoji+name label is
// always visible (not just on hover), which doubles as the chart's legend —
// no separate legend box needed. Colors are keyed to each list's stable
// position (colorIndex from the API), not its rank in this sorted-by-count
// list, so a color never gets reassigned just because counts shift.
export default function CategoryBreakdownChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="card-pop p-5">
        <h2 className="font-display text-sm font-bold text-slate-500 dark:text-slate-300">
          Category breakdown
        </h2>
        <p className="mt-6 text-center text-sm text-slate-400">
          Complete tasks in different lists to see your breakdown here! 📊
        </p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <div className="card-pop p-5">
      <h2 className="mb-4 font-display text-sm font-bold text-slate-500 dark:text-slate-300">
        Category breakdown
      </h2>

      <div className="space-y-3">
        {data.map((item) => {
          const widthPct = Math.max(4, (item.count / max) * 100);
          const color = colorForListIndex(item.colorIndex);
          return (
            <div key={item.listId} className="group relative flex items-center gap-2">
              <span className="w-24 shrink-0 truncate text-sm font-bold text-slate-600 dark:text-slate-200">
                {item.emoji} {item.name}
              </span>
              <div className="h-5 flex-1 rounded-full bg-slate-100 dark:bg-white/5">
                <div
                  className="h-5 rounded-full transition-all"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-sm font-bold text-slate-500 dark:text-slate-300">
                {item.count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
