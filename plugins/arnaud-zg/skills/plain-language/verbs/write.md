# write

1. **Get the level.** Use the level the caller names. If none is named, pick it from the table in
   [SKILL.md](../SKILL.md).
2. **Get the language.** Use the reader's language. Read its adapter in
   [ports/PORTS.md](../ports/PORTS.md).
3. **Write the text** by [domain/rules.md](../domain/rules.md). Put the answer first.
4. **Save it to a file**, then run the check:

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/check-plain.mjs --level <level> --lang <en|fr> <file>
   ```

5. **Fix each finding** at the line it names. Read each hint. Change a passive sentence when you
   know who does the action.
6. **Run the check again** until it prints `PLAIN OK`.
7. **Check rules 4 and 7 yourself.** The script cannot see them.
8. **Hand over the text.** Do not show the check's output unless the caller asks.

## Never

- Change code, a command, a path, a number or a quote to pass the check.
- Remove a fact to make a sentence shorter. Split the sentence instead.
- Hide what is not known. Say it once: "Not tested."
