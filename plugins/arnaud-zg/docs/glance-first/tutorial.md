# 🚀 Tutorial: present a change in one minute

[📚 Docs home](../../../../docs/README.md) › [👁️ glance-first](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

Five minutes. You will hand the skill a change, read the brief it checks, and see the page it draws.

## 1. Install the plugin

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

## 2. Ask for a one-minute read

On a branch with a change, type:

```text
Give me a TLDR of this branch as an artifact page.
```

## 3. Watch the brief get checked

Claude writes a JSON brief in a scratch folder and runs the check on it. The first run often prints
findings, each with its field and its fix:

```text
BRIEF 2 findings
  numbers[0].value: holds no digit → write the figure itself, such as 3x
  blocks[0].picture: is none: the first block must show a picture → give the first block the diagram, chart or table that shows the answer
```

Claude fixes every finding in one pass and runs it again until it prints:

```text
BRIEF OK 142/200 words, 3/4 blocks, target artifact
```

## 4. Read it the way your reader will

Open the page. Read only the first line: you know the answer. Glance at the numbers under it: you
know how big it is. Look at the first diagram: you see what changed, marked `NEW:`. Stop there if
you like; the rest is proof.

## Next

- Write a pull request body instead: [How-to guides](how-to.md)
- Every field and limit: [Reference](reference.md)
