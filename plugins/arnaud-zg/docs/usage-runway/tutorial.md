# 🚀 Tutorial: get your first GO or PARK

[📚 Docs home](../../../../docs/README.md) › [⏳ usage-runway](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

**5 minutes, 4 steps: install, ask, read, act.**

Five minutes. You will ask whether a 30-minute job fits, read the meter's report line by line, and
act on its last word.

## 1. Install the plugin

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

## 2. Ask whether the work fits

In any Claude Code session, type:

```text
Do we have enough credit for a 30 minute job?
```

Claude runs the meter with the job's length:

```sh
node ${CLAUDE_SKILL_DIR}/scripts/credit.mjs --need 30
```

## 3. Read the report

It prints five lines. This one is a real run:

```text
credit · 5h window opened 21:36 · 2034 turns
  burned    7.1M billed  (measured)
  week      105.0M billed in 7 days  (measured)
  resets    02:36 · 2h45 left  (projected from the window start)
  GO  2h45 of window against 45m needed
```

The first line says when your window opened. The two `burned` lines are for reading only. The
`resets` line says when the window ends and how sure it is, in brackets. The 45m is your 30 minutes
times 1.5.

## 4. Act on the last word

The last line is the verdict. **GO**: start the job. **PARK**: wait until the time it prints, then
ask again.

## Next

- Park a long run and resume it: [How-to guides](how-to.md)
- Every line and field: [Reference](reference.md)
