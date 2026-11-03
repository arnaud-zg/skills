# 📖 Reference: release tags and how each agent pins one

[📚 Docs home](README.md) › Writing plugins › [📖 Reference](reference.md) › **Tags**

The `<name>--v<version>` format is Claude Code's: it matches dependency ranges such as
`ts-base@^1.2.0` against these tags. That is why a plugin name never contains `--`, and
`marketplace.unit.test.ts` fails if one does. One tag pins the whole repository at that commit,
including every plugin and every agent's manifest. The other agents read no tag name, they take any
git ref:

| Agent       | Pin a release                                                                   |
| ----------- | ------------------------------------------------------------------------------- |
| Claude Code | `/plugin marketplace add arnaud-zg/skills#arnaud-zg--v0.7.0`                    |
| Codex       | `codex plugin marketplace add arnaud-zg/skills --ref arnaud-zg--v0.7.0`         |
| Copilot CLI | `copilot plugin marketplace add arnaud-zg/skills#arnaud-zg--v0.7.0`             |
| Cursor      | no pinning in its marketplace; `/add-plugin` from the git repository with a ref |
| skills CLI  | `npx skills add https://github.com/arnaud-zg/skills/tree/arnaud-zg--v0.7.0`     |

A native Gemini CLI extension would be different: Gemini finds updates through the repository's
GitHub release marked Latest, which in a repository of several plugins is whichever released last.
That is why Gemini installs these skills through the skills CLI, not a `gemini-extension.json`.

`v0.3.1`, `skill-builder--v0.1.0` and `hexagonal-skill-builder--v0.1.0` are older tags in another
format. They stay, so nobody pinned to them breaks.

It needs `gh auth login` and the `claude` CLI on your `PATH`. Nothing goes to npm.
