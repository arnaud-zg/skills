# 📖 Reference: usage-runway

[📚 Docs home](../../../../docs/README.md) › [⏳ usage-runway](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

**Every flag, line and field, in one page.** 5h window · x 1.5 margin · 2 days read · 2 verdicts.

## Command

`node scripts/credit.mjs [--need <minutes>] [--json]`. It exits 0 on GO and on PARK; the verdict is
the last line, or the `verdict` field.

| Flag               | Does                                                       |
| ------------------ | ---------------------------------------------------------- |
| nothing            | the window: when it opened, what it burned, when it resets |
| `--need <minutes>` | whether one unit of work of that length fits: GO or PARK   |
| `--json`           | the same report, for another script                        |

## Verdicts

| Verdict  | When                                                                          |
| -------- | ----------------------------------------------------------------------------- |
| **GO**   | the window has `need x 1.5` left and no limit is in flight, or no `--need`    |
| **PARK** | it does not, or a limit was hit and has not lifted; the reset time is printed |

## Report lines

| Line     | Honesty                                                           |
| -------- | ----------------------------------------------------------------- |
| `credit` | window length, when it opened, turns in it                        |
| `burned` | billed tokens this window, `(measured)`, never decided on         |
| `week`   | billed tokens in 7 days, `(measured)`                             |
| `resets` | `(exact, a limit was hit)` or `(projected from the window start)` |
| verdict  | `GO` or `PARK` and the reason                                     |

## JSON fields

`windowHours`, `windowStart`, `turns`, `billedTokens`, `weekBilledTokens`, `resetAt`,
`resetIsExact`, `headroomMinutes`, `needMinutes` (`null` with no `--need`), `verdict`, `because`.

## What it reads

Every `.jsonl` under `~/.claude/projects/`, every project, up to three directories deep; files not
touched for a week are skipped. Billed is
`input_tokens + output_tokens + cache_creation_input_tokens`; cache reads are not counted. A limit
hit is a line carrying `quotaLimits`, `five_hour` or `seven_day`.

## Files

| File                                                                 | Role                                   |
| -------------------------------------------------------------------- | -------------------------------------- |
| [`SKILL.md`](../../skills/usage-runway/SKILL.md)                     | the entry Claude reads                 |
| [`scripts/credit.mjs`](../../skills/usage-runway/scripts/credit.mjs) | the window and the verdict             |
| [`domain/rules.md`](../../skills/usage-runway/domain/rules.md)       | what is measured, what each word means |

## Example

[`examples/usage-runway/decide.mjs`](../../examples/usage-runway/decide.mjs): two hours of work
against forty minutes of window: PARK.
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs it.
