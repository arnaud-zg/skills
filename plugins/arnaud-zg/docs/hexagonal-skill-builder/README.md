# ⬡ hexagonal-skill-builder

[📚 Docs home](../../../../docs/README.md) › [arnaud-zg](../../README.md) › **⬡
hexagonal-skill-builder**

A linter and writing guide for [Agent Skills](https://code.claude.com/docs/en/skills), the
`SKILL.md` folders that Claude Code and other coding agents load. Write skills that do what they
say, and check them against four rules a script can hold. Every finding comes with its file, its
line and its fix.

A skill is a set of instructions a model follows to the letter, so how it is organised is how it
behaves. A link to a page that moved sends it nowhere, a long entry is paid for on every call, and a
script nobody tests was only ever watched.

## At a glance

- **What is it?** A linter for Agent Skills (`SKILL.md`), and a guide Claude follows to write one
- **What does it check?** Four rules: `named`, `small`, `resolves`, `tested`
- **Where does it run?** Claude Code, any agent the skills CLI supports, CI, and commit hooks
- **How do I install it?** `/plugin install arnaud-zg --marketplace arnaud-zg/skills`, or
  `npx skills add arnaud-zg/skills --skill hexagonal-skill-builder` for any agent
- **How do I call it?** Ask Claude to _check the skills_, or type
  `/arnaud-zg:hexagonal-skill-builder`
- **How do I run it in CI?** `node <skill folder>/scripts/check.mjs`, which exits `1` on a finding
- **What does it need?** Node. No dependencies, no network, and it never writes a file

## Which page do I need?

| If you want to…                        | Go to                            | It gives you                         |
| -------------------------------------- | -------------------------------- | ------------------------------------ |
| write a first skill and check it       | 🚀 [Tutorial](tutorial.md)       | a checked skill in ten minutes       |
| fail a build, require tests, read JSON | 🛠️ [How-to guides](how-to.md)    | one recipe per task                  |
| look up the command or a rule          | 📖 [Reference](reference.md)     | exit codes, what each rule looks for |
| understand why a skill's shape matters | 💡 [Explanation](explanation.md) | why four rules, and why "hexagonal"  |

## Use it

Ask Claude to _check the skills_, or to _create a skill_ for something, and the skill fires on its
own. To call it by name, use `/arnaud-zg:hexagonal-skill-builder check` (from the `arnaud-zg`
plugin) or `/hexagonal-skill-builder check` (from the skills CLI).

The check is a Node script, and runs without Claude too:

```sh
node <skill folder>/scripts/check.mjs [path ...] [--suite <script>] [--json]
```

On a project with one skill that holds and one that does not:

```text
Checking 2 skills against named, small, resolves, tested

.claude/skills
  ✓ release-notes
  ✗ tidy-imports
      .claude/skills/tidy-imports/SKILL.md:3  named
      the description never says when to use the skill
      → add a "Use when …" sentence with the words a person would type
      .claude/skills/tidy-imports/scripts/sort.mjs:1  tested
      scripts/sort.mjs is reached by no test
      → write a test that imports or runs it

✗ 2 findings in 1 of 2 skills.
```

It exits 0 when every skill holds, 1 on a finding, and 2 when there is nothing to check, so it can
gate a commit hook or a CI job as it is.

## The four rules

| Rule       | Says                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| `named`    | `SKILL.md` is named for its folder in lowercase-hyphen words, and says when to use it   |
| `small`    | the entry's body fits in 150 lines, and every other page in 300                         |
| `resolves` | every relative link, heading anchor, `${CLAUDE_SKILL_DIR}` path and cited story exists  |
| `tested`   | every script under `scripts/` is reached by a test; with `--suite`, every test is in it |

Each one is there because a skill once broke it and a model followed it anyway. The stories are in
[`evidence.md`](../../skills/hexagonal-skill-builder/evidence.md), and seven mistakes no script can
see are in [`guards.md`](../../skills/hexagonal-skill-builder/guards.md).

## Questions

### How do I lint or validate a `SKILL.md` file?

Ask Claude to _check the skills_, or run `node <skill folder>/scripts/check.mjs`. With no path, it
checks every skill in `.claude/skills`, `.agents/skills`, `skills/` and `plugins/*/skills`. Pass a
path to check one skill or one folder.

### How do I check Agent Skills in CI or a commit hook?

Copy the skill into the project with the skills CLI, then run the check in a job. It exits `0` when
every skill holds and `1` on a finding.
[Fail a build when a skill breaks](how-to.md#fail-a-build-when-a-skill-breaks) has a CI step and a
Lefthook hook to copy.

### How is it different from `claude plugin validate`?

`claude plugin validate` checks that a plugin's manifests are well-formed. This checks what is
inside each skill: its name and description, its length, that every link and path resolves, and that
every script is tested.

### Why "hexagonal"?

The entry, `SKILL.md`, is the one port a model reads, and every other page sits behind it by layer,
as in hexagonal architecture. [Why "hexagonal"](explanation.md#why-hexagonal) says more.

## 🔒 Know what you're installing

- **It reads, and never writes.** The check reads the files under your skills folders and
  `package.json` when you pass `--suite`. It changes nothing and opens no connection.
- **It needs Node only**, with nothing to download, and ships no hooks and no MCP server.
- **It pre-approves one command**: `node ${CLAUDE_SKILL_DIR}/scripts/check.mjs`, through the skill's
  `allowed-tools`, so the check runs without a permission prompt. Everything else asks.

Read [`SKILL.md`](../../skills/hexagonal-skill-builder/SKILL.md) and
[`scripts/`](../../skills/hexagonal-skill-builder/scripts/) before you install it, as you would any
dependency. Claude reads `SKILL.md`, not this page.
