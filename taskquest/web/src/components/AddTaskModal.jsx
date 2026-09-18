import { useState } from "react";
import { PRIORITIES, PRIORITY_ORDER } from "../lib/priorities.js";

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateStr, amount) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + amount);
  return toDateStr(dt);
}

const TODAY = toDateStr(new Date());

export default function AddTaskModal({ onClose, onCreate, onCreateRecurring, lists, defaultListId }) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("important");
  const [dueDate, setDueDate] = useState("");
  const [listId, setListId] = useState(defaultListId ?? lists[0]?.id ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [repeats, setRepeats] = useState(false);
  const [repeatMode, setRepeatMode] = useState("days"); // days | until
  const [repeatDays, setRepeatDays] = useState(10);
  const [repeatUntil, setRepeatUntil] = useState(addDays(TODAY, 9));

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Give your task a title first!");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      if (repeats) {
        const endDate = repeatMode === "days" ? addDays(TODAY, Math.max(1, repeatDays) - 1) : repeatUntil;
        await onCreateRecurring({
          title,
          notes,
          priority,
          listId,
          startDate: TODAY,
          endDate,
        });
      } else {
        await onCreate({ title, notes, priority, dueDate: dueDate || undefined, listId });
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="animate-pop-in max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-[#1f1640] sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-slate-800 dark:text-white">
            New quest ✨
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            What do you need to do?
          </span>
          <input
            autoFocus
            className="input-pop"
            placeholder="e.g. Finish history essay"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
        </label>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Notes (optional)
          </span>
          <textarea
            className="input-pop resize-none"
            rows={2}
            placeholder="Any details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={300}
          />
        </label>

        {lists.length > 0 && (
          <div className="mb-3">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
              List
            </span>
            <div className="flex flex-wrap gap-2">
              {lists.map((list) => {
                const active = listId === list.id;
                return (
                  <button
                    type="button"
                    key={list.id}
                    onClick={() => setListId(list.id)}
                    className={`rounded-2xl border-2 px-3 py-1.5 font-display text-sm font-bold transition ${
                      active
                        ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-200"
                        : "border-slate-200 text-slate-400 dark:border-white/10"
                    }`}
                  >
                    {list.emoji} {list.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-3">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Priority
          </span>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITY_ORDER.map((key) => {
              const p = PRIORITIES[key];
              const active = priority === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setPriority(key)}
                  className={`rounded-2xl border-2 px-2 py-2 text-center font-display text-sm font-bold transition ${
                    active
                      ? `${p.chip} border-current`
                      : "border-slate-200 text-slate-400 dark:border-white/10"
                  }`}
                >
                  <div className="text-lg">{p.emoji}</div>
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-4 rounded-2xl border-2 border-slate-200 p-3 dark:border-white/10">
          <label className="flex cursor-pointer items-center justify-between">
            <span className="font-display text-sm font-bold text-slate-700 dark:text-slate-200">
              🔁 Repeat every day
            </span>
            <input
              type="checkbox"
              className="sr-only"
              checked={repeats}
              onChange={(e) => setRepeats(e.target.checked)}
            />
            <span
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                repeats ? "bg-brand-500" : "bg-slate-300 dark:bg-white/20"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                  repeats ? "left-5" : "left-0.5"
                }`}
              />
            </span>
          </label>

          {repeats ? (
            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRepeatMode("days")}
                  className={`flex-1 rounded-xl border-2 px-2 py-1.5 font-display text-xs font-bold transition ${
                    repeatMode === "days"
                      ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-200"
                      : "border-slate-200 text-slate-400 dark:border-white/10"
                  }`}
                >
                  For a number of days
                </button>
                <button
                  type="button"
                  onClick={() => setRepeatMode("until")}
                  className={`flex-1 rounded-xl border-2 px-2 py-1.5 font-display text-xs font-bold transition ${
                    repeatMode === "until"
                      ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-200"
                      : "border-slate-200 text-slate-400 dark:border-white/10"
                  }`}
                >
                  Until a date
                </button>
              </div>

              {repeatMode === "days" ? (
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-300">Repeat for</span>
                  <input
                    type="number"
                    min={1}
                    max={90}
                    className="input-pop w-20 text-center"
                    value={repeatDays}
                    onChange={(e) => setRepeatDays(Number(e.target.value))}
                  />
                  <span className="text-slate-500 dark:text-slate-300">days, starting today</span>
                </label>
              ) : (
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 dark:text-slate-300">Every day until</span>
                  <input
                    type="date"
                    min={TODAY}
                    className="input-pop"
                    value={repeatUntil}
                    onChange={(e) => setRepeatUntil(e.target.value)}
                  />
                </label>
              )}
              <p className="text-xs text-slate-400">
                Creates one task per day — check each one off as you go, just like any other task.
              </p>
            </div>
          ) : (
            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                Due date (optional)
              </span>
              <input
                type="date"
                className="input-pop"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </label>
          )}
        </div>

        {error && <p className="mb-3 text-sm font-semibold text-urgent">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-pop w-full bg-gradient-to-r from-brand-500 to-brand-600 disabled:opacity-60"
        >
          {submitting ? "Adding..." : repeats ? "Add repeating task" : "Add task"}
        </button>
      </form>
    </div>
  );
}
