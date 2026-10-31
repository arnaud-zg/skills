# Create a docs set

1. **Ask who reads the docs and what they come to do.** Users of a library, operators of a service,
   contributors to a repo: each audience gets its own set. Write the answer as the index's pitch
   line.
2. **Size to the need.** A tool under a few hundred lines needs a README with the four headings, not
   four pages. Split into pages when a section outgrows a screen (why: E-04).
3. **Copy the templates as they are.** `templates/` is a whole `docs/` folder: index, the four
   quadrants, `adr/` with its first record, and a gravestone to keep for later. Copy it, then delete
   what the project does not need yet, and the row that links it. When `docs/` already exists, copy
   page by page instead, so nothing is overwritten.

   ```sh
   cp -R ${CLAUDE_SKILL_DIR}/templates docs && rm -f docs/gravestone.md
   ```

4. **Show real examples.** Each reference and how-to links an example file the project's own tests
   run, never a pasted snippet. How those tests are written is the project's choice (why: E-12).
5. **Fill from the code, not from memory.** Every command, flag, field and default in the Reference
   is read from its source, and the table names that source. Every "You should see" in the Tutorial
   is copied from a real run (why: E-08).
6. **Write the Tutorial first, with one path.** It is the page that proves the product works, and
   writing it finds what the other pages must cover.
7. **Title every how-to as a task** ("Rotate the API key"), and keep the list at the top in the
   order of the sections.
8. **Every "why" goes in the Explanation**, each heading a principle stated as a sentence. A real
   design choice also gets a record in `adr/`, linked from there.
9. **Replace every `{placeholder}`.** A page still holding one is not done. Find them with
   `grep -rn '{[A-Za-z]' docs`.
10. **Open every page glance-first.** Under the title, one line that answers the reader's question,
    then the page's key numbers (steps, minutes, limits, defaults) when it has any, then a diagram
    or table before the prose it proves. A reader should know what the page gives them in under one
    minute. When the `glance-first` skill is installed, write that opening with it.
11. **Link the set from the project's README**, one emoji and one line per quadrant, so a reader
    finds the docs from the front door.
12. **Wire the check where it runs.** List the docs folders and banned strings in
    `doc-compass.json`, with `"examples": "<folder>"` when the code has an API a reader calls, then
    call the check with no arguments from a commit hook or the project's verify script, not only
    from CI nobody triggers (why: E-07). Run it, and stop at exit 0.

## Rebuild a messy set

Do not rewrite in place. Sort first, then move:

1. List every page with its quadrant, using [place.md](place.md). A page with two quadrants is
   split, and each half goes to its own page.
2. Move content into the new pages. A page cited from code or other repos leaves a gravestone at its
   old path (why: E-05); any other page is deleted.
3. Rebuild the index last, from what exists, then run the check.
