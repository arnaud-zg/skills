# 📖 Reference: big-o-optimizer

[📚 Docs home](../../../../docs/README.md) › [⚡ big-o-optimizer](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

## Call

| Form                                  | Where                    |
| ------------------------------------- | ------------------------ |
| `/arnaud-zg:big-o-optimizer <target>` | Claude Code plugin       |
| `/big-o-optimizer <target>`           | installed via skills CLI |

`<target>` is a file, a function or a snippet. With no target, the skill asks for one and stops.

## Steps

| Step             | Does                                                                     |
| ---------------- | ------------------------------------------------------------------------ |
| 1 Load adapters  | the defaults, then `.big-o/adapters/` and any named in the request       |
| 2 Read           | the target and every function it calls in a loop                         |
| 3 Name the Big O | each term, quoted from its lines, with what `n` is                       |
| 4 Pick           | a pattern for the worst term, or stop when none pays                     |
| 5–7 Verify       | before, rewrite the smallest piece, verify after                         |
| 8 Measure        | by `measure`, then each `extra` at its step                              |
| 9 Hand over      | path, before, after, pattern, verified; space cost; what was not checked |

## Ports

| Port       | Default        | Other built in                                                   | Injected from                        |
| ---------- | -------------- | ---------------------------------------------------------------- | ------------------------------------ |
| `language` | `language.any` | `javascript` (and TypeScript), `python`, `go`, by file extension | `.big-o/adapters/language.<name>.md` |
| `verify`   | `verify.tests` |                                                                  | `.big-o/adapters/verify.<name>.md`   |
| `measure`  | `measure.read` | `measure.bench`                                                  | `.big-o/adapters/measure.<name>.md`  |
| `extra`    | none           |                                                                  | `.big-o/adapters/extra.<name>.md`    |

Frontmatter: `fulfils` (the port), `matches` (`language` only: file extensions), `step` (`extra`
only), `replaces` (an adapter to take the place of). `fulfils` and `replaces` follow the
[shared port and adapter contract](../../skills/hexagonal-architecture/domain/contract.md).

## Patterns

Hash set or hash map lookup, one pass with a seen-map, bucket grouping, sort once or a heap, binary
search, prefix sums, sliding window or two pointers, top-k heap, memoize or hoist, join once, index
pointer instead of `shift`, batched query for N+1, early exit. Each with its before, after and space
cost in [`domain/patterns.md`](../../skills/big-o-optimizer/domain/patterns.md).

## Files

| File                                                                  | Role                     |
| --------------------------------------------------------------------- | ------------------------ |
| [`SKILL.md`](../../skills/big-o-optimizer/SKILL.md)                   | the entry                |
| [`verbs/optimize.md`](../../skills/big-o-optimizer/verbs/optimize.md) | the steps                |
| [`ports/PORTS.md`](../../skills/big-o-optimizer/ports/PORTS.md)       | ports and injection      |
| [`evals/lowers-the-big-o`](../../evals/lowers-the-big-o/prompt.md)    | fires, uses a Set, O → O |

## Example

[`examples/big-o-optimizer/after.mjs`](../../examples/big-o-optimizer/after.mjs): the O(n+m)
rewrite. [`examples.integration.test.ts`](../../examples/examples.integration.test.ts) proves it
returns what [`before.mjs`](../../examples/big-o-optimizer/before.mjs) returns.
