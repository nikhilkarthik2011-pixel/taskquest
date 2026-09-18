import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { PRIORITIES, PRIORITY_ORDER } from "../lib/priorities";
import { colors } from "../theme";
import StatsBar from "../components/StatsBar";
import TaskCard from "../components/TaskCard";
import AddTaskModal from "../components/AddTaskModal";

export default function DashboardScreen() {
  const { user, setUser, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    refreshTasks();
  }, []);

  async function refreshTasks() {
    setLoading(true);
    try {
      const { tasks } = await api.listTasks();
      setTasks(tasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(payload) {
    const { task } = await api.createTask(payload);
    setTasks((prev) => [task, ...prev]);
  }

  async function handleToggle(task) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    try {
      const { task: updated, user: updatedUser } = await api.toggleComplete(task.id);
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      setUser(updatedUser);
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

  const visibleTasks = useMemo(() => {
    if (filter === "all") return tasks;
    return tasks.filter((t) => t.priority === filter);
  }, [tasks, filter]);

  const activeCount = tasks.filter((t) => !t.completed).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>🎯 TaskQuest</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListHeaderComponent={
          <View>
            <StatsBar user={user} />
            <Text style={styles.heading}>
              {activeCount > 0 ? `${activeCount} task${activeCount === 1 ? "" : "s"} to go` : "All clear! 🎉"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <FilterChip active={filter === "all"} label="All" emoji="📋" onPress={() => setFilter("all")} />
              {PRIORITY_ORDER.map((key) => (
                <FilterChip
                  key={key}
                  active={filter === key}
                  label={PRIORITIES[key].label}
                  emoji={PRIORITIES[key].emoji}
                  onPress={() => setFilter(key)}
                />
              ))}
            </ScrollView>
            {!!error && <Text style={styles.errorBanner}>{error}</Text>}
            {loading && <Text style={{ textAlign: "center", color: colors.subtext }}>Loading your quests...</Text>}
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.empty}>
              <Text style={{ fontSize: 34 }}>🦄</Text>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySubtitle}>Tap the + button to add your first task</Text>
            </View>
          )
        }
        renderItem={({ item }) => <TaskCard task={item} onToggle={handleToggle} onDelete={handleDelete} />}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowAdd(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <AddTaskModal visible={showAdd} onClose={() => setShowAdd(false)} onCreate={handleCreate} />
    </View>
  );
}

function FilterChip({ active, label, emoji, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active ? { backgroundColor: colors.brand500, borderColor: colors.brand500 } : { borderColor: "#e7e3f6" },
      ]}
    >
      <Text style={{ color: active ? "#fff" : colors.subtext, fontWeight: "800", fontSize: 12 }}>
        {emoji} {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 12,
    backgroundColor: colors.bg,
  },
  navTitle: { fontSize: 18, fontWeight: "800", color: colors.brand600 },
  logout: { fontWeight: "700", color: colors.subtext, fontSize: 13 },
  heading: { fontSize: 17, fontWeight: "800", color: colors.text, marginBottom: 10 },
  chip: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    backgroundColor: "#fff",
  },
  errorBanner: {
    backgroundColor: "#ffe3e8",
    color: colors.urgent,
    fontWeight: "700",
    padding: 10,
    borderRadius: 14,
    marginBottom: 10,
    fontSize: 13,
  },
  empty: { alignItems: "center", padding: 40, gap: 4 },
  emptyTitle: { fontWeight: "800", color: colors.text, marginTop: 4 },
  emptySubtitle: { color: colors.subtext, fontSize: 13 },
  fab: {
    position: "absolute",
    right: 22,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand500,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fabText: { color: "#fff", fontSize: 28, marginTop: -2 },
});
