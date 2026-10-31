# 🧰 skills: Claude Code plugin marketplace of Agent Skills, linted and versioned

Arnaud Zheng's [Claude Code](https://claude.com/claude-code) plugin marketplace: a growing shelf of
Agent Skills (`SKILL.md`) for Diataxis documentation, skill linting and reviews, subagents, hooks
and MCP servers that install with a version and uninstall cleanly, instead of being copy-pasted into
`~/.claude/`. Every skill here is linted, tested and versioned.

## Available skills

Eight Agent Skills ship in the `arnaud-zg` plugin. Pick one by what you want to do; what each needs
and how to call it are in the [plugin's skills table](./plugins/arnaud-zg/README.md#skills).

| When you want to…                                     | Use                                                                                     |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Write or lint an Agent Skill                          | [`hexagonal-skill-builder`](./plugins/arnaud-zg/docs/hexagonal-skill-builder/README.md) |
| Write, sort or check documentation                    | [`doc-compass`](./plugins/arnaud-zg/docs/doc-compass/README.md)                         |
| Plan, write or audit tests                            | [`testing-trophy`](./plugins/arnaud-zg/docs/testing-trophy/README.md)                   |
| Make a process, product or UI simpler                 | [`radical-simplify`](./plugins/arnaud-zg/docs/radical-simplify/README.md)               |
| Present work in under a minute (TLDR, PR description) | [`glance-first`](./plugins/arnaud-zg/docs/glance-first/README.md)                       |
| Challenge a doc, plan or pull request                 | [`glance-audit`](./plugins/arnaud-zg/docs/glance-audit/README.md)                       |
| Find what made a session's skills slow or costly      | [`skill-retro`](./plugins/arnaud-zg/docs/skill-retro/README.md)                         |
| Know if the next job fits the usage window            | [`usage-runway`](./plugins/arnaud-zg/docs/usage-runway/README.md)                       |

## Install

In Claude Code, or one skill at a time in any agent through the
[skills CLI](https://github.com/vercel-labs/skills):

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
npx skills add arnaud-zg/skills --skill <name>
```

Each plugin's README shows how to pin the version you reviewed, and how to give it to a whole team
from `.claude/settings.json`.

## ⚠️ Read before installing

A plugin's hooks run shell commands on your machine and its MCP servers talk to remote endpoints,
with no sandbox. Read `hooks/`, `.mcp.json` and `dependencies` before installing anything, here or
anywhere else.

## 📚 Documentation

Start at the **[documentation home](./docs/README.md)**: a map of every page. The docs follow
[Diataxis](https://diataxis.fr/): one page per reader need. The pages below cover writing and
shipping plugins in this repository; each plugin's own `docs/` covers using it.

- 🚀 **[Tutorial](./docs/tutorial.md)**: build and install your first plugin, end to end.
- 🛠️ **[How-to guides](./docs/how-to.md)**: add a skill, agent, hook, MCP server or dependency;
  document it; test locally; release; rename.
- 📖 **[Reference](./docs/reference.md)**: every manifest field, component discovery rule, and CLI
  command.
- 💡 **[Explanation](./docs/explanation.md)**: what skills, plugins and marketplaces are, and why
  the layers are split that way.

## 🔧 Tooling

Prettier, ESLint, TypeScript, remark, commitlint and Lefthook all come from
[`@arnaud-zg/configs`](https://github.com/arnaud-zg/configs). See
[CONTRIBUTING.md](./CONTRIBUTING.md) to make a change.

## License

MIT
