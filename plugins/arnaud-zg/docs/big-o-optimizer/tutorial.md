# 🚀 Tutorial: turn a nested lookup into one pass

[📚 Docs home](../../../../docs/README.md) › [⚡ big-o-optimizer](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

Five minutes. You will hand the skill a slow filter, read its before → after table, and check the
rewrite returns the same users.

## 1. Install the plugin

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

## 2. Give it slow code

Save this as `allowed.mjs`, then type `/arnaud-zg:big-o-optimizer allowed.mjs`:

```js
export function allowed(users, banned) {
  return users.filter((user) => !banned.includes(user.id));
}
```

## 3. Read the answer

1. It says which adapters run: `language.javascript` for the `.mjs` file, then `verify.tests` and
   `measure.read`. A `.py`, `.go` or any other file works the same way.
2. It names the Big O: `includes` scans `banned` (m) for every user (n), so O(n·m).
3. It picks _search a list inside a loop_ and builds a `Set` once.
4. With no test reaching `allowed`, it writes one first, from the current behaviour, and runs it
   before and after.
5. It hands back a table: O(n·m) → O(n+m), the pattern, the test count, and the price, O(m) space.

## 4. Check the rewrite

The result matches [`examples/big-o-optimizer/after.mjs`](../../examples/big-o-optimizer/after.mjs).
Duplicates and order are kept, because `filter` still decides.

The same filter in Python, Go or Rust gets the same cut, spelled with that language's set.

## Next

- Add timings or your own step: [How-to guides](how-to.md)
- Every pattern it knows: [Reference](reference.md)
