# 📖 Reference: plain-language

[📚 Docs home](../../../../docs/README.md) › [✍️ plain-language](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

**Every level, rule, option and exit code.**

## Levels

| Level      | For                                       | Words per sentence | Steps start with a verb | Passive hint |
| ---------- | ----------------------------------------- | ------------------ | ----------------------- | ------------ |
| `strict`   | steps, fixes, commands, a how-to          | 20                 | yes                     | yes          |
| `standard` | a report, verdict, finding, PR body, TLDR | 25                 | no                      | yes          |
| `light`    | a comment to paste, a question            | 25                 | no                      | no           |

## Rules

| #   | Rule                                  | Finding   | Checked by        |
| --- | ------------------------------------- | --------- | ----------------- |
| 1   | Stay under the word limit             | `long`    | script            |
| 2   | One idea per sentence, no `;`         | `joined`  | script            |
| 3   | Active voice                          | `passive` | script, hint only |
| 4   | One term for one thing                | none      | the writer        |
| 5   | Numbered steps that start with a verb | `step`    | script, strict    |
| 6   | No filler                             | `filler`  | script            |
| 7   | The condition first                   | none      | the writer        |

## What the check never reads

Frontmatter, headings, block quotes, fenced code, inline code, link targets and URLs. Each table
cell is read as its own sentence.

## Command

```text
node scripts/check-plain.mjs [--level strict|standard|light] [--lang en|fr|auto] [--json] <file | ->
```

| Option    | Default    | Does                                      |
| --------- | ---------- | ----------------------------------------- |
| `--level` | `standard` | the level to check against                |
| `--lang`  | `auto`     | the language of the filler and verb lists |
| `--json`  | off        | prints the report as JSON                 |
| `-`       |            | reads stdin instead of a file             |

## Exit codes

| Code | Means                                           |
| ---- | ----------------------------------------------- |
| 0    | no finding. Hints alone still give 0            |
| 1    | at least one finding                            |
| 2    | a bad option, no file, or a file it cannot read |

## Languages

| Code | Filler words, for example                                |
| ---- | -------------------------------------------------------- |
| `en` | `really`, `just`, `basically`, `leverage`, `in order to` |
| `fr` | `vraiment`, `en effet`, `il convient de`, `afin de`      |

The full lists live in `LANGUAGES` in `scripts/plain.mjs`.

## Example

[`examples/plain-language/before.md`](../../examples/plain-language/before.md) and
[`after.md`](../../examples/plain-language/after.md): a note before and after, checked at strict.
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs both.
