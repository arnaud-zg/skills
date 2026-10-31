# 📖 Reference: skill-retro

[📚 Docs home](../../../../docs/README.md) › [🔁 skill-retro](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · **📖 Reference** ·
[💡 Explanation](explanation.md)

**3 ports, 8 adapters, 3 scripts, one report.** Kinds: `wrong`, `slow`, `expensive`.

## Default binding

```text
feedback=transcript,idle,spend,memory; shape=hexagonal; stack=gh-stack
```

`;` between ports, `,` between adapters, `(key=value, …)` for an adapter's values.

## Adapters

| Port       | Adapter      | Reads or does                                   | Takes                                     |
| ---------- | ------------ | ----------------------------------------------- | ----------------------------------------- |
| `feedback` | `transcript` | the session's own record                        |                                           |
| `feedback` | `idle`       | silences inside the session's budget            | `window`, `transcripts`                   |
| `feedback` | `spend`      | tokens and time per agent                       | `window`, `transcripts`                   |
| `feedback` | `memory`     | feedback notes the session wrote or changed     |                                           |
| `feedback` | `handoffs`   | review findings and escalations (opt-in)        |                                           |
| `feedback` | `deferred`   | rows a run deferred to a skill (opt-in)         | `tag`                                     |
| `shape`    | `hexagonal`  | the hexagonal-skill-builder `check.mjs`         |                                           |
| `stack`    | `gh-stack`   | one draft pull request per fix, with `gh stack` | `skills-prefix`, `feature-prefix`, `base` |

## Scripts

| Script                                                              | Usage                                                                               | Exit                          |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------- |
| [`weight.mjs`](../../skills/skill-retro/scripts/weight.mjs)         | `<skills-folder> [--json]`                                                          | 0 measured, 2 nothing         |
| [`gaps.mjs`](../../skills/skill-retro/scripts/gaps.mjs)             | `<transcript.jsonl \| folder> [--window <file.json>] [--min 30] [--spend]`          | 0 measured, 2 nothing         |
| [`stack-base.mjs`](../../skills/skill-retro/scripts/stack-base.mjs) | `--skills-prefix <p> --feature-prefix <p> --base <branch>`, stdin or `--prs <file>` | 0 branch, 1 `REFUSE`, 2 input |

Tokens are an estimate, characters / 4. Tests: `node --test` in `scripts/` (43 pass).

## Lines

```text
FINDING <skill> | slow, wrong or expensive | <evidence> | <adapter>
RETRO   <n> findings, <m> booked, <k> dropped
BOOKED  <pull request> <skill> <one line> <before -> after>
DROPPED <skill> <why>
```

`RETRO 0 findings` when nothing is left after Gather.

## Files

| File                                                          | Role                     |
| ------------------------------------------------------------- | ------------------------ |
| [`SKILL.md`](../../skills/skill-retro/SKILL.md)               | the entry Claude reads   |
| [`verbs/retro.md`](../../skills/skill-retro/verbs/retro.md)   | the five steps           |
| [`domain/rules.md`](../../skills/skill-retro/domain/rules.md) | the four rules           |
| [`ports/PORTS.md`](../../skills/skill-retro/ports/PORTS.md)   | ports, adapters, binding |
