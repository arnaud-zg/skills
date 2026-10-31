---
fulfils: present
presenter: glance-first
extras: the target, named by the caller, and anything that target's adapter asks for
---

# present · glance-first

**The checked result becomes a glance-first brief, and glance-first draws it.** The audit writes the
brief and stops; it never draws a page, a body or a file itself. The brief's shape and limits are
glance-first's, in [its brief page](../../glance-first/domain/brief.md), and so is its check.

## The target

The caller names it, and it goes into the brief's `target` field as given: one of the targets in
[glance-first's ports](../../glance-first/ports/PORTS.md). If none was named, glance-first asks for
it. Never pick one. On a target with copy boxes, such as a page, each comment gets a Copy button;
elsewhere it is drawn as text to select.

## From the result to the brief

| Brief     | From the result                                                                             |
| --------- | ------------------------------------------------------------------------------------------- |
| `title`   | the `subject`, cut to 4 words                                                               |
| `target`  | the caller's target, as given                                                               |
| `tldr`    | the `verdict`, as written                                                                   |
| block 1   | every kept finding, in one block, as a table; its `post first` comments as `copy`           |
| block 2   | **What is good**: `good` as a one-column table, or the line alone when there is one         |
| block 3   | **Comments to post**: the line "Nothing was posted."; `good to ask` and `reply` as `copy`   |
| block 4   | **Waiting on you**: only when there are `questions`, a table of question and answer         |
| `fold`    | "Left out on purpose": each left-out finding and its tag; "More questions": the `more` asks |
| `sources` | the result's `sources`, as they are                                                         |

## Block 1

- **Heading**: "Fix first" when the kept findings are critical. When none is, "Worth raising", so
  the block says what [the verdict](../domain/result.md#the-verdict) says.
- **Line**: how many points are kept and why they lead, such as "Two points stop the plan as it
  stands."
- **Picture**: a table, one row per kept finding, its columns `Finding`, `Severity` and `Evidence`,
  filled from each finding's `title`, `severity` and `evidence`. Every kept finding has its row.
  When the brief check refuses the table, for the word budget or for the target's width, shorten the
  evidence cells in the brief and keep the full evidence in the result; never drop a row.
- When nothing was kept, block 1 is dropped and the blocks move up.

## Copy and fold

- A comment's `copy` label is its type and the start of its quote:
  `Challenge, on "makes a breaking change"`. Its text is the comment, and for a Suggest, "Before:"
  the quote and "After:" the new wording.
- A fold entry's text joins its items with semicolons. The fold is proof: a point the reader must
  act on is a block, never folded.

## Hand it over

1. Write the brief as JSON in the scratch folder, next to the result.
2. Check it with glance-first's own [check-brief.mjs](../../glance-first/scripts/check-brief.mjs):

   ```sh
   node <glance-first's folder>/scripts/check-brief.mjs <brief.json>
   ```

   On a problem, fix the brief, never the result, unless the fix changes what the audit says; then
   fix the result and run `check-audit.mjs` again first.

3. Hand the checked brief file to glance-first's `present` verb, which skips its own gathering for a
   finished brief and draws it on the target.

glance-first hands back where the result is. The audit's own hand-over then follows, in the verb.
