# 🚀 Tutorial: rewrite a note in plain language

[📚 Docs home](../../../../docs/README.md) › [✍️ plain-language](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

**5 minutes, 4 steps: install, ask, check, read.**

You will give the skill a wordy note. You will see the check find what is wrong. Then you will read
the plain version.

## 1. Install the plugin

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

## 2. Ask for a plain version

Type:

```text
Write this plainly, strict level: "We should really consider removing the approval step, since it is
basically legacy complexity that slows down every new user. The tests should then be run; check the
output."
```

## 3. Watch the check

Claude saves the text to a file and runs the check. The first run prints the findings, each with its
line and its fix:

```text
PLAIN 4 findings (strict, en)
  3: filler: "really" carries nothing → delete it, or say the fact it stands for
  3: filler: "basically" carries nothing → delete it, or say the fact it stands for
  5: joined: two ideas joined by `;` → end the first sentence, then start the second
  5: step: the step does not start with a verb → start with the action: "Run…", "Delete…"
```

Claude fixes each finding and runs the check again until it prints:

```text
PLAIN OK 4 sentences, longest 5/20 words (strict, en)
```

## 4. Read the result

```text
Remove the approval step. It slows every new user.

1. Run the tests.
2. Read the output.
```

You now have the same facts in fewer words. Next: [name a level in your own skill](how-to.md).
