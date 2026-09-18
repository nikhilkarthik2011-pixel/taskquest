// Mirrors server/src/lib/avatars.js — kept in sync manually since the two
// apps don't share code. Order matters, it's also the unlock order.
export const AVATARS = [
  { key: "hatchling", emoji: "🐣", name: "Hatchling", unlockLevel: 1 },
  { key: "kitten", emoji: "🐱", name: "Kitten", unlockLevel: 2 },
  { key: "fox", emoji: "🦊", name: "Fox", unlockLevel: 3 },
  { key: "wolf", emoji: "🐺", name: "Wolf", unlockLevel: 4 },
  { key: "owl", emoji: "🦉", name: "Owl", unlockLevel: 5 },
  { key: "tiger", emoji: "🐯", name: "Tiger", unlockLevel: 6 },
  { key: "lion", emoji: "🦁", name: "Lion", unlockLevel: 7 },
  { key: "eagle", emoji: "🦅", name: "Eagle", unlockLevel: 8 },
  { key: "dragon", emoji: "🐉", name: "Dragon", unlockLevel: 9 },
  { key: "unicorn", emoji: "🦄", name: "Unicorn", unlockLevel: 10 },
  { key: "star", emoji: "🌟", name: "Star", unlockLevel: 12 },
  { key: "champion", emoji: "👑", name: "Champion", unlockLevel: 15 },
];

export const AVATARS_BY_KEY = Object.fromEntries(AVATARS.map((a) => [a.key, a]));
export const DEFAULT_AVATAR_KEY = AVATARS[0].key;

export function avatarEmoji(key) {
  return AVATARS_BY_KEY[key]?.emoji || AVATARS_BY_KEY[DEFAULT_AVATAR_KEY].emoji;
}

export function isAvatarUnlocked(level, key) {
  const avatar = AVATARS_BY_KEY[key];
  return Boolean(avatar) && level >= avatar.unlockLevel;
}
