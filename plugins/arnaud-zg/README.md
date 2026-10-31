# arnaud-zg: Claude Code plugin with 8 Agent Skills for docs, tests, skills and reviews

`arnaud-zg` is a [Claude Code](https://claude.com/claude-code) plugin that bundles eight
[Agent Skills](https://code.claude.com/docs/en/skills) (`SKILL.md` folders): a skill linter, a
[Diataxis](https://diataxis.fr/) documentation writer and checker, a first-principles simplifier,
one-minute briefs, sceptical audits, testing-trophy tests, session retros and a usage-window check.
They also install in any agent the [skills CLI](https://github.com/vercel-labs/skills) supports.
Each skill has its own tutorial, how-to guides, reference and explanation. MIT.

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
npx skills add arnaud-zg/skills --skill <skill>
```

See [Install](#install) to pin a version or enable the plugin for a whole team.

## Skills

| Skill                                                                 | What it does                                                                                     | Call it                                                               | Needs                      |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------------------------- |
| [⬡ `hexagonal-skill-builder`](docs/hexagonal-skill-builder/README.md) | Writes Agent Skills (`SKILL.md`) and checks them: named, small, resolves, tested                 | _check the skills_, `/arnaud-zg:hexagonal-skill-builder`              | Node, read-only            |
| [🧭 `doc-compass`](docs/doc-compass/README.md)                        | Writes Diataxis docs from templates and checks them: orphan pages, broken links, stale decisions | _check the docs_, `/arnaud-zg:doc-compass audit docs`                 | Node, read-only            |
| [✂️ `radical-simplify`](docs/radical-simplify/README.md)              | Rebuilds a process, product or UI: Question, Remove, Simplify, Reimagine, Accelerate, Automate   | _make this radically simpler_, `/arnaud-zg:radical-simplify <target>` | Nothing, instructions only |
| [👁️ `glance-first`](docs/glance-first/README.md)                      | Presents any work in under a minute: the answer, the key numbers, then a diagram per block       | _give me a TLDR_, _write the PR description_                          | Node, reads one file       |
| [🔍 `glance-audit`](docs/glance-audit/README.md)                      | Challenges a doc, plan, PR or status report: one-line verdict, proof, comments ready to paste    | _audit this_, _poke holes_, `/arnaud-zg:glance-audit`                 | Node, never posts          |
| [🔁 `skill-retro`](docs/skill-retro/README.md)                        | Finds what made a session's skills slow, wrong or costly and books each fix as a draft PR        | _retro_, _improve the skills_, `/arnaud-zg:skill-retro`               | Node, `gh` for the stack   |
| [⏳ `usage-runway`](docs/usage-runway/README.md)                      | Says how much usage window is left and whether the next job fits: GO or PARK                     | _do we have enough credit_, `/arnaud-zg:usage-runway`                 | Node, read-only            |
| [🏆 `testing-trophy`](docs/testing-trophy/README.md)                  | Plans, writes and audits tests by the testing trophy: mostly integration, behaviour names        | _audit the tests_, `/arnaud-zg:testing-trophy`                        | Node, read-only            |

The checkers print every finding with its file, line and fix, and exit `1` on a finding, so they
gate CI and commit hooks as they are.

## 📚 Documentation

Each skill's guide above links its 🚀 tutorial, 🛠️ how-to guides, 📖 reference and 💡 explanation.

## Install

**Claude Code**, in one step (Claude Code 2.1.275 or later). This installs all eight skills:

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

or in two, pinned to the version you reviewed:

```sh
/plugin marketplace add arnaud-zg/skills#arnaud-zg--v0.2.1
/plugin install arnaud-zg@arnaud-zg-skills
```

**Any agent**, one skill at a time, with the [skills CLI](https://github.com/vercel-labs/skills):

```sh
npx skills add arnaud-zg/skills --skill hexagonal-skill-builder
npx skills add arnaud-zg/skills --skill doc-compass
npx skills add arnaud-zg/skills --skill radical-simplify
npx skills add arnaud-zg/skills --skill glance-first
npx skills add arnaud-zg/skills --skill glance-audit
npx skills add arnaud-zg/skills --skill skill-retro
npx skills add arnaud-zg/skills --skill usage-runway
npx skills add arnaud-zg/skills --skill testing-trophy
```

or pinned, through the release's tag:

```sh
npx skills add https://github.com/arnaud-zg/skills/tree/arnaud-zg--v0.2.1 --skill <skill>
```

**A whole team**, from the project's `.claude/settings.json`. Everyone who trusts the folder gets
the marketplace, and the plugin turns on at their next session:

```json
{
  "extraKnownMarketplaces": {
    "arnaud-zg-skills": {
      "source": {
        "source": "github",
        "repo": "arnaud-zg/skills",
        "ref": "arnaud-zg--v0.2.1"
      }
    }
  },
  "enabledPlugins": { "arnaud-zg@arnaud-zg-skills": true }
}
```

### Why are the skills called `/arnaud-zg:<skill>`?

Claude Code names a plugin's skills `<plugin>:<skill>`. The plugin is `arnaud-zg`, which holds every
skill from this marketplace. Installed with the skills CLI, a skill is just `/<skill>`.

## 🔒 Know what you're installing

- **No hooks, no MCP server, no network.** Nothing runs unless a skill is called.
- **Each script-backed skill pre-approves only its own scripts** through `allowed-tools`, listed per
  skill under [Skills](#skills). Everything else asks.
- **`radical-simplify` is instructions only.** It proposes a redesign and edits nothing.

Read each skill's `SKILL.md` under [`skills/`](skills/) before you install, as you would any
dependency. Claude reads `SKILL.md`, not this page.
