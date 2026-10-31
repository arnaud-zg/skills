---
name: hexagonal-skill-builder
description:
  Writes Agent Skills and checks them against four rules a script can hold (named, small, resolves,
  tested), printing the file, line and fix for anything that breaks one, plus seven guards for what
  no script can see. Use when creating a skill, editing a SKILL.md, or asked "is this skill well
  built", "check the skills" or "lint my skills".
argument-hint: "[check|create] [<path or name>]"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/check.mjs *)
---

# Hexagonal Skill Builder

**A skill is read by a model that does what it says, so the shape of a skill is its behaviour.**
Four rules hold that shape, and a script checks them. Everything else is the author's judgement, and
[guards.md](guards.md) is where that judgement is written down.

## The four rules

| Rule       | Says                                                                                        | Why           |
| ---------- | ------------------------------------------------------------------------------------------- | ------------- |
| `named`    | `SKILL.md` is named for its folder in lowercase-hyphen words, and its description says when | found, loaded |
| `small`    | the entry's body fits in 150 lines, and every other page in 300                             | (why: E-01)   |
| `resolves` | every link, path, heading anchor and cited story a page points at exists                    | (why: E-02)   |
| `tested`   | every script under `scripts/` is reached by a test                                          | watched only  |

They are four on purpose: each is one a recorded failure stands behind (why: E-09).

## Check

```sh
node ${CLAUDE_SKILL_DIR}/scripts/check.mjs [path ...] [--suite <script>] [--json]
```

- With no path it looks in `.claude/skills`, `.agents/skills`, `skills/` and `plugins/*/skills`
  under the current folder. A path can be a skills folder or one skill's folder.
- `--suite <script>` also requires every test to be named in that `package.json` script.
- It exits 0 when every skill holds, 1 on a finding, and 2 when there is nothing to check.

Show the findings as printed: every one has a file, a line and an arrow with its fix. Make each fix,
run the check again, and stop when it exits 0. **Never relax a rule to make a skill pass.** If a
rule is wrong, say so to the person instead.

A clean check says nothing about the guards.

## Map

- [create.md](create.md): read before creating or editing a skill.
- [guards.md](guards.md): read before writing what a skill must guard against, which no check sees.
- [evidence.md](evidence.md): read when asked what a rule or a guard was paid for.
