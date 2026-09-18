import { useState } from "react";

const EMOJI_CHOICES = ["📋", "📚", "🧹", "🏀", "🎨", "💼", "🎭", "🐾", "🧪", "🎮", "💰", "🌟"];

export default function NewListModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give your list a name first!");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onCreate({ name, emoji });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <form
        onSubmit={handleSubmit}
        className="animate-pop-in w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-[#1f1640] sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-slate-800 dark:text-white">
            New list 🗂️
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            List name
          </span>
          <input
            autoFocus
            className="input-pop"
            placeholder="e.g. Soccer, Job applications..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
        </label>

        <div className="mb-4">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            Icon
          </span>
          <div className="flex flex-wrap gap-2">
            {EMOJI_CHOICES.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 text-lg transition ${
                  emoji === e
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-slate-200 dark:border-white/10"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mb-3 text-sm font-semibold text-urgent">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-pop w-full bg-gradient-to-r from-brand-500 to-brand-600 disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create list"}
        </button>
      </form>
    </div>
  );
}
