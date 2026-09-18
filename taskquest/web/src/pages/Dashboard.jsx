import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "../context/AuthContext.jsx";
import { useTour } from "../context/TourContext.jsx";
import { api } from "../lib/api.js";
import { PRIORITIES, PRIORITY_ORDER } from "../lib/priorities.js";
import StatsBar from "../components/StatsBar.jsx";
import TaskCard from "../components/TaskCard.jsx";
import AddTaskModal from "../components/AddTaskModal.jsx";
import ListTabs from "../components/ListTabs.jsx";
import NewListModal from "../components/NewListModal.jsx";
import AvatarPickerModal from "../components/AvatarPickerModal.jsx";
import BadgeToast from "../components/BadgeToast.jsx";

const TOUR_SEEN_PREFIX = "taskquest_tour_seen_";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const { startTour } = useTour();
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showNewList, setShowNewList] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [newBadges, setNewBadges] = useState([]);
  const [filter, setFilter] = useState("all"); // all | urgent | important | someday
  const [activeListId, setActiveListId] = useState(null); // null = All

  useEffect(() => {
    refreshAll();
  }, []);

  // Show the guided tour automatically the first time this account logs in.
  // The ref guard (rather than relying purely on the localStorage read)
  // keeps this from double-firing under React 18 StrictMode's dev-only
  // mount→cleanup→mount effect cycle.
  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const key = `${TOUR_SEEN_PREFIX}${user.id}`;
    if (localStorage.getItem(key)) return;
    // Mark as seen (and actually start it) only once the timer fires, not
    // when it's scheduled — React 18 StrictMode runs this effect once
    // throwaway and once for real in dev, and clears this timer in
    // between. Writing the flag up front would let the throwaway pass
    // "consume" it before the real one ever shows the tour.
    const timer = setTimeout(() => {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, "1");
      startTour();
    }, 500);
    return () => clearTimeout(timer);
  }, [user, startTour]);

  async function refreshAll() {
    setLoading(true);
    try {
      const [{ tasks }, { lists }] = await Promise.all([api.listTasks(), api.listLists()]);
      setTasks(tasks);
      setLists(lists);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshTasks() {
    try {
      const { tasks } = await api.listTasks();
      setTasks(tasks);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreate(payload) {
    const { task } = await api.createTask(payload);
    setTasks((prev) => [task, ...prev]);
  }

  async function handleCreateRecurring(payload) {
    await api.createRecurringTask(payload);
    await refreshTasks();
  }

  async function handleToggle(task) {
    const wasIncomplete = !task.completed;
    // Optimistic update so it feels instant.
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    try {
      // The server doesn't know the user's timezone, so "before 9 AM" for
      // the Early Bird badge is judged using the browser's own local clock.
      const payload = wasIncomplete ? { localHour: new Date().getHours() } : undefined;
      const {
        task: updated,
        user: updatedUser,
        newBadges: earnedBadges,
      } = await api.toggleComplete(task.id, payload);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      setUser(updatedUser);
      if (wasIncomplete) {
        confetti({
          particleCount: 70,
          spread: 65,
          startVelocity: 35,
          origin: { y: 0.7 },
          colors: ["#7c4dff", "#22c1a4", "#ff5d73", "#ffd166"],
        });
        if (earnedBadges && earnedBadges.length > 0) {
          setNewBadges(earnedBadges);
          confetti({
            particleCount: 120,
            spread: 100,
            startVelocity: 45,
            origin: { y: 0.3 },
            colors: ["#ffd166", "#7c4dff", "#22c1a4"],
          });
        }
      }
    } catch (err) {
      setError(err.message);
      refreshTasks();
    }
  }

  async function handleDelete(task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    try {
      await api.deleteTask(task.id);
    } catch (err) {
      setError(err.message);
      refreshTasks();
    }
  }

  async function handleCancelRecurring(task) {
    const ok = window.confirm(
      "Stop repeating this task? This removes every day it hasn't been completed yet."
    );
    if (!ok) return;
    try {
      await api.deleteRecurringTask(task.recurring_task_id);
      await refreshTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSelectAvatar(avatar) {
    const { user: updatedUser } = await api.updateAvatar(avatar);
    setUser(updatedUser);
  }

  async function handleCreateList(payload) {
    // The response also carries the current user object — most of the time
    // it's unchanged, but creating a list can occasionally flip a hidden
    // per-account setting (see server/src/lib/devToolsUnlock.js), so we
    // always pick up whatever the server says is current.
    const { list, user: updatedUser } = await api.createList(payload);
    setLists((prev) => [...prev, list]);
    if (updatedUser) setUser(updatedUser);
  }

  async function handleDeleteList(list) {
    const ok = window.confirm(
      `Delete the "${list.name}" list? Its tasks won't be deleted — they'll just move to "All".`
    );
    if (!ok) return;
    try {
      const { user: updatedUser } = await api.deleteList(list.id);
      setLists((prev) => prev.filter((l) => l.id !== list.id));
      if (activeListId === list.id) setActiveListId(null);
      if (updatedUser) setUser(updatedUser);
      refreshTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  const listsById = useMemo(() => Object.fromEntries(lists.map((l) => [l.id, l])), [lists]);

  const visibleTasks = useMemo(() => {
    let result = tasks;
    if (activeListId !== null) result = result.filter((t) => t.list_id === activeListId);
    if (filter !== "all") result = result.filter((t) => t.priority === filter);
    return result;
  }, [tasks, filter, activeListId]);

  const activeCount = visibleTasks.filter((t) => !t.completed).length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-6">
      <BadgeToast badges={newBadges} onDismiss={() => setNewBadges([])} />

      <StatsBar user={user} onOpenAvatarPicker={() => setShowAvatarPicker(true)} />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-lg font-extrabold text-slate-800 dark:text-white">
          {activeCount > 0 ? `${activeCount} task${activeCount === 1 ? "" : "s"} to go` : "All clear! 🎉"}
        </h1>
      </div>

      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Lists</p>
      <ListTabs
        lists={lists}
        activeListId={activeListId}
        onSelect={setActiveListId}
        onAddList={() => setShowNewList(true)}
        onDeleteList={handleDeleteList}
      />

      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Priority</p>
      <div className="mb-4 flex flex-wrap gap-2" data-tour="priority-filters">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" emoji="📋" />
        {PRIORITY_ORDER.map((key) => (
          <FilterChip
            key={key}
            active={filter === key}
            onClick={() => setFilter(key)}
            label={PRIORITIES[key].label}
            emoji={PRIORITIES[key].emoji}
          />
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-2xl bg-urgent/10 px-4 py-2 text-sm font-semibold text-urgent">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-slate-400">Loading your quests...</p>
      ) : visibleTasks.length === 0 ? (
        <div className="card-pop flex flex-col items-center gap-2 p-10 text-center">
          <span className="text-4xl">🦄</span>
          <p className="font-display font-bold text-slate-600 dark:text-slate-200">
            Nothing here yet
          </p>
          <p className="text-sm text-slate-400">Tap the + button to add your first task</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              list={listsById[task.list_id]}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onCancelRecurring={handleCancelRecurring}
            />
          ))}
        </ul>
      )}

      <button
        onClick={() => setShowAdd(true)}
        aria-label="Add task"
        data-tour="add-task"
        className="fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-3xl text-white shadow-pop transition hover:scale-105 active:translate-y-1 active:shadow-none"
      >
        +
      </button>

      {showAdd && (
        <AddTaskModal
          onClose={() => setShowAdd(false)}
          onCreate={handleCreate}
          onCreateRecurring={handleCreateRecurring}
          lists={lists}
          defaultListId={activeListId ?? lists[0]?.id ?? null}
        />
      )}

      {showNewList && (
        <NewListModal onClose={() => setShowNewList(false)} onCreate={handleCreateList} />
      )}

      {showAvatarPicker && (
        <AvatarPickerModal
          user={user}
          onClose={() => setShowAvatarPicker(false)}
          onSelect={handleSelectAvatar}
        />
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label, emoji }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border-2 px-3 py-1.5 font-display text-xs font-bold transition ${
        active
          ? "border-brand-500 bg-brand-500 text-white"
          : "border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
      }`}
    >
      {emoji} {label}
    </button>
  );
}
