# 📖 Reference: glance-audit

[📚 Docs home](../../../../docs/README.md) › [🔍 glance-audit](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

**Every rule the check holds, in one page.** 3 good · 3 to ask · 4 sentences · 4-word quotes.

## Result fields

| Field       | Limit                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| `subject`   | as the source names it                                                 |
| `verdict`   | one line, answer first                                                 |
| `good`      | 3 at most                                                              |
| `findings`  | `{title, severity, evidence, tests, kept}`, plus `tag` when left out   |
| `comments`  | `{type, group, quote, text}`, plus `after` for a Suggest               |
| `questions` | `{asked, answer}`, both filled                                         |
| `sources`   | `read` (list), `notRead` (list, `[]` when nothing), `notTested` (text) |

Severity is `critical`, `medium` or `low`; a tag is `already raised` or `can wait`.

## Keep rule

Every critical point that passed `real`, `not covered` and `not raised` is kept. With none critical,
the single most severe is kept, two only when equally severe. A kept point is never less severe than
one left out.

## Comments

| Group         | Types              | Limit                               |
| ------------- | ------------------ | ----------------------------------- |
| `post first`  | Challenge, Suggest | one Challenge, one Suggest per kept |
| `good to ask` | Challenge, Ask     | 3 at most                           |
| `reply`       | Reply              | one per entry in `questions`        |
| `more`        | Ask                | none                                |

A `quote` is copied exactly (only spacing may differ), holds at least 4 words or 20 characters, and
occurs once in the source text. `text` is 4 sentences at most.

## Check

`node scripts/check-audit.mjs <audit.json> <source.txt>`: exit 0 `AUDIT OK`, 1 on anything to fix
(an unreadable file or bad JSON is one), 2 when a path is missing. Every problem prints its field,
the problem and the fix.

## Files

| File                                                                           | Role                              |
| ------------------------------------------------------------------------------ | --------------------------------- |
| [`SKILL.md`](../../skills/glance-audit/SKILL.md)                               | the entry Claude reads            |
| [`domain/lenses.md`](../../skills/glance-audit/domain/lenses.md)               | 7 lenses, 3 tests, severity, keep |
| [`domain/result.md`](../../skills/glance-audit/domain/result.md)               | the result's shape and comments   |
| [`scripts/check-audit.mjs`](../../skills/glance-audit/scripts/check-audit.mjs) | the rules as code, 49 tests       |
