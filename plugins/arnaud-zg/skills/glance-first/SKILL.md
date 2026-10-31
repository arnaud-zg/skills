---
name: glance-first
description:
  Presents any piece of work so a reader gets the key information in under one minute: the answer
  in one line, the key numbers in a strip, then at most four blocks that each open on a picture (a
  diagram, a chart, a table or a screenshot) marking what changed, checked by a script before it is
  shown. Use when asked for a "TLDR", to "explain
  this change", to "write the PR description", to "make it quick to read", for a "one-minute read",
  to "summarise for a PM", or to "present this".
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-brief.mjs *)
---

# glance-first

**The reader should know the answer from the first line and be free to stop there.** Then they look
before they read: the key numbers come next, and every block shows its picture before its words.
Everything below the numbers is proof, not required reading. At most 200 words, under one minute.

| Order | What the eye lands on | Limit                         |
| ----- | --------------------- | ----------------------------- |
| 1     | the TLDR: the answer  | 25 words                      |
| 2     | the key numbers       | 4 figures, each with a digit  |
| 3     | each block's picture  | the first block must have one |
| 4     | the line it proves    | 15 words                      |

## Verbs

| Verb        | Does                                                                   | File                                 |
| ----------- | ---------------------------------------------------------------------- | ------------------------------------ |
| **present** | gathers the work, writes the brief, checks it, draws it, hands it over | [verbs/present.md](verbs/present.md) |

Read the verb's file and follow it.

## Ports

One port, `target`: where is the brief rendered, and in what form. [ports/PORTS.md](ports/PORTS.md)
lists the targets and the adapter that answers each.

## Map

| File                                               | Read when                                             |
| -------------------------------------------------- | ----------------------------------------------------- |
| [domain/brief.md](domain/brief.md)                 | writing the brief: its fields, its limits, its budget |
| [domain/pictures.md](domain/pictures.md)           | choosing a block's picture and marking what changed   |
| [scripts/check-brief.mjs](scripts/check-brief.mjs) | checking a brief file before it is drawn              |
