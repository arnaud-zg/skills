---
name: doc-compass
description:
  Diataxis documentation. Creates a docs set from templates (tutorial, how-to, reference,
  explanation, decision records), sorts content into the right quadrant, keeps the docs true as the
  code changes, and checks them for orphan pages, broken links and anchors, and decisions superseded
  one way only. Use when creating, reorganising or updating docs, when asked "where should this doc
  go", "document this feature", "our docs are stale" or "check the docs", or after a change a user
  of the code will see.
argument-hint: "[create|place|maintain|audit] [<docs folder>]"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-docs.mjs *)
---

# Doc Compass

**Every reader arrives with one need, and each page answers exactly one.** Diataxis names four:

|             | The reader is studying | The reader is working  |
| ----------- | ---------------------- | ---------------------- |
| **Doing**   | 🚀 Tutorial: learn     | 🛠️ How-to: get it done |
| **Knowing** | 💡 Explanation: why    | 📖 Reference: look up  |

A page that serves two needs serves neither (why: E-04). Every page opens glance-first: the answer
line, the key numbers, then a picture before the prose, as [create.md](create.md) says. Decisions
get their own records, linked from the explanation.

## Pick the verb

| The person wants to…                            | Read                       |
| ----------------------------------------------- | -------------------------- |
| start docs from nothing, or rebuild a messy set | [create.md](create.md)     |
| know where a piece of content goes              | [place.md](place.md)       |
| update the docs after a code change             | [maintain.md](maintain.md) |
| check the docs, or find out why they feel stale | [audit.md](audit.md)       |

With no verb, ask which one, or infer it from the request. Every verb ends with the check.

## Check

```sh
node ${CLAUDE_SKILL_DIR}/scripts/check-docs.mjs [<folder> [--index <page>]] [--ban <text>]... [--json]
```

- With no folder it checks what `doc-compass.json` lists, or `docs/` when there is none:

  ```json
  { "ban": ["—"], "docs": ["docs", { "folder": "packages/cli/docs", "index": "../README.md" }] }
  ```

- A project that will run the check again gets that file, so every run checks the same sets.
- It exits 0 when the docs hold, 1 on a finding, and 2 when there is nothing to check.

Eight rules: `indexed`, `resolves`, `framed`, `superseded`, `generated`, `small`, `banned` and
`examples` (only with an `examples` folder). What each says and how to fix it is in
[audit.md](audit.md#the-rules).

Show the findings as printed: each has a file, a line and its fix. Fix them, run the check again,
and stop at exit 0. **Never relax a rule or drop a page from the check to make the docs pass.** A
clean check says nothing about the [guards](guards.md).

## Map

- [create.md](create.md), [place.md](place.md), [maintain.md](maintain.md), [audit.md](audit.md):
  one page per verb.
- [guards.md](guards.md): read before writing any page, for what no check can see.
- [evidence.md](evidence.md): read when asked what a rule or guard was paid for.
- `templates/`: copy as `docs/` to start. Every page there already holds.
