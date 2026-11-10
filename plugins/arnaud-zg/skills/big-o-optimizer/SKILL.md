---
name: big-o-optimizer
description:
  Finds the hot path in a piece of code, names its time complexity, and rewrites it to a lower Big O
  (O(n²) to O(n), O(n) to O(1) or O(log n)) without changing what it returns, then proves both with
  the project's tests. Extra behaviour, such as a benchmark, a profiler or a lint, plugs in as an
  adapter the project drops in. Use when asked to "optimize this", "reduce the complexity", "make it
  O(n)", "this is too slow", "remove the nested loop", "what is the Big O", or when
  "/arnaud-zg:big-o-optimizer" is typed.
argument-hint: "[file, function or snippet to optimize]"
---

# big-o-optimizer

**Lower the Big O, keep the behaviour, prove both.** A rewrite that is faster but returns something
else is a bug, and a rewrite that is "probably faster" is a guess. The skill reads the code, cuts
the complexity with a known pattern, and hands back the before and after, each one read from the
code or from a command's output.

The target is the argument, or what the conversation points at. If there is no target, ask for one
and stop.

## Verb

| Verb         | Does                                                               | File                                   |
| ------------ | ------------------------------------------------------------------ | -------------------------------------- |
| **optimize** | reads, names the Big O, picks a pattern, rewrites, verifies, hands | [verbs/optimize.md](verbs/optimize.md) |

Read the verb's file and follow it.

## Ports

Three questions are asked of the world: how the behaviour is proved the same (`verify`), how the
gain is shown (`measure`), and what else runs (`extra`). Each has a default adapter, and a project
can inject its own. [ports/PORTS.md](ports/PORTS.md) says how.

## Map

- [domain/patterns.md](domain/patterns.md): read when picking a rewrite.
- [ports/PORTS.md](ports/PORTS.md): read when choosing or injecting an adapter.
