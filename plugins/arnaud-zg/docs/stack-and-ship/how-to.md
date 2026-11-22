# 🛠️ How-to guides: stack-and-ship

[📚 Docs home](../../../../docs/README.md) › [🚢 stack-and-ship](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

**3 verbs, 1 project file, every house rule in that file.**

| To…                                  | Change                                       |
| ------------------------------------ | -------------------------------------------- |
| require a line in every PR body      | a `required` entry in the adapter's PR rules |
| ban text from PR bodies              | a `banned` entry                             |
| ship without phases                  | leave `phaseId` out                          |
| use another forge or board           | a drop-in adapter and `--bind`               |
| keep the project file somewhere else | `--project <file>`                           |

## Require a line in every body

Add an entry to `required`. To ask for screenshots or an explicit "No UI change", outside comments:

```json
{
  "rule": "screenshots",
  "pattern": "!\\[[^\\]]*\\]\\(|no\\s+ui\\s+change",
  "fix": "embed the screenshots, or say `No UI change`",
  "shown": true
}
```

## Ban a closing keyword, or allow one

A project whose release tooling closes issues itself bans `Closes #N` in the shown text:

```json
{
  "rule": "closing-keyword",
  "pattern": "\\bclose[sd]?\\s+#\\d+",
  "fix": "remove it",
  "shown": true
}
```

A project that wants the keyword moves the same pattern to `required`.

## Ship without phases

Leave `phaseId` out. Titles read `fix(cart): totals round once` and branches
`fix/totals-round-once`. A `[S30]` in a title is then refused.

## Use another forge or board

Write `.agents/adapters/stack-and-ship/forge.gitlab.md` with `fulfils: forge` and the commands for
each step, then bind it: `--bind "forge=gitlab"`. With no board, bind none and the board steps say
they are skipped.

## Stack a phase

Ask _stack these PRs_. Each step branches from the previous one, and its PR is based on it. The
stack is registered through the forge's calls that never push. A fix to a lower PR is merged up into
every branch above, never rebased.

## Example

[`project.acme.md`](../../examples/stack-and-ship/project.acme.md) and
[`body.md`](../../examples/stack-and-ship/body.md): a PR that holds every rule.
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs it.
