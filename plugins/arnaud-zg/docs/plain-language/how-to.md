# 🛠️ How-to guides: plain-language

[📚 Docs home](../../../../docs/README.md) › [✍️ plain-language](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

**One recipe per task.** For the first run, see the [Tutorial](tutorial.md).

## Check a file

```sh
node plugins/arnaud-zg/skills/plain-language/scripts/check-plain.mjs --level standard README.md
```

Exit 1 means a finding. Use it in a commit hook or in CI as it is.

## Check text from another program

Send it on stdin with `-`:

```sh
gh pr view 42 --json body -q .body | node check-plain.mjs --level standard -
```

## Check French text

```sh
node check-plain.mjs --lang fr notes.md
```

Without `--lang`, the check guesses the language from its common words.

## Name a level in your own skill

1. Find the step where your skill hands its text to a person.
2. Pick the level from the [reference](reference.md#levels).
3. Add one line to that step:

   ```markdown
   Write this output at **standard** level, by `plain-language`, if installed.
   ```

4. Keep "if installed". Your skill must still work alone.

## Give two parts of one text two levels

Write each part to its own file. Check each file with its own `--level`. A report at standard can
end on fixes at strict.

## Example

[`examples/plain-language/before.md`](../../examples/plain-language/before.md): a note the strict
check finds 4 findings in. [`after.md`](../../examples/plain-language/after.md) is the same note,
plain. [`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs both.
