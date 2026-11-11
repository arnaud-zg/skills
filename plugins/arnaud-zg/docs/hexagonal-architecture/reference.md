# 📖 Reference: hexagonal-architecture

[📚 Docs home](../../../../docs/README.md) › [⬡ hexagonal-architecture](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

**1 rule, read from imports and links.** Source of truth:
[`scripts/layers.mjs`](../../skills/hexagonal-architecture/scripts/layers.mjs).

## Command

```sh
node scripts/check-layers.mjs [<folder>] [--layers <inner,…,outer>] [--json]
```

Exit `0` when every dependency points inward, `1` on a finding, `2` when no file sits in a layer
folder.

## Layers

| Rank | Layer         | Folder names                                    |
| ---- | ------------- | ----------------------------------------------- |
| 0    | `domain`      | `domain`, `core`, `entities`                    |
| 1    | `ports`       | `ports`                                         |
| 2    | `application` | `application`, `usecases`, `use-cases`, `verbs` |
| 3    | `adapters`    | `adapters`, `infrastructure`, `infra`           |

A file may depend on its own rank or a lower one. `PORTS.md`, `main.*`, `composition*` and any file
outside the layer folders are wiring, and may point anywhere.

## What is read

| Files                | Edges                                                     |
| -------------------- | --------------------------------------------------------- |
| `.js` `.ts` `.mjs` … | `import … from`, `export … from`, `require()`, `import()` |
| `.py`                | `from x import`, `import x`, relative or by module        |
| `.go`                | `import "x"` and import blocks                            |
| `.md`                | `[text](path)` links                                      |

A package with no layer folder in its path, and a web address, are never a layer.

## The contract

[`domain/contract.md`](../../skills/hexagonal-architecture/domain/contract.md): port columns,
adapter keys (`fulfils`, `takes`, `replaces`), the binding grammar, drop-ins, and what a
`ports/PORTS.md` holds. Followed by big-o-optimizer, glance-audit, glance-first, skill-retro and
usage-runway.

## Example

[`examples/hexagonal-architecture/`](../../examples/hexagonal-architecture/): `before` fails,
`after` holds. [`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs
the check on both.
