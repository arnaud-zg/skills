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

Write `.agents/adapters/<skill>/<port>.<name>.md` at the project root with `fulfils: <port>` in its
frontmatter. The [contract](../../skills/hexagonal-architecture/domain/contract.md) says how it is
found and ranked. Check it with hexagonal-skill-builder:

```sh
node <hexagonal-skill-builder>/scripts/check.mjs --adapters
```

## Migrate project adapters to the one folder

A project from before the one folder has a `.<skill>/adapters/` per skill at its root. Print the
plan, read it, then apply it:

```sh
node <hexagonal-skill-builder>/scripts/migrate-adapters.mjs          # prints the plan, writes nothing
node <hexagonal-skill-builder>/scripts/migrate-adapters.mjs --write  # moves with git mv, rewrites links
```

It moves each `<port>.<name>.md` of an installed skill to `.agents/adapters/<skill>/`, rewrites
every mention of the old folder in the tracked text files, and removes the emptied folders. It
refuses when a different file already sits at a target, and a second run finds nothing to do. Lines
that name the old folder in pieces, such as `join(root, ".domain-first", "adapters")`, are listed
for you to fix by hand. `--skill <name>` limits it to one skill, for a project that moves one at a
time. Run the check after.

## Change the port contract

Edit `skills/hexagonal-architecture/domain/contract.md`. Each skill with a `ports/` folder links it
from its `ports/PORTS.md`, marked "if installed", so there is nothing to copy or sync.

## Example

`examples/hexagonal-architecture/`:
[`before`](../../examples/hexagonal-architecture/before/domain/order.mjs) imports an adapter from
the domain, [`after`](../../examples/hexagonal-architecture/after/domain/order.mjs) asks a port.
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs the check on
both.
