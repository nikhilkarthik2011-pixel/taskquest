import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, getToken, setToken } from "../lib/api.js";

const AuthContext = createContext(null);

const MAX_ATTEMPTS = 20;
const RETRY_DELAY_MS = 3000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [waking, setWaking] = useState(false);

  const loadMe = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    // Only a real auth rejection (401/404) should sign you out. Network errors
    // and 5xx responses usually mean the server is still waking up (e.g. a
    // free-tier host that sleeps), so keep the saved session and retry.
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      try {
        const { user, token } = await api.me();
        if (token) setToken(token);
        setUser(user);
        break;
      } catch (err) {
        if (err.status === 401 || err.status === 404) {
          setToken(null);
          setUser(null);
          break;
        }
        if (attempt === MAX_ATTEMPTS - 1) {
          setUser(null);
          break;
        }
        setWaking(true);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }
    setWaking(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function signup(payload) {
    const { token, user } = await api.signup(payload);
    setToken(token);
    setUser(user);
  }

  async function login(payload) {
    const { token, user } = await api.login(payload);
    setToken(token);
    setUser(user);
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, waking, signup, login, logout, refresh: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
