// Given a requested listId, returns it if it's a real list belonging to the
// user; otherwise falls back to their first list (everyone always has at
// least one, guaranteed at signup / by the startup migration).
async function resolveListId(pool, userId, listId) {
  if (listId) {
    const result = await pool.query("SELECT id FROM lists WHERE id = $1 AND user_id = $2", [
      listId,
      userId,
    ]);
    if (result.rows[0]) return result.rows[0].id;
  }

  const fallback = await pool.query(
    "SELECT id FROM lists WHERE user_id = $1 ORDER BY position ASC, id ASC LIMIT 1",
    [userId]
  );
  return fallback.rows[0]?.id ?? null;
}

module.exports = { resolveListId };
