# Ports

**The rewrite is the skill's. The language's details, how it is proved, how the gain is shown and
what else runs are questions an adapter answers.** Every port works with no adapter given.

| Port       | How many  | Answers                                     | Default                                     |
| ---------- | --------- | ------------------------------------------- | ------------------------------------------- |
| `language` | one       | which structures, costs and pitfalls apply? | [language.any](../adapters/language.any.md) |
| `verify`   | one       | is the behaviour the same after?            | [verify.tests](../adapters/verify.tests.md) |
| `measure`  | one       | how is the gain shown?                      | [measure.read](../adapters/measure.read.md) |
| `extra`    | any count | what else runs, and at which step?          | none                                        |

Built in as well:

- `language`: [javascript](../adapters/language.javascript.md) (and TypeScript),
  [python](../adapters/language.python.md), [go](../adapters/language.go.md). Picked by the target's
  file extension; any other language falls back to `language.any`.
- `measure`: [measure.bench](../adapters/measure.bench.md), used when the person asks for timings.

## Inject an adapter

A project drops `<port>.<name>.md` in `.big-o/adapters/` at its root, or the person names an adapter
file in the request; look for both at step 1. How a drop-in is found, trusted and ranked is the
[shared contract](CONTRACT.md#drop-in-the-project-adds), so `.big-o/adapters/language.rust.md`
teaches the skill Rust. The keys of this skill's own, on top of `fulfils` and `replaces`:

| Frontmatter | Means                                                                 |
| ----------- | --------------------------------------------------------------------- |
| `matches`   | `language` only: the file extensions it covers, such as `.rs`         |
| `step`      | `extra` only: `before rewrite`, `after verify` or `end` (the default) |

Without `replaces`, a `verify` or `measure` adapter runs after the default. No adapter lifts a rule
of [verbs/optimize.md](../verbs/optimize.md).

## What every adapter holds

| Port       | Receives                         | Delivers                                                        |
| ---------- | -------------------------------- | --------------------------------------------------------------- |
| `language` | the target's language            | the hash set, hash map, heap and buffer to use, costs, pitfalls |
| `verify`   | the target, before and after     | pass, fail with the output, or "not verified" and why           |
| `measure`  | the before and after code        | the before and after figure, and where each was read            |
| `extra`    | the target and the change so far | what it did, in one line, and a fail that stops the verb        |
