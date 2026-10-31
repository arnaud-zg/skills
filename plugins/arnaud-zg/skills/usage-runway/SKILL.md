---
name: usage-runway
description:
  How much of the usage window is left, when it resets, and whether the next piece of work fits
  before it does. Answers GO or PARK, from the clock and from any limit already hit. Use before
  dispatching a long piece of work, when a run must park and resume after a reset, and whenever "do
  we have enough credit" is asked. Project-agnostic; it knows nothing about what the work is.
metadata:
  format: hexagon/1
  bind: "ledger=claude-code"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/credit.mjs *)
---

# usage-runway

**A rule nobody can follow is not a rule.** (why: E-01)

Long-running work is told to check its remaining credit before opening a unit it cannot finish. This
skill is the instrument that makes the check possible: one command, one word back. It belongs to no
project and imports no project's vocabulary.

## Verbs

| Verb        | Does                                                                                 | File               |
| ----------- | ------------------------------------------------------------------------------------ | ------------------ |
| **measure** | says how much runway is left, when it resets, and whether the next unit of work fits | `verbs/measure.md` |

Read the verb's file and follow it. It ends on one word the caller acts on.

## Ports

The one question this skill asks of the world is `ports/PORTS.md`'s: where the turns and the limits
are recorded. The adapter bound in this file's metadata answers it, and is the only file that knows
which host wrote them.

| Port   | Answered by                      |
| ------ | -------------------------------- |
| ledger | `adapters/ledger.claude-code.md` |

## Map

| File                 | Read when                                                              |
| -------------------- | ---------------------------------------------------------------------- |
| `domain/language.md` | the meter's words: window, burn, reset, verdict                        |
| `domain/rules.md`    | which number is measured, where the window opens, what each word means |
| `screens/runway.md`  | what it prints                                                         |
| `evidence.md`        | asking why a rule exists                                               |
