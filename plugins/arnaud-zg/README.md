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

Every skill is called by asking in plain words (the phrases below come from its `SKILL.md`
description) or by typing its slash command. The checkers print every finding with its file, line
and fix, and exit `1` on a finding, so they gate CI and commit hooks as they are.

### hexagonal-skill-builder

⬡ Writes Agent Skills and checks them against four rules a script can hold (named, small, resolves,
tested), printing the file, line and fix for anything that breaks one, plus seven guards for what no
script can see.

- **Use it when** creating a skill, editing a `SKILL.md`, or asking _"is this skill well built"_,
  _"check the skills"_ or _"lint my skills"_.
- **Call it** `/arnaud-zg:hexagonal-skill-builder [check|create] [<path or name>]`
- **Needs** Node. Read-only: pre-approves only `node ${CLAUDE_SKILL_DIR}/scripts/check.mjs`.
- **Docs** [hexagonal-skill-builder guide](docs/hexagonal-skill-builder/README.md)

### doc-compass

🧭 Writes Diataxis documentation: creates a docs set from templates (tutorial, how-to, reference,
explanation, decision records), sorts content into the right quadrant, keeps the docs true as the
code changes, and checks them for orphan pages, broken links and anchors, and decisions superseded
one way only.

- **Use it when** creating, reorganising or updating docs, after a change a user of the code will
  see, or asking _"where should this doc go"_, _"document this feature"_, _"our docs are stale"_ or
  _"check the docs"_.
- **Call it** `/arnaud-zg:doc-compass [create|place|maintain|audit] [<docs folder>]`
- **Needs** Node. Read-only: pre-approves only `node ${CLAUDE_SKILL_DIR}/scripts/check-docs.mjs`.
- **Docs** [doc-compass guide](docs/doc-compass/README.md)

### radical-simplify

✂️ Rebuilds a process, product or UI into the simplest, fastest, clearest version by working
strictly through Question, Remove, Simplify, Reimagine, Accelerate, Automate.

- **Use it when** asking to _"simplify"_, _"streamline"_, _"cut the steps"_, _"make it 10x
  simpler"_, _"rethink this flow from first principles"_ or _"radically optimize"_ a process,
  workflow, feature, screen or onboarding.
- **Call it** `/arnaud-zg:radical-simplify [process, product, screen or file to optimize]`
- **Needs** Nothing. Instructions only: it proposes a redesign and edits nothing.
- **Docs** [radical-simplify guide](docs/radical-simplify/README.md)

### glance-first

👁️ Presents any piece of work so a reader gets the key information in under one minute: the answer
in one line, the key numbers in a strip, then at most four blocks that each open on a picture (a
diagram, a chart, a table or a screenshot), checked by a script before it is shown.

- **Use it when** asking for a _"TLDR"_, to _"explain this change"_, to _"write the PR
  description"_, to _"make it quick to read"_, for a _"one-minute read"_, to _"summarise for a PM"_
  or to _"present this"_.
- **Call it** `/arnaud-zg:glance-first`
- **Needs** Node. Pre-approves only `node ${CLAUDE_SKILL_DIR}/scripts/check-brief.mjs`.
- **Docs** [glance-first guide](docs/glance-first/README.md)

### glance-audit

🔍 Reads a document, plan, pull request or status report like a careful sceptic, challenges its
claims, and hands back a one-line verdict, the critical finding with its proof, and comments
anchored on exact quotes, ready to paste. It never posts, comments or edits anything itself.

- **Use it when** asking to _"audit this"_, _"challenge this plan"_, _"poke holes"_, _"review this
  doc"_, _"what are we missing"_, _"play devil's advocate"_ or _"is this plan sound"_, or to check a
  report or status box against what it claims.
- **Call it** `/arnaud-zg:glance-audit`
- **Needs** Node. Pre-approves only `node ${CLAUDE_SKILL_DIR}/scripts/check-audit.mjs`.
- **Docs** [glance-audit guide](docs/glance-audit/README.md)

### skill-retro

🔁 Finds what made a session's skills slow, wrong or expensive in tokens, ranks it by cost, trims
each skill and books every fix as its own draft pull request in a skills stack beside the feature
stack.

- **Use it when** a session ends, or for _"retro"_, _"end of session"_, _"improve the skills"_,
  _"what slowed us down"_, _"make the skills cheaper"_, _"skill feedback"_ or _"too many tokens"_.
- **Call it** `/arnaud-zg:skill-retro [<skill> ...] [--bind <binding>]`
- **Needs** Node, and `gh` to book the draft pull requests. Pre-approves only its own
  `node ${CLAUDE_SKILL_DIR}/scripts/*.mjs`.
- **Docs** [skill-retro guide](docs/skill-retro/README.md)

### usage-runway

⏳ Says how much of the usage window is left, when it resets, and whether the next piece of work
fits before it does. Answers GO or PARK, from the clock and from any limit already hit.

- **Use it when** dispatching a long piece of work, when a run must park and resume after a reset,
  or asking _"do we have enough credit"_.
- **Call it** `/arnaud-zg:usage-runway`
- **Needs** Node. Read-only: pre-approves only `node ${CLAUDE_SKILL_DIR}/scripts/credit.mjs`.
- **Docs** [usage-runway guide](docs/usage-runway/README.md)

### testing-trophy

🏆 Plans, writes and audits tests by the testing trophy (Kent C. Dodds): static checks, a few unit
tests, mostly integration tests, a few end to end, each named by the behaviour it proves.

- **Use it when** asked to _"write the tests"_, _"test this package"_, _"use the testing trophy"_,
  _"audit the tests"_, or when a bug needs a failing test before its fix. Opt-in: a project says it
  uses it.
- **Call it** `/arnaud-zg:testing-trophy [plan|write|audit] [<folder>]`
- **Needs** Node. Read-only: pre-approves only `node ${CLAUDE_SKILL_DIR}/scripts/check-trophy.mjs`.
- **Docs** [testing-trophy guide](docs/testing-trophy/README.md)

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
