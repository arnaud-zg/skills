# arnaud-zg: Agent Skills for docs, tests, skills and reviews, in any coding agent

`arnaud-zg` is a plugin for [Claude Code](https://claude.com/claude-code),
[Codex](https://developers.openai.com/codex), [Cursor](https://cursor.com) and GitHub Copilot CLI
that bundles [Agent Skills](https://code.claude.com/docs/en/skills) (`SKILL.md` folders): a skill
linter, a [Diataxis](https://diataxis.fr/) documentation writer and checker, a first-principles
simplifier, a Big O optimizer, one-minute briefs, sceptical audits, testing-trophy tests, session
retros, a usage-window check and hexagonal architecture. They also install in any other agent the
[skills CLI](https://github.com/vercel-labs/skills) supports, such as Gemini CLI and OpenCode. Each
skill has its own tutorial, how-to guides, reference and explanation. MIT.

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
npx skills add arnaud-zg/skills --skill <skill>
```

See [Install](#install) to pin a version or enable the plugin for a whole team.

## Skills

| Skill                                                                  | What it does                                                                               | Call it                                                               | Needs                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------------------------- |
| [🧩 `hexagonal-skill-builder`](docs/hexagonal-skill-builder/README.md) | Writes and lints skills: named, small, resolves, tested; layout by hexagonal-architecture  | _check the skills_, `/arnaud-zg:hexagonal-skill-builder`              | Node, read-only            |
| [⬡ `hexagonal-architecture`](docs/hexagonal-architecture/README.md)    | Keeps the core free of its tools by ports and adapters; flags outward imports              | _use hexagonal architecture_, `/arnaud-zg:hexagonal-architecture`     | Node, read-only            |
| [🧭 `doc-compass`](docs/doc-compass/README.md)                         | Writes Diataxis docs; checks orphans, broken links, stale decisions, untested examples     | _check the docs_, `/arnaud-zg:doc-compass audit docs`                 | Node, read-only            |
| [✂️ `radical-simplify`](docs/radical-simplify/README.md)               | Rebuilds a process, product or UI in six steps, from Question to Automate                  | _make this radically simpler_, `/arnaud-zg:radical-simplify <target>` | Nothing, instructions only |
| [⚡ `big-o-optimizer`](docs/big-o-optimizer/README.md)                 | Lowers the Big O of slow code, proven by your tests                                        | _make this O(n)_                                                      | Nothing, instructions only |
| [👁️ `glance-first`](docs/glance-first/README.md)                       | Any work in a minute: the answer, key numbers, a diagram per block                         | _give me a TLDR_, _write the PR description_                          | Node, reads one file       |
| [🔍 `glance-audit`](docs/glance-audit/README.md)                       | Challenges a doc, plan or PR: a verdict, the critical finding, comments to paste           | _audit this_, _poke holes_, `/arnaud-zg:glance-audit`                 | Node, never posts          |
| [🔁 `skill-retro`](docs/skill-retro/README.md)                         | Finds what made a session's skills slow, wrong or costly, and books each fix as a draft PR | _retro_, _improve the skills_, `/arnaud-zg:skill-retro`               | Node, `gh` for the stack   |
| [⏳ `usage-runway`](docs/usage-runway/README.md)                       | Whether the next job fits the usage window left: GO or PARK                                | _do we have enough credit_, `/arnaud-zg:usage-runway`                 | Node, read-only            |
| [🏆 `testing-trophy`](docs/testing-trophy/README.md)                   | Plans, writes and audits tests by the testing trophy; flags what bends it                  | _audit the tests_, `/arnaud-zg:testing-trophy`                        | Node, read-only            |

The checkers print every finding with its file, line and fix, and exit `1` on a finding, so they
gate CI and commit hooks as they are.

## Install

| Agent                        | Install                                                                                   |
| ---------------------------- | ----------------------------------------------------------------------------------------- |
| Claude Code                  | `/plugin install arnaud-zg --marketplace arnaud-zg/skills`                                |
| Codex                        | `codex plugin marketplace add arnaud-zg/skills`, then install `arnaud-zg` from `/plugins` |
| Copilot CLI                  | `copilot plugin marketplace add arnaud-zg/skills`                                         |
| Cursor                       | add `arnaud-zg/skills` as a plugin marketplace in Cursor's settings                       |
| Gemini CLI, OpenCode, others | `npx skills add arnaud-zg/skills --skill <skill>`                                         |

[Install](docs/install/how-to.md) pins a version, sets up a whole team, and covers each agent.

## 🔒 Know what you're installing

- **No hooks, no MCP server, no network.** Nothing runs unless a skill is called.
- **Each script-backed skill pre-approves only its own scripts** through `allowed-tools`. Everything
  else asks.
- **`radical-simplify` is instructions only.** It proposes a redesign and edits nothing.

Read each skill's `SKILL.md` under `skills/` before you install, as you would any dependency. The
agent reads `SKILL.md`, not this page.

### In an agent other than Claude Code

`${CLAUDE_SKILL_DIR}` means the skill's own folder; each `SKILL.md` that uses it says so.
`usage-runway` reads Claude Code's transcripts only, so elsewhere it has nothing to measure yet.
