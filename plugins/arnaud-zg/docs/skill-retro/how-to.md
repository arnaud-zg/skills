# 🛠️ How-to guides: skill-retro

[📚 Docs home](../../../../docs/README.md) › [🔁 skill-retro](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

**One `--bind` swaps any port; the rest keep their default.**

| Ask for…            | Binding change                          |
| ------------------- | --------------------------------------- |
| _retro_ (default)   | `feedback=transcript,idle,spend,memory` |
| review findings too | add `handoffs`                          |
| parked work too     | add `deferred` or `deferred(tag=…)`     |
| other branch names  | `stack=gh-stack(skills-prefix=…, …)`    |

## Retro only some skills

Name them after the command: `/arnaud-zg:skill-retro glance-first doc-compass`. Without names, every
skill the session fired is gathered.

## Add subagent handoffs and deferred rows

```text
/arnaud-zg:skill-retro --bind "feedback=transcript,idle,spend,memory,handoffs,deferred(tag=skills)"
```

Each port named replaces the default for that port only.

## Set the stack's branch names

```text
--bind "stack=gh-stack(skills-prefix=skills/, feature-prefix=feat/, base=main)"
```

A step that needs a key left unset stops and names the key.

## Bound idle time to a budget

Write a JSON file with `bookedAt` and `end`, and bind it as the `window` of `idle` and `spend`.
Without one, `idle` writes `idle: no budget bound`.

## Measure spend by hand

```sh
node plugins/arnaud-zg/skills/skill-retro/scripts/gaps.mjs <transcripts> --window <window> --spend
```

## Find the base for a fix by hand

```sh
gh pr list --state open --limit 200 --json number,headRefName,baseRefName,isDraft,state |
  node plugins/arnaud-zg/skills/skill-retro/scripts/stack-base.mjs \
    --skills-prefix skills/ --feature-prefix feat/ --base main
```

It prints one branch and exits 0, or a `REFUSE` line and exits 1.
