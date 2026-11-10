// O(n+m): the Set is built once, and each lookup is O(1).
export function allowed(users, banned) {
  const blocked = new Set(banned);
  return users.filter((user) => !blocked.has(user.id));
}
