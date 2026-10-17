const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "taskquest_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    // No JSON body (shouldn't normally happen).
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),
  updateAvatar: (avatar) => request("/auth/me/avatar", { method: "PATCH", body: { avatar } }),
  listTasks: () => request("/tasks"),
  createTask: (payload) => request("/tasks", { method: "POST", body: payload }),
  updateTask: (id, payload) => request(`/tasks/${id}`, { method: "PUT", body: payload }),
  toggleComplete: (id, payload) =>
    request(`/tasks/${id}/complete`, { method: "PATCH", body: payload }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),
  listLists: () => request("/lists"),
  createList: (payload) => request("/lists", { method: "POST", body: payload }),
  updateList: (id, payload) => request(`/lists/${id}`, { method: "PUT", body: payload }),
  deleteList: (id) => request(`/lists/${id}`, { method: "DELETE" }),
  createRecurringTask: (payload) =>
    request("/recurring-tasks", { method: "POST", body: payload }),
  deleteRecurringTask: (id) => request(`/recurring-tasks/${id}`, { method: "DELETE" }),
  listBadges: () => request("/badges"),
  getDashboardStats: () => request("/dashboard-stats"),
  devAddPoints: (delta) => request("/dev/points", { method: "POST", body: { delta } }),
  devSetLevel: (level) => request("/dev/set-level", { method: "POST", body: { level } }),
  devSetStreak: (count) => request("/dev/set-streak", { method: "POST", body: { count } }),
  devAwardBadge: (key) => request("/dev/award-badge", { method: "POST", body: { key } }),
  devResetBadges: () => request("/dev/reset-badges", { method: "POST" }),
  devResetProgress: () => request("/dev/reset-progress", { method: "POST" }),
};
