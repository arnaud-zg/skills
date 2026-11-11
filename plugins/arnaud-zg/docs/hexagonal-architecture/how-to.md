# 🛠️ How-to guides: hexagonal-architecture

[📚 Docs home](../../../../docs/README.md) › [⬡ hexagonal-architecture](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

**3 verbs, one check.**

## Choose hexagonal architecture for a project

Say it in the project's `CLAUDE.md`, so every session uses it without being told:

```md
Architecture: hexagonal (ports and adapters), use `hexagonal-architecture`.
```

## Design a new feature

Ask _design `<feature>` with ports and adapters_. You get the use cases, a ports table (receives,
delivers, never, default) and the folder tree.

## Audit a codebase or a skill

Ask _audit the architecture of `<folder>`_. The check runs first; the smells it cannot see come
after, ranked, each with its file and fix.

## Pull the database out of the domain

Ask _refactor `<file>` behind a port_. One port at a time, tests green between each step, one commit
per step.

## Use your own folder names

Pass them innermost first, `|` between names of one layer:

```sh
node scripts/check-layers.mjs src --layers "model,service|services,web|db"
```

## Run the check in CI

It exits `1` on a finding, so it gates a pipeline or a commit hook as it is.

## Add an adapter to a skill

Write `.<skill>/adapters/<port>.<name>.md` at the project root with `fulfils: <port>` in its
frontmatter. The [contract](../../skills/hexagonal-architecture/domain/contract.md) says how it is
found and ranked.

## Change the port contract

Edit `skills/hexagonal-architecture/domain/contract.md` only. Each skill with a `ports/` folder
carries a copy, `ports/CONTRACT.md`, so it works when installed alone. The pre-commit hook rewrites
the copies when the source changes; `pnpm sync:contract` does the same by hand, and `pnpm test`
fails if a copy drifts.

## Example

[`examples/hexagonal-architecture/`](../../examples/hexagonal-architecture/): `before` imports an
adapter from the domain, `after` asks a port.
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs the check on
both.
