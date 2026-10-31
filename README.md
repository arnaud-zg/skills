# 🧰 skills: Claude Code plugins and Agent Skills, linted and versioned

Arnaud Zheng's [Claude Code](https://claude.com/claude-code) plugin marketplace: a growing shelf of
Agent Skills, subagents, hooks and MCP servers that install with a version and uninstall cleanly,
instead of being copy-pasted into `~/.claude/`. Every skill here is linted, tested and versioned.

## Available skills

| Skill                                                                                   | Plugin      | Purpose                                                                  | How it works                                                                                  | Docs                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`hexagonal-skill-builder`](./plugins/arnaud-zg/docs/hexagonal-skill-builder/README.md) | `arnaud-zg` | Lint and write Agent Skills (`SKILL.md`): named, small, resolves, tested | Ask Claude to _check the skills_; a Node script prints file, line and fix                     | [Tutorial](./plugins/arnaud-zg/docs/hexagonal-skill-builder/tutorial.md) · [How-to](./plugins/arnaud-zg/docs/hexagonal-skill-builder/how-to.md) · [Reference](./plugins/arnaud-zg/docs/hexagonal-skill-builder/reference.md) · [Explanation](./plugins/arnaud-zg/docs/hexagonal-skill-builder/explanation.md) |
| [`doc-compass`](./plugins/arnaud-zg/docs/doc-compass/README.md)                         | `arnaud-zg` | Write Diataxis docs from templates and keep them true                    | Ask Claude to _document this_ or _check the docs_; a Node script prints file, line and fix    | [Tutorial](./plugins/arnaud-zg/docs/doc-compass/tutorial.md) · [How-to](./plugins/arnaud-zg/docs/doc-compass/how-to.md) · [Reference](./plugins/arnaud-zg/docs/doc-compass/reference.md) · [Explanation](./plugins/arnaud-zg/docs/doc-compass/explanation.md)                                                 |
| [`radical-simplify`](./plugins/arnaud-zg/docs/radical-simplify/README.md)               | `arnaud-zg` | Rebuild a process, product or UI into its simplest, fastest version      | Type `/arnaud-zg:radical-simplify <target>`; six steps, Question to Automate, in strict order | [Tutorial](./plugins/arnaud-zg/docs/radical-simplify/tutorial.md) · [How-to](./plugins/arnaud-zg/docs/radical-simplify/how-to.md) · [Reference](./plugins/arnaud-zg/docs/radical-simplify/reference.md) · [Explanation](./plugins/arnaud-zg/docs/radical-simplify/explanation.md)                             |

The [skills catalogue](./docs/README.md#skills-catalogue) says what each skill is for and when it
fires; each skill's README says how it works.

Install one in Claude Code, or in any agent through the
[skills CLI](https://github.com/vercel-labs/skills):

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
npx skills add arnaud-zg/skills --skill hexagonal-skill-builder
npx skills add arnaud-zg/skills --skill doc-compass
npx skills add arnaud-zg/skills --skill radical-simplify
```

Each plugin's README shows how to pin the version you reviewed, and how to give it to a whole team
from `.claude/settings.json`.

## ⚠️ Read before installing

A plugin's hooks run shell commands on your machine and its MCP servers talk to remote endpoints,
with no sandbox. Read `hooks/`, `.mcp.json` and `dependencies` before installing anything, here or
anywhere else.

## 📚 Documentation

Start at the **[documentation home](./docs/README.md)**: the skills catalogue, and a map of every
page. The docs follow [Diataxis](https://diataxis.fr/): one page per reader need. The pages below
cover writing and shipping plugins in this repository; each plugin's own `docs/` covers using it.

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
