# 📖 Reference: Claude Code plugin manifests, layout and CLI

[📚 Docs home](README.md) › Writing plugins › [🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) ·
**📖 Reference** · [💡 Explanation](explanation.md)

Field-by-field. Verified against Claude Code `2.1.263` manifest schemas and `claude plugin --help`;
re-check after a major CLI upgrade.

## Repository layout

```
skills/
├── .claude-plugin/
│   └── marketplace.json          # the catalogue — this file makes the repo a marketplace
├── plugins/                      # plugins hosted here (metadata.pluginRoot)
│   └── <plugin>/
│       ├── .claude-plugin/
│       │   └── plugin.json       # the manifest — this file makes the directory a plugin
│       ├── skills/<skill>/SKILL.md
│       ├── agents/<agent>.md
│       ├── commands/<command>.md
│       ├── hooks/hooks.json
│       └── .mcp.json
├── templates/plugin-template/    # not listed in the catalogue; copy to start
├── docs/                         # this documentation
├── scripts/                      # pnpm release:version and pnpm release
└── …                             # tooling, all from @arnaud-zg/configs
```

The repository is the marketplace and nothing else: it is consumed with `git clone`, never from npm.
Its tooling (Prettier, ESLint, TypeScript, remark, commitlint, Lefthook) comes from the
[`@arnaud-zg/configs`](https://github.com/arnaud-zg/configs) package.

## Manifests

Field-by-field tables for `marketplace.json` and `plugin.json` live in [manifests.md](manifests.md).

## Component discovery

You normally write none of these keys: the directories are found by name. The manifest keys exist
only to point somewhere non-standard, and **their override semantics differ**:

- Skills: at `skills/<name>/SKILL.md`; key `skills`; when the key is set loaded **in addition** to
  `skills/`
- Subagents: at `agents/*.md`; key `agents`; when the key is set `agents/` is **no longer**
  auto-loaded
- Commands: at `commands/*.md` (legacy); key `commands`; when the key is set `commands/` is **no
  longer** auto-loaded
- Hooks: at `hooks/hooks.json`; key `hooks`; if set, loaded **in addition** to `hooks/hooks.json`
- MCP servers: at `.mcp.json`; key `mcpServers`; when the key is set loaded **in addition** to
  `.mcp.json`
- Output styles: at `output-styles/`; key `outputStyles`; when the key is set `output-styles/` is
  **no longer** auto-loaded
- LSP servers: manifest key `lspServers`; if set, declaration only

`skills` accepts `"."` or `"./"` to mean the plugin root itself, which is how a plugin can be a
single skill with `SKILL.md` at its top level.

`${CLAUDE_PLUGIN_ROOT}` expands to the installed plugin directory. Use it in every hook command and
script path, never a relative or hard-coded path, and quote it, since the expanded path can contain
spaces: `"command": "\"${CLAUDE_PLUGIN_ROOT}/hooks-handlers/x.sh\""`.
`claude plugin validate --strict` fails on an unquoted one.

## `SKILL.md` frontmatter

```markdown
---
name: skill-name
description: When Claude should use this, in the words a user would type.
---
```

- `name`: Required. Becomes `/<plugin>:<name>` for user-invoked skills.
- `description`: Required. The trigger. Always resident in context; the body is not.
- `argument-hint`: Makes it a slash command; shown in `/help`, e.g. `<file> [--fix]`
- `allowed-tools`: Restricts tools while the skill runs, e.g. `[Read, Glob, Grep]`
- `version`: Optional

Model-invoked and user-invoked are the same file format. Adding `argument-hint` / `allowed-tools` is
what surfaces it as a slash command.

## CLI

- `claude plugin marketplace add <source>`: Add a marketplace: `owner/repo`, a URL, or a local path
- `claude plugin marketplace list`: List configured marketplaces
- `claude plugin marketplace update [name]`: Pull latest; all marketplaces if no name
- `claude plugin marketplace remove <name>`: Remove a marketplace
- `claude plugin install <plugin>[@market]`: Install
- `claude plugin list`: List installed plugins
- `claude plugin details <name>`: Component inventory and projected token cost
- `claude plugin enable` / `disable`: Toggle without uninstalling
- `claude plugin update <name>`: Update (applies on restart)
- `claude plugin uninstall <name>`: Remove
- `claude plugin prune`: Remove auto-installed dependencies nothing needs
- `claude plugin validate <path> [--strict]`: Validate a plugin or marketplace; `--strict` fails on
  warnings. Use it in CI
- `claude plugin init <name> [--with …]`: Scaffold into `~/.claude/skills/<name>/`; components:
  `skills agents hooks mcp lsp output-style channel`
- `claude plugin tag [path]`: Create `<name>--v<version>` git tag, checking manifests agree
- `claude plugin eval [target]`: Run eval cases against a plugin

In-session equivalents: `/plugin` for the browser, `/reload-plugins` to pick up local edits without
restarting.

## On disk

- `~/.claude/plugins/known_marketplaces.json`: Registered marketplaces and their cache paths
- `~/.claude/plugins/marketplaces/<name>/`: Cloned marketplace repository
- `~/.claude/skills/<name>/`: Unpackaged local plugins, loaded as `<name>@skills-dir`

Installed plugin directories are recorded per-install; `claude plugin list` and
`claude plugin details <name>` report the resolved paths.
