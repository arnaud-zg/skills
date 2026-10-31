---
fulfils: source
kind: document
extras: the path, or the pasted text, and any comments or thread the caller can hand over
---

# source · document

**A file on disk or text pasted into the conversation.** A design note, a proposal, a plan, a
decision record, a postmortem.

## What to read

| Part             | How                                                                             |
| ---------------- | ------------------------------------------------------------------------------- |
| the document     | the whole file, or the whole paste. A long file is read in parts, never skimmed |
| its comments     | the comments the caller hands over, or inline notes in the file itself          |
| its thread       | a discussion the caller pastes or points at as a file                           |
| what claims rest | the linked files and documents a claim depends on, not every link               |

A link the host cannot open goes in what was not read. Never guess what it says.

## The two files

| File        | Holds                                                                                  |
| ----------- | -------------------------------------------------------------------------------------- |
| source text | the document, then each comment addressed to the reader, since a Reply is posted there |
| context     | every other comment, the thread, and the linked documents                              |

## Where the lenses bite

Every lens applies. For a postmortem, lens 2 replays its own timeline: does the fix it proposes stop
the failure at the point the timeline shows? For a plan, lenses 4 and 5 do most of the work.
