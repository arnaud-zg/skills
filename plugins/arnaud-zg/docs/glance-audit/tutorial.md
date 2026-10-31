# 🚀 Tutorial: audit a plan in one minute

[📚 Docs home](../../../../docs/README.md) › [🔍 glance-audit](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

**5 minutes, 4 steps: install, ask, check, read.**

Five minutes. You will hand the skill a plan, watch its result get checked against the plan, and
read the verdict glance-first draws.

## 1. Install the plugin

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

## 2. Ask for an audit

With a proposal saved as `plan.md`, type:

```text
Audit plan.md and challenge its claims. Show it in the terminal.
```

## 3. Watch the result get checked

Claude saves the plan as the source text, writes a JSON result in a scratch folder and runs the
check on both. A first run often prints a quote that is not word for word:

```text
AUDIT 1 to fix
  comments[0].quote: "makes a break impossible" is not in the source → copy the passage again, exactly
```

Claude fixes every finding in one pass and runs it again until it prints:

```text
AUDIT OK 1 of 1 finding kept, 1 comment, every quote found
```

## 4. Read the verdict

Read only the first line, such as "Good idea. One thing to fix.": you know the answer. Look at the
**Fix first** table: the finding, its severity, its evidence. Copy the Challenge under it and paste
it on the plan yourself. Nothing was posted.

## Next

- Audit a pull request or a status report: [How-to guides](how-to.md)
- Every field and rule: [Reference](reference.md)
