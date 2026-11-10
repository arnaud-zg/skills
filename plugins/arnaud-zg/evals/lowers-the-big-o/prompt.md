---
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

This is too slow with 100 000 users. Make it O(n), without changing what it returns:

```js
export function allowed(users, banned) {
  return users.filter((user) => !banned.includes(user.id));
}
```
