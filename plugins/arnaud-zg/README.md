# arnaud-zg

Arnaud Zheng's Agent Skills for [Claude Code](https://claude.com/claude-code) and any agent the
[skills CLI](https://github.com/vercel-labs/skills) supports. One plugin, three skills, each with
its own four [Diataxis](https://diataxis.fr/) pages. MIT.

## Skills

| Skill                                                                 | What it does                                                                                     | Call it                                                               | Needs                      |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------------------------- |
| [⬡ `hexagonal-skill-builder`](docs/hexagonal-skill-builder/README.md) | Writes Agent Skills (`SKILL.md`) and checks them: named, small, resolves, tested                 | _check the skills_, `/arnaud-zg:hexagonal-skill-builder`              | Node, read-only            |
| [🧭 `doc-compass`](docs/doc-compass/README.md)                        | Writes Diataxis docs from templates and checks them: orphan pages, broken links, stale decisions | _check the docs_, `/arnaud-zg:doc-compass audit docs`                 | Node, read-only            |
| [✂️ `radical-simplify`](docs/radical-simplify/README.md)              | Rebuilds a process, product or UI: Question, Remove, Simplify, Reimagine, Accelerate, Automate   | _make this radically simpler_, `/arnaud-zg:radical-simplify <target>` | Nothing, instructions only |

The checkers print every finding with its file, line and fix, and exit `1` on a finding, so they
gate CI and commit hooks as they are.

## 📚 Documentation

| Skill                     | 🚀 Tutorial                                                        | 🛠️ How-to                                                 | 📖 Reference                                                   | 💡 Explanation                                                  |
| ------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| `hexagonal-skill-builder` | [A first skill, checked](docs/hexagonal-skill-builder/tutorial.md) | [CI, hooks, JSON](docs/hexagonal-skill-builder/how-to.md) | [Command and rules](docs/hexagonal-skill-builder/reference.md) | [Why four rules](docs/hexagonal-skill-builder/explanation.md)   |
| `doc-compass`             | [A checked docs set](docs/doc-compass/tutorial.md)                 | [CI, style, audits](docs/doc-compass/how-to.md)           | [Command and rules](docs/doc-compass/reference.md)             | [Why a compass](docs/doc-compass/explanation.md)                |
| `radical-simplify`        | [A refund flow, cut down](docs/radical-simplify/tutorial.md)       | [Screens, code, docs](docs/radical-simplify/how-to.md)    | [Steps and output](docs/radical-simplify/reference.md)         | [Why the order is strict](docs/radical-simplify/explanation.md) |

## Install

**Claude Code**, in one step (Claude Code 2.1.275 or later). This installs all three skills:

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
- **The two checkers read, and never write.** Each pre-approves one command through its
  `allowed-tools`: `node ${CLAUDE_SKILL_DIR}/scripts/check.mjs` and
  `node ${CLAUDE_SKILL_DIR}/scripts/check-docs.mjs`. Everything else asks.
- **`radical-simplify` is instructions only.** It proposes a redesign and edits nothing.

Read each skill's `SKILL.md` under [`skills/`](skills/) before you install, as you would any
dependency. Claude reads `SKILL.md`, not this page.
