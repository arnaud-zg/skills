---
fulfils: source
kind: pull-request
extras: the pull request's link or number, and the forge's command-line tool the caller names
---

# source · pull-request

**A pull request: its description, its diff and its comments, read through the forge's CLI the
caller names.** The audit judges what the pull request claims, not the style of its code; a
line-by-line code review is another job.

## What to read

| Part            | How                                                                                  |
| --------------- | ------------------------------------------------------------------------------------ |
| the description | the title and the body, with the checks and numbers it states                        |
| the diff        | every changed file. A file too large to read is named in what was not read           |
| its comments    | the review comments with their file and line, and the conversation, replies included |
| what it fixes   | the issues or bug reports it links, when a claim depends on them                     |

- Use only the reading commands of the CLI the caller named. Never comment, approve, request
  changes, label, merge or push. Those are the reader's to do.
- If no CLI was named, ask for it. Never pick one.

## The two files

| File        | Holds                                                                                    |
| ----------- | ---------------------------------------------------------------------------------------- |
| source text | the description, the diff, then each comment addressed to the reader, where a Reply goes |
| context     | every other review comment and the conversation, and the linked issues                   |

## Where the lenses bite

- Lens 1: every claim in the description ("fixes", "no behaviour change", "all tests pass") is held
  against the diff. A claim the diff does not show is a Challenge.
- Lens 2: each linked bug is replayed against the diff. Does the change stop it, and where?
- Lens 6: what the diff touches that the description never mentions.
