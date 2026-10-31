# Create or edit a skill

1. **Ask what it is for, and when it should fire.** The description is the only thing the host
   matches against: one sentence on what it does, then "Use when …" with the words a person would
   type. 1024 characters at most, the use case first.
2. **The entry routes, it does not teach.** `SKILL.md` says what the skill is for and which page to
   read when. Anything it can do without goes in its own page, linked from the entry and read only
   when needed (why: E-01).
3. **One page per job, by layer when it helps.** The hexagonal habit: the entry is the port, and
   behind it `verbs/` for what Claude does, `domain/` for what stays true, and `adapters/` for the
   tools it touches, with `scripts/` beside them. A habit worth keeping, not a rule: put a page
   where its reader will look for it (why: E-09).
4. **Link with relative Markdown links**, such as `[the guide](guide.md#steps)`, and run scripts
   through `${CLAUDE_SKILL_DIR}`. The check can follow both.
5. **A script comes with its test**, in the same change. If the project has a suite, the test goes
   into it as well.
6. **Say each thing once.** A rule restated in three pages drifts in two of them.
7. **Read [guards.md](guards.md) before writing a number, an output or an edit script.**
8. **Write a README.md beside the entry if people will install it.** The entry is followed as
   instructions, so it is no place for a pitch (why: E-08).

Then run the check.

For `create <name>`, make `<shelf>/<name>/SKILL.md`, where the shelf is the project's skills folder
(`.claude/skills` when unsure), with this frontmatter, then follow the steps above:

```markdown
---
name: <name>
description: <What it does, in one sentence.> Use when <the situations and phrases that fire it>.
---
```
