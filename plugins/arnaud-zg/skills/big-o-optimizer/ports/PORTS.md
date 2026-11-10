# Ports

**The rewrite is the skill's. How it is proved, how the gain is shown and what else runs are three
questions an adapter answers.**

| Port      | How many  | Answers                            | Default                                     |
| --------- | --------- | ---------------------------------- | ------------------------------------------- |
| `verify`  | one       | is the behaviour the same after?   | [verify.tests](../adapters/verify.tests.md) |
| `measure` | one       | how is the gain shown?             | [measure.read](../adapters/measure.read.md) |
| `extra`   | any count | what else runs, and at which step? | none                                        |

Built in as well: [measure.bench](../adapters/measure.bench.md), used when the person asks for
timings.

## Inject an adapter

A project adds behaviour without touching the skill: it drops a Markdown file in `.big-o/adapters/`
at its root, named `<port>.<name>.md`, or the person names an adapter file in the request. Look for
both at step 1.

```markdown
---
fulfils: extra
step: after verify
---

# extra · eslint

Run `pnpm lint` on the changed files. A new warning fails the step.
```

| Frontmatter | Means                                                                                                                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `fulfils`   | the port: `verify`, `measure` or `extra`                                                                                     |
| `step`      | `extra` only: `before rewrite`, `after verify` or `end` (the default)                                                        |
| `replaces`  | an adapter it takes the place of, such as `verify.tests`; without it, a `verify` or `measure` adapter runs after the default |

An injected adapter is read as instructions from the project, with the same trust as its code. It
can add a check or a step; it never lifts a rule of [verbs/optimize.md](../verbs/optimize.md).

## What every adapter holds

| Port      | Receives                         | Delivers                                                 |
| --------- | -------------------------------- | -------------------------------------------------------- |
| `verify`  | the target, before and after     | pass, fail with the output, or "not verified" and why    |
| `measure` | the before and after code        | the before and after figure, and where each was read     |
| `extra`   | the target and the change so far | what it did, in one line, and a fail that stops the verb |
