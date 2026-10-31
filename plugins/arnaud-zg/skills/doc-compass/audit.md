# Audit a docs set

1. **Find every docs folder and its index.** Usually `docs/README.md`. When a folder's home is a
   README above it, its index is `../README.md`.
2. **Find the house style.** Read the project's agent instructions (`CLAUDE.md`, `AGENTS.md`) for
   anything banned in prose (why: E-09).
3. **Write both into `doc-compass.json`** at the project root, unless it has one, then run the check
   with no folder and keep its output:

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/check-docs.mjs
   ```

4. **Report the counts the check printed, per rule**, and the first few findings of each, as
   printed. Never round, estimate or recall a count (why: E-08).
5. **Then read for what no check sees**, page by page, against [guards.md](guards.md): a page with
   two quadrants, a tutorial with options, a how-to titled as a topic, a reference that argues,
   callouts piled on a page. Name each with its file and line.
6. **Fix in this order:** `resolves` (a reader hits it now), then `indexed` and `framed` (a reader
   cannot find the page), then the rest. Run the check after each batch.
7. **Too many findings for one change?** Fix the broken links, then record the remaining count as a
   baseline that may only go down (see [maintain.md](maintain.md#gaps-too-big-for-one-change)).

## The rules

| Rule         | Says                                                                | Usual fix                                       | Why         |
| ------------ | ------------------------------------------------------------------- | ----------------------------------------------- | ----------- |
| `indexed`    | every page can be reached from the index (gravestones excepted)     | a row in the index, or in a page it links       | (why: E-01) |
| `resolves`   | every relative link and heading anchor exists                       | point at the new name, or leave a gravestone    | (why: E-02) |
| `framed`     | every page links to the index, or its section's README, in 10 lines | copy the breadcrumb from its template           | (why: E-01) |
| `superseded` | a record "superseded by" another is linked back from it             | add "Supersedes" and a link to the newer record | (why: E-10) |
| `generated`  | a "Generated … from \`source\`" header names a source that exists   | fix the header, then regenerate                 | (why: E-06) |
| `small`      | every page fits in 300 lines                                        | split it by quadrant, see [place.md](place.md)  | (why: E-04) |
| `banned`     | no page holds a string passed with `--ban`                          | rewrite the sentence                            | (why: E-09) |

A clean check is the start of an audit, not its end.
