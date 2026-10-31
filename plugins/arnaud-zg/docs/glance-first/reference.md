# 📖 Reference: glance-first

[📚 Docs home](../../../../docs/README.md) › [👁️ glance-first](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

**Every limit the check holds, in one page.** 25-word TLDR · 4 figures · 4 blocks · 200 words.

## Reading order

1. the TLDR, 25 words
2. the key numbers, at most 4, a digit in each value, labels of 5 words
3. each block's picture; the first block must carry one
4. the line the picture proves, 15 words

## Brief fields

| Field        | Limit                                                            |
| ------------ | ---------------------------------------------------------------- |
| `title`      | 4 words                                                          |
| `target`     | `artifact`, `pr-description`, `terminal` or `markdown`           |
| `tldr`       | 25 words                                                         |
| `numbers`    | 0 to 4 `{value, label}`; `[]` only when the work holds no figure |
| `blocks`     | 1 to 4, each `heading` (6 words), `line` (15), `picture`, `copy` |
| `fold`       | 2 entries, outside the minute                                    |
| `sources`    | `read`, `notRead`, `notTested`, all three                        |
| `convention` | optional: `lead`, `headings`, `picture`, `banned`, `footer`      |

The read is at most 200 words: title, TLDR, numbers, headings, lines and table cells. Chart source,
images, copy snippets and the fold are looked at, not read.

## Pictures

`mermaid`, `table` (3 columns), `image` (`src` and `alt`) or `none`. The terminal draws tables only,
at 100 columns. What changed is marked `NEW:`, `REVIEW:` or `LATER:`, never by colour alone.

## Check

`node scripts/check-brief.mjs <brief.json>`: exit 0 `BRIEF OK`, 1 on a finding, 2 with no path.
Every finding prints its field, the problem and the fix.

## Files

| File                                                                       | Role                                         |
| -------------------------------------------------------------------------- | -------------------------------------------- |
| [`SKILL.md`](../../skills/glance-first/SKILL.md)                           | the entry Claude reads                       |
| [`scripts/brief.mjs`](../../skills/glance-first/scripts/brief.mjs)         | the limits, as pure functions                |
| [`evals/presents-in-a-minute`](../../evals/presents-in-a-minute/prompt.md) | fires, runs the check, leads with the answer |
