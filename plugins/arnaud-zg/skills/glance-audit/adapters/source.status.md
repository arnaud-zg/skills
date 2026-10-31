---
fulfils: source
kind: status
extras: the report or status box, and the read-only commands the caller allows for checking it
---

# source · status

**A run's report or status box, checked against the files and numbers it claims.** A summary at the
end of a piece of work, a progress report, a "where we are" box. Here lens 1 does most of the work:
a status is a list of claims.

## What to read

| Part        | How                                                                                 |
| ----------- | ----------------------------------------------------------------------------------- |
| the report  | the whole text, as handed                                                           |
| its files   | every file, commit or branch it names: open it and see that it exists and says that |
| its numbers | every count, score, time or result: copy it again from what prints it               |
| its thread  | the request the report answers, so a claim can be held against what was asked       |

- A number is read, never reckoned: copy it from the file or the command that prints it. Never work
  it out from another number.
- Run only read-only commands, and only those the caller allows. A number that needs a long job, or
  a command that writes, is not checked: it goes in what was not tested, and becomes an Ask.
- A claim of "done", "all green" or "nothing left" is held against what was asked for, not only
  against what was done.

## The two files

| File        | Holds                                                                      |
| ----------- | -------------------------------------------------------------------------- |
| source text | the report alone, as handed                                                |
| context     | every file excerpt and command output you used, and the request it answers |

A quote that only the context holds fails the check: a comment is posted on the report, so its
anchor is the report's own words.

## Where the lenses bite

- Lens 1: each number and each "done" against what prints it.
- Lens 3: when was it true? A result from before the last change may no longer hold.
- Lens 6: what was asked for and is not in the report at all.
