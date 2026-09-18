import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTour } from "../context/TourContext.jsx";
import { isDevToolsUnlocked } from "../lib/devTools.js";

export default function NavBar({ dark, onToggleDark }) {
  const { user, logout } = useAuth();
  const { startTour } = useTour();
  const navigate = useNavigate();

  function handleShowTutorial() {
    // The tour spotlights dashboard elements, so make sure we're there
    // before it starts looking for them.
    navigate("/");
    setTimeout(() => startTour(), 150);
  }

  return (
    <header className="sticky top-0 z-10 border-b-2 border-slate-900/5 bg-slate-100/80 backdrop-blur dark:border-white/5 dark:bg-[#160f2e]/80">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xl sm:text-2xl">🎯</span>
          <span className="font-display text-base font-extrabold tracking-tight text-brand-600 dark:text-brand-200 sm:text-xl">
            TaskQuest
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-3">
          {user && (
            <Link
              to="/stats"
              aria-label="Productivity dashboard"
              title="Productivity dashboard"
              data-tour="nav-stats"
              className="rounded-full border-2 border-slate-200 bg-white p-1.5 text-base leading-none transition hover:scale-105 dark:border-white/10 dark:bg-white/5 sm:p-2 sm:text-lg"
            >
              📊
            </Link>
          )}
          {user && (
            <Link
              to="/badges"
              aria-label="Achievements"
              title="Achievements"
              data-tour="nav-badges"
              className="rounded-full border-2 border-slate-200 bg-white p-1.5 text-base leading-none transition hover:scale-105 dark:border-white/10 dark:bg-white/5 sm:p-2 sm:text-lg"
            >
              🏆
            </Link>
          )}
          {user && isDevToolsUnlocked(user) && (
            <Link
              to="/dev-tools"
              aria-label="Dev tools"
              title="Dev tools"
              className="rounded-full border-2 border-orange-300 bg-orange-50 p-1.5 text-base leading-none transition hover:scale-105 dark:border-orange-400/30 dark:bg-orange-400/10 sm:p-2 sm:text-lg"
            >
              🛠️
            </Link>
          )}
          {user && (
            <button
              onClick={handleShowTutorial}
              aria-label="Show tutorial"
              title="Show tutorial"
              data-tour="nav-help"
              className="rounded-full border-2 border-slate-200 bg-white p-1.5 text-base font-extrabold leading-none text-slate-500 transition hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 sm:p-2 sm:text-lg"
            >
              ?
            </button>
          )}
          <button
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            data-tour="nav-dark"
            className="rounded-full border-2 border-slate-200 bg-white p-1.5 text-base leading-none transition hover:scale-105 dark:border-white/10 dark:bg-white/5 sm:p-2 sm:text-lg"
          >
            {dark ? "🌙" : "☀️"}
          </button>
          {user && (
            <button
              onClick={logout}
              aria-label="Log out"
              title="Log out"
              className="rounded-full border-2 border-slate-200 bg-white p-1.5 text-base leading-none transition hover:scale-105 dark:border-white/10 dark:bg-white/5 sm:px-4 sm:py-2 sm:text-sm sm:font-display sm:font-bold"
            >
              <span className="sm:hidden">🚪</span>
              <span className="hidden text-slate-600 dark:text-slate-200 sm:inline">Log out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
