# 🚀 Tutorial: run your first retro

[📚 Docs home](../../../../docs/README.md) › [🔁 skill-retro](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

**4 steps: install, measure, ask, read the report.**

At the end of a working session, you will see what the skills cost, ask for a retro, and read the
draft pull requests it books.

## 1. Install the plugin

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

## 2. See what a skill costs

From the repository, run the weight script on the skills folder:

```sh
node plugins/arnaud-zg/skills/skill-retro/scripts/weight.mjs plugins/arnaud-zg/skills
```

Each skill gets one line, then its pages, then the text said twice:

```text
skill-retro  description 369 ch ~93 tok  entry 282 ch ~71 tok  pages 15883 ch ~3971 tok
REPEAT 8 words x3 across skills: "read the verb s file and follow it"
```

## 3. Ask for the retro

In the session you want to learn from, type:

```text
retro
```

Claude reads the transcript, idle time, spend and memory notes, writes one `FINDING` line per
friction, ranks them, then trims, checks and books each fix in turn.

## 4. Read the report

It ends on three kinds of line:

```text
RETRO   <n> findings, <m> booked, <k> dropped
BOOKED  <pull request> <skill> <one line> <before -> after>
DROPPED <skill> <why>
```

Open each `BOOKED` pull request. Merge the ones you agree with; the next session reads the fix.

## Next

- Bind handoffs or deferred rows: [How-to guides](how-to.md)
- Every adapter and exit code: [Reference](reference.md)
