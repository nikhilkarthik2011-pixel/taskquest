// Dev Tools can be unlocked two ways: the server's own .env sets
// ENABLE_DEV_TOOLS=true (so it's on for every account on that server), or an
// individual account unlocked it for itself by creating a list named
// "Manchester2023" with the basketball emoji — see the server's
// lib/devToolsUnlock.js for that half of it. Either one is enough.
export function isDevToolsUnlocked(user) {
  return import.meta.env.VITE_ENABLE_DEV_TOOLS === "true" || !!user?.devToolsEnabled;
}