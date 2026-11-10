---
fulfils: language
matches: .js .mjs .cjs .jsx .ts .tsx
---

# language · javascript

**JavaScript and TypeScript.**

| Generic         | Use                                                      |
| --------------- | -------------------------------------------------------- |
| hash set        | `new Set(items)`, `.has()`                               |
| hash map        | `new Map()`; a plain object only for string keys         |
| heap            | none built in: a small binary heap, or the project's own |
| growable buffer | push into an array, `.join("")` once                     |
| front removal   | an index pointer instead of `.shift()` in a loop         |

## Pitfalls

- `includes`, `indexOf`, `find`, `some` on an array are O(n). So is `in` on an array's values via
  `Object.values(...)`.
- Spreading in a loop (`[...acc, x]`, `{...acc, k: v}`) copies every time: O(n²).
- `Set` and `Map` compare objects by identity and `NaN` equal to `NaN`. Key by the compared field.
- Object keys become strings: `1` and `"1"` collide. Use a `Map` for number or object keys.
- Tests: the `test` script in `package.json` (`vitest`, `jest`, `node --test`). Bench:
  `vitest bench` or `hyperfine`.
