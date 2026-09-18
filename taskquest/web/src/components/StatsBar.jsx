import { avatarEmoji } from "../lib/avatars.js";

export default function StatsBar({ user, onOpenAvatarPicker }) {
  if (!user) return null;
  const pct = Math.min(100, user.pointsIntoLevel);

  return (
    <div className="card-pop mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenAvatarPicker}
          aria-label="Change avatar"
          title="Change avatar"
          data-tour="avatar-button"
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-3xl shadow-pop-sm transition hover:scale-105 active:scale-95"
        >
          {avatarEmoji(user.avatar)}
        </button>
        <div data-tour="stats-level">
          <p className="font-display text-sm font-bold text-slate-500 dark:text-slate-300">
            Level {user.level}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-400">
            {user.pointsIntoLevel}/100 XP to next level
          </p>
          <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4" data-tour="stats-streak">
        <div className="flex flex-col items-center rounded-2xl bg-orange-500/10 px-4 py-2 text-orange-500">
          <span className="text-xl">🔥</span>
          <span className="font-display text-sm font-extrabold">{user.streak}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide">Streak</span>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-brand-500/10 px-4 py-2 text-brand-600 dark:text-brand-200">
          <span className="text-xl">✨</span>
          <span className="font-display text-sm font-extrabold">{user.points}</span>
          <span className="text-[10px] font-bold uppercase tracking-wide">Points</span>
        </div>
      </div>
    </div>
  );
}
