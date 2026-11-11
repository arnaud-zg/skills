---
name: hexagonal-architecture
description:
  Designs, audits and refactors code and Agent Skills by hexagonal architecture (ports and adapters,
  clean architecture), where every dependency points inward, from adapters to the domain. A script
  reads imports in JavaScript, TypeScript, Python and Go, and links in Markdown, and flags each one
  that points outward. It also holds the one port and adapter contract the other skills follow. Use
  when asked to "use hexagonal architecture", "ports and adapters", "clean architecture", "decouple
  this from the database", "where should this code go", "is the domain clean", "add an adapter",
  "make this swappable", or when "/arnaud-zg:hexagonal-architecture" is typed.
argument-hint: "[design|audit|refactor] [<folder, file or feature>]"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-layers.mjs *)
---

# hexagonal-architecture

**The core decides; the world plugs in.** The domain and its use cases depend on nothing outside
them. What they need from the world, they ask through a port they own, and an adapter answers it.
Every import and every link points inward.

```text
adapters  →  application  →  ports  →  domain
(the how)    (what it does)  (what it asks)  (what stays true)
```

The layers, their folder names and how clean architecture maps onto them:
[domain/rules.md](domain/rules.md).

`${CLAUDE_SKILL_DIR}` is this skill's folder. Claude Code sets it; in another agent, use the folder
that holds this file.

## Pick the verb

| The person wants to…                                 | Read                                   |
| ---------------------------------------------------- | -------------------------------------- |
| shape a new feature or module, or a new skill's port | [verbs/design.md](verbs/design.md)     |
| check where code or a skill leaks                    | [verbs/audit.md](verbs/audit.md)       |
| pull a port out of tangled code                      | [verbs/refactor.md](verbs/refactor.md) |

With no verb, infer it from the request. Every verb ends with the check.

## Check

```sh
node ${CLAUDE_SKILL_DIR}/scripts/check-layers.mjs [<folder>] [--layers <inner,…,outer>] [--json]
```

It exits 0 when every dependency points inward, 1 on a finding, 2 when no file sits in a layer
folder. Show the findings as printed and fix them. **Never move a file to another layer to make the
check pass**: move the dependency behind a port.

## Map

- [domain/rules.md](domain/rules.md): the layers, the one rule, clean architecture's rings.
- [domain/contract.md](domain/contract.md): what a port and an adapter hold, how a caller binds one,
  how a project drops one in. Every skill with a `ports/` folder follows it.
- [domain/smells.md](domain/smells.md): the leaks no import shows, and how each is fixed.
