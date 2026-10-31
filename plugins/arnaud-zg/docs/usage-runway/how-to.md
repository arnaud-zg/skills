# 🛠️ How-to guides: usage-runway

[📚 Docs home](../../../../docs/README.md) › [⏳ usage-runway](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

**1 script, 3 ways to call it, 1 word to act on.**

| Ask for…                    | Pass        | You get                          |
| --------------------------- | ----------- | -------------------------------- |
| _how much is left?_         | nothing     | the window, the reset, a GO      |
| _does a 40 minute job fit?_ | `--need 40` | GO, or PARK until a printed time |
| _the report for a script_   | `--json`    | the same report as JSON          |

## See what is left in the window

```sh
node ${CLAUDE_SKILL_DIR}/scripts/credit.mjs
```

With no `--need` it answers `GO  nothing to size against; pass --need <minutes>`. Read the `resets`
line.

## Check a job before you start it

Pass the job's length in minutes, your plain estimate, without a margin:

```sh
node ${CLAUDE_SKILL_DIR}/scripts/credit.mjs --need 120
```

```text
  PARK  the window resets in 2h45, under the 3h00 this needs; wait until 02:36
```

## Park a long run and resume it

Check before every unit of work, not once at the start. On **PARK**, stop at that boundary, print
the reset time you are waiting for, and once you resume, say how long you waited.

## Wait out a limit already hit

If a limit was hit, the meter answers PARK whatever the window says, with
`a limit was hit; it lifts at <time>`. A weekly one reads `the weekly limit was hit` and can lift
days later; wait for its time, not the five-hour reset.

## Feed the report to another script

```sh
node ${CLAUDE_SKILL_DIR}/scripts/credit.mjs --need 40 --json
```

Branch on `verdict`. The script exits 0 for both GO and PARK, so read the word, not the exit code.

## Check before a long retro

[skill-retro](../skill-retro/README.md) asks this skill for GO or PARK before a long retro, when it
is installed.

## Example

[`examples/usage-runway/decide.mjs`](../../examples/usage-runway/decide.mjs): two hours of work
against forty minutes of window: PARK.
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs it.
