# present

**One brief, checked, drawn once.** The brief is the only thing the target adapters read, so every
limit is held in one place before any drawing starts.

## Inputs

| Input  | From the caller                                                                |
| ------ | ------------------------------------------------------------------------------ |
| work   | what to present: a diff, a branch, a file, a page, a thread, or pasted text    |
| target | one of the targets in [ports/PORTS.md](../ports/PORTS.md)                      |
| extras | anything the target's adapter asks for, such as a PR convention or a file path |

With no target, ask the one question [ports/PORTS.md](../ports/PORTS.md) gives, and stop until it is
answered.

A caller that hands over a finished brief file skips steps 1 and 2.

## Steps

1. **Gather.** Read the work as given, and write down every figure in it first: counts, sizes,
   times, percentages, before and after. They become the brief's `numbers`. Note what you did not
   read and what nobody ran: those go in `sources.notRead` and `sources.notTested`. If the work
   holds credentials or personal data, keep them out of the brief.
2. **Write the brief** as JSON in a scratch folder, by [domain/brief.md](../domain/brief.md). Pick
   each block's picture with [domain/pictures.md](../domain/pictures.md). If the target's adapter
   takes a convention, read the adapter first: it says how the convention becomes the brief's
   `convention` field and blocks, so the check sees every word that will be drawn.
3. **Check it.** Run:

   ```sh
   node ${CLAUDE_SKILL_DIR}/scripts/check-brief.mjs <brief.json>
   ```

   It prints `BRIEF OK` with the read size, or one line per finding with its field and its fix. Make
   every fix in one pass and run it again. Stop at `BRIEF OK`. A finding the caller must settle,
   such as a convention that needs more blocks than the limit, goes to the caller unfixed.

4. **Draw it** by the target's adapter, from the brief and nothing else. The adapter decides the
   form; the brief decides the substance.
5. **Look once.** Open what you drew, or read it back, and check the list below. Fix what you see in
   one pass. Do not loop.
6. **Hand over** in four lines or fewer: where it is (the link, the path or the text), the TLDR, the
   limits (not read, not tested), and any decision the caller must make.

## Before you hand over

- Read only the TLDR and the numbers. Do you know the answer, and how big it is?
- Look only at the first picture. Does it show the answer?
- The words follow [domain/brief.md](../domain/brief.md#the-words).
- People are "a reviewer" or "the author", never named.
- What changed is marked by
  [domain/pictures.md](../domain/pictures.md#the-three-looks-for-what-changed).
- Anything not tested says so.
