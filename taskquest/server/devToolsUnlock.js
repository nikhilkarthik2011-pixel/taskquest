// A hidden, per-account way to turn Dev Tools on without editing any .env
// file: create a list named "Manchester2023" with the basketball emoji, and
// it flips on for your account. Delete every list matching that combo and it
// flips back off. This never affects anyone else's account, and there's
// nothing in the UI that hints it exists.
const MAGIC_NAME = "manchester2023";
const MAGIC_EMOJI = "\u{1F3C0}"; // basketball

function isMagicList(name, emoji) {
  return (name || "").trim().toLowerCase() === MAGIC_NAME && emoji === MAGIC_EMOJI;
}

// Call after creating a list. Turns Dev Tools on for this account if the new
// list matches; a no-op (one cheap UPDATE) otherwise.
async function maybeUnlockOnCreate(pool, userId, list) {
  if (!isMagicList(list.name, list.emoji)) return;
  await pool.query("UPDATE users SET dev_tools_enabled = true WHERE id = $1", [userId]);
}

// Call after deleting a list. Turns Dev Tools back off only if that was the
// last remaining matching list for this account — so having two of them
// doesn't get toggled off by deleting just one.
async function maybeRelockOnDelete(pool, userId, deletedList) {
  if (!isMagicList(deletedList.name, deletedList.emoji)) return;
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM lists
     WHERE user_id = $1 AND lower(trim(name)) = $2 AND emoji = $3`,
    [userId, MAGIC_NAME, MAGIC_EMOJI]
  );
  if (rows[0].count === 0) {
    await pool.query("UPDATE users SET dev_tools_enabled = false WHERE id = $1", [userId]);
  }
}

module.exports = { isMagicList, maybeUnlockOnCreate, maybeRelockOnDelete };