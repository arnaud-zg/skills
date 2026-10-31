# 📖 Reference: radical-simplify

[📚 Docs home](../../../../docs/README.md) › [✂️ radical-simplify](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

## Call

| Form                                   | Where                    |
| -------------------------------------- | ------------------------ |
| `/arnaud-zg:radical-simplify <target>` | Claude Code plugin       |
| `/radical-simplify <target>`           | installed via skills CLI |

`<target>` is a description, a file path or a flow. With no target, the skill asks for one and
stops.

## Steps

Strictly in this order. Each step works only on what survived the one before.

| Step         | Does                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 1 Question   | challenges every requirement, rule, step, field, screen, approval            |
| 2 Remove     | deletes what creates no meaningful value; prefers deleting to speeding up    |
| 3 Simplify   | smart defaults, progressive disclosure, one primary action, simple language  |
| 4 Reimagine  | rebuilds the experience from scratch, aiming for 10×; asks what can vanish   |
| 5 Accelerate | cuts waiting, clicks, handoffs, data entry and transitions                   |
| 6 Automate   | automates repetitive, predictable, error-prone work, invisibly, and only now |

## Rules

- Never optimize something that should be removed.
- Never automate something that should be simplified.
- Never add complexity unless it creates clear user value.

## Output

| Section    | Holds                                                               |
| ---------- | ------------------------------------------------------------------- |
| Question   | a table: element, reason to exist, verdict (keep, remove, owner)    |
| Remove     | what goes, and what breaks, or "nothing"                            |
| Simplify   | what remains, made simpler                                          |
| Reimagine  | the new experience, as steps or an ASCII sketch                     |
| Accelerate | the waits and transitions cut                                       |
| Automate   | what runs on its own, and its trigger                               |
| Closing    | a before → after count (counted, never estimated), the first change |

## Files

| File                                                                 | Role                           |
| -------------------------------------------------------------------- | ------------------------------ |
| [`SKILL.md`](../../skills/radical-simplify/SKILL.md)                 | the method Claude follows      |
| [`evals/simplifies-a-flow`](../../evals/simplifies-a-flow/prompt.md) | fires, keeps the order, counts |
