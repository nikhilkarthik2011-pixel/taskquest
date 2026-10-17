import { PRIORITIES } from "../lib/priorities.js";

// Today's date as YYYY-MM-DD in the user's local timezone, matching how
// due dates are stored.
function todayString() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function TaskCard({ task, list, onToggle, onDelete, onCancelRecurring }) {
  const p = PRIORITIES[task.priority] || PRIORITIES.important;
  const dueToday = !task.completed && task.due_date?.slice(0, 10) === todayString();

  return (
    <li
      className={`card-pop animate-pop-in flex items-start gap-3 p-4 transition ${
        task.completed ? "opacity-60" : ""
      } ${
        dueToday
          ? "border-amber-400 bg-amber-50 dark:border-amber-400/60 dark:bg-amber-400/10"
          : ""
      }`}
    >
      <button
        onClick={() => onToggle(task)}
        aria-label={task.completed ? "Mark task incomplete" : "Mark task complete"}
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
          task.completed
            ? "border-someday bg-someday text-white"
            : "border-slate-300 text-transparent hover:border-brand-500 dark:border-white/20"
        }`}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`font-display font-bold text-slate-800 dark:text-white ${
              task.completed ? "line-through decoration-2" : ""
            }`}
          >
            {task.title}
          </p>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${p.chip}`}
          >
            {p.emoji} {p.label}
          </span>
          {list && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 dark:bg-white/10 dark:text-slate-300">
              {list.emoji} {list.name}
            </span>
          )}
          {task.recurring_task_id && (
            <button
              type="button"
              onClick={() => onCancelRecurring(task)}
              title="Stop repeating this task"
              className="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[11px] font-bold text-brand-600 transition hover:bg-brand-500/20 dark:text-brand-200"
            >
              🔁 repeating
            </button>
          )}
        </div>
        {task.notes && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">{task.notes}</p>
        )}
        {task.due_date &&
          (dueToday ? (
            <p className="mt-1 text-xs font-bold text-amber-600 dark:text-amber-300">
              📅 Due today
            </p>
          ) : (
            <p className="mt-1 text-xs font-semibold text-slate-400">Due {task.due_date}</p>
          ))}
      </div>

      <button
        onClick={() => onDelete(task)}
        aria-label="Delete task"
        className="shrink-0 rounded-full p-2 text-slate-300 transition hover:bg-urgent/10 hover:text-urgent"
      >
        ✕
      </button>
    </li>
  );
}
