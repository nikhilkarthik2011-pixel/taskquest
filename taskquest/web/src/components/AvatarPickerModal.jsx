import { useState } from "react";
import { AVATARS, isAvatarUnlocked } from "../lib/avatars.js";

export default function AvatarPickerModal({ user, onClose, onSelect }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handlePick(avatar) {
    if (!isAvatarUnlocked(user.level, avatar.key) || avatar.key === user.avatar || submitting) {
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onSelect(avatar.key);
      onClose();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="animate-pop-in w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl dark:bg-[#1f1640] sm:rounded-3xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold text-slate-800 dark:text-white">
            Your avatars 🎭
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-xs text-slate-400 dark:text-slate-400">
          Cosmetic only — new looks unlock as you level up. Doesn't affect your points or streak.
        </p>

        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((avatar) => {
            const unlocked = isAvatarUnlocked(user.level, avatar.key);
            const selected = avatar.key === user.avatar;
            return (
              <button
                type="button"
                key={avatar.key}
                disabled={!unlocked || submitting}
                onClick={() => handlePick(avatar)}
                title={unlocked ? avatar.name : `Unlocks at Level ${avatar.unlockLevel}`}
                className={`relative flex flex-col items-center gap-1 rounded-2xl border-2 p-2 transition ${
                  selected
                    ? "border-brand-500 bg-brand-500/10"
                    : unlocked
                      ? "border-slate-200 hover:border-brand-300 dark:border-white/10"
                      : "border-slate-100 opacity-40 dark:border-white/5"
                }`}
              >
                <span className="text-2xl">{unlocked ? avatar.emoji : "🔒"}</span>
                <span className="text-center text-[10px] font-bold leading-tight text-slate-500 dark:text-slate-300">
                  {unlocked ? avatar.name : `Lvl ${avatar.unlockLevel}`}
                </span>
                {selected && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white shadow-pop-sm">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-urgent">{error}</p>}
      </div>
    </div>
  );
}
