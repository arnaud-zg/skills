# 📖 Reference: testing-trophy

[📚 Docs home](../../../../docs/README.md) › [🏆 testing-trophy](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

**5 rules, read from file names and test text.** Source of truth:
[`scripts/trophy.mjs`](../../skills/testing-trophy/scripts/trophy.mjs).

## Command

```sh
node scripts/check-trophy.mjs [<folder>] [--json]
```

Exit `0` when the suite holds, `1` on a finding, `2` when there is no test file.

## Layers

| Layer       | Read from                                        |
| ----------- | ------------------------------------------------ |
| static      | a `tsconfig.json` or an ESLint config            |
| unit        | `*.unit.test.*` or `*.unit.spec.*`               |
| integration | `*.integration.test.*` or `*.integration.spec.*` |
| end to end  | `*.e2e.test.*`, or any test under `e2e/`         |

## Rules

| Rule        | Reports                                        |
| ----------- | ---------------------------------------------- |
| `static`    | no type checker and no linter config           |
| `unlayered` | a test file whose name gives no layer          |
| `inverted`  | more unit files than integration files         |
| `own-mock`  | `vi.mock` or `jest.mock` of a relative path    |
| `named`     | a `test` or `it` titled with a bare identifier |

## Example

[`examples/testing-trophy/suite/`](../../examples/testing-trophy/suite/): one integration file and a
`tsconfig.json`. [`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs
the check on it.
