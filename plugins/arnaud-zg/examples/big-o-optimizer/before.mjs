// O(n·m): includes scans the whole banned list for every user.
export function allowed(users, banned) {
  return users.filter((user) => !banned.includes(user.id));
}
