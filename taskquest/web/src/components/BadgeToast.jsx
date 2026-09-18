import { useEffect } from "react";

// Auto-dismissing celebration banner for one or more newly-earned badges.
export default function BadgeToast({ badges, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4500);
    return () => clearTimeout(timer);
  }, [badges, onDismiss]);

  if (!badges || badges.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
      <div className="animate-pop-in card-pop flex max-w-sm flex-col gap-2 border-2 border-brand-400 p-4">
        {badges.map((badge) => (
          <div key={badge.key} className="flex items-center gap-3">
            <span className="text-3xl">{badge.emoji}</span>
            <div>
              <p className="font-display text-sm font-extrabold text-brand-600 dark:text-brand-200">
                Badge earned: {badge.name}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-400">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
