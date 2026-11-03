# 🛠️ How-to: install the arnaud-zg skills in each agent

[arnaud-zg](../../README.md) › **Install**

**Claude Code**, in one step (Claude Code 2.1.275 or later). This installs all eight skills:

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

or in two, pinned to the version you reviewed:

```sh
/plugin marketplace add arnaud-zg/skills#arnaud-zg--v0.6.1
/plugin install arnaud-zg@arnaud-zg-skills
```

**Codex, Copilot CLI and Cursor** read their own manifests beside the same skills:

| Agent       | Install                                                                                                                       |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Codex       | `codex plugin marketplace add arnaud-zg/skills`, then install `arnaud-zg` from `/plugins`. Pin with `--ref arnaud-zg--v0.6.1` |
| Copilot CLI | `copilot plugin marketplace add arnaud-zg/skills`, then `copilot plugin install arnaud-zg@arnaud-zg-skills`                   |
| Cursor      | add `arnaud-zg/skills` as a plugin marketplace in Cursor's settings                                                           |

**Any other agent** (Gemini CLI, OpenCode and more), one skill at a time, with the
[skills CLI](https://github.com/vercel-labs/skills):

```sh
npx skills add arnaud-zg/skills --skill <skill>
```

or pinned, through the release's tag:

```sh
npx skills add https://github.com/arnaud-zg/skills/tree/arnaud-zg--v0.6.1 --skill <skill>
```

**A whole Claude Code team**, from the project's `.claude/settings.json`. Everyone who trusts the
folder gets the marketplace, and the plugin turns on at their next session:

[`settings.json`](../../examples/install/settings.json) is the whole file. A test checks that it
names this marketplace and pins a release tag.

## Why are the skills called `/arnaud-zg:<skill>`?

Claude Code names a plugin's skills `<plugin>:<skill>`; other agents may call them by `<skill>`
alone. The plugin is `arnaud-zg`, which holds every skill from this marketplace. Installed with the
skills CLI, a skill is just `/<skill>`.
