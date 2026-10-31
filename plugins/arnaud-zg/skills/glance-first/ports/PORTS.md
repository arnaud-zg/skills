# Ports

**The brief is the substance. Where it lands is one question, answered by the caller.**

| Port     | The one question it answers                   |
| -------- | --------------------------------------------- |
| `target` | where is the brief rendered, and in what form |

The caller names the target in the brief's `target` field. The skill never guesses it from the work,
and the check refuses a brief without one. When the caller has not named it, ask one question: "An
artifact page, a pull request description, the terminal, or a Markdown file?"

## What every target adapter holds

| Receives                                                 | Delivers                                         | Never                                       |
| -------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------- |
| a brief that printed `BRIEF OK`, and the caller's extras | the brief drawn in the target's form, TLDR first | adds, drops or reorders what the brief says |

Each adapter states how it draws each field and where the result goes. Which pictures a target draws
and how wide a table may be are held once, in `TARGETS` in
[scripts/brief.mjs](../scripts/brief.mjs); a test fails when the adapters and `TARGETS` name
different targets. Another target is another adapter plus one entry there.

| Target           | Adapter                                                          |
| ---------------- | ---------------------------------------------------------------- |
| `artifact`       | [target.artifact.md](../adapters/target.artifact.md)             |
| `pr-description` | [target.pr-description.md](../adapters/target.pr-description.md) |
| `terminal`       | [target.terminal.md](../adapters/target.terminal.md)             |
| `markdown`       | [target.markdown.md](../adapters/target.markdown.md)             |
