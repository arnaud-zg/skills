---
name: glance-audit
description:
  Reads a document, plan, pull request or status report like a careful sceptic, challenges its
  claims and finds the points worth discussing, then hands back a one-line verdict, the critical
  finding with its proof, and comments anchored on exact quotes, ready to paste. It never posts,
  comments or edits anything itself. Use when asked to "audit this", "challenge this plan", "poke
  holes", "review this doc", "what are we missing", "play devil's advocate", "is this plan sound",
  or to check a report or status box against what it claims.
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check-audit.mjs *)
---

# glance-audit

**The audit thinks; it never posts.** It reads, judges and drafts. The reader decides what to say
and pastes it themselves. Nothing in the source is commented on, approved, edited or sent.

The skill owns the judgement: what is wrong, what is good, what to say about it. Rendering belongs
to another skill, through the `present` port, so the audit reads like every other one-minute read.
It belongs to no project: what is read and where the result lands come from the caller.

## Verbs

| Verb      | Does                                                                         | File                             |
| --------- | ---------------------------------------------------------------------------- | -------------------------------- |
| **audit** | gathers the source, runs the lenses, decides, drafts comments, checks, hands | [verbs/audit.md](verbs/audit.md) |

Read the verb's file and follow it.

## Ports

Two questions are asked of the world: what is read and how (`source`, one per audit), and who
renders the result (`present`). [ports/PORTS.md](ports/PORTS.md) names each port's adapters.

## Map

| File                                               | Read when                                                     |
| -------------------------------------------------- | ------------------------------------------------------------- |
| [domain/lenses.md](domain/lenses.md)               | auditing: the seven lenses, the three tests, severity, proof  |
| [domain/result.md](domain/result.md)               | writing the result: verdict, findings, comments, questions    |
| [scripts/check-audit.mjs](scripts/check-audit.mjs) | checking the result against its source before it is presented |
