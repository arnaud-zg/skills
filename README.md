# 🧰 skills

Arnaud Zheng's [Claude Code](https://claude.com/claude-code) plugin marketplace: a growing shelf of
Agent Skills, subagents, hooks and MCP servers that install with a version and uninstall cleanly,
instead of being copy-pasted into `~/.claude/`. Every skill here is linted, tested and versioned.

## Plugins

| Plugin                                     | What it does                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [arnaud-zg](./plugins/arnaud-zg/README.md) | `hexagonal-skill-builder`: write Agent Skills, and check them against four rules: named, small, resolves, tested. File, line and fix for each finding. |

Install one in Claude Code, or in any agent through the
[skills CLI](https://github.com/vercel-labs/skills):

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
npx skills add arnaud-zg/skills --skill hexagonal-skill-builder
```

Each plugin's README shows how to pin the version you reviewed, and how to give it to a whole team
from `.claude/settings.json`.

## ⚠️ Read before installing

A plugin's hooks run shell commands on your machine and its MCP servers talk to remote endpoints,
with no sandbox. Read `hooks/`, `.mcp.json` and `dependencies` before installing anything, here or
anywhere else.

## 📚 Documentation

The docs follow [Diataxis](https://diataxis.fr/): one page per reader need. These cover writing and
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
