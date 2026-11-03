# arnaud-zg/skills

Agent Skills marketplace for Claude Code, Codex, Cursor, GitHub Copilot CLI and any agent that reads
`SKILL.md`. This file is for Codex, Cursor and other agents working in the repository. The rules are
the ones in [CLAUDE.md](./CLAUDE.md), which Claude Code reads: follow both the same way.

## Layout

- Skills live once, in `plugins/<plugin>/skills/<skill>/SKILL.md`.
- Each plugin has one manifest per agent: `.claude-plugin/plugin.json` (Claude Code, Copilot CLI),
  `.codex-plugin/plugin.json` (Codex), `.cursor-plugin/plugin.json` (Cursor). Keep `name`,
  `version`, `description` and `keywords` the same in all three.
- Catalogues: `.claude-plugin/marketplace.json`, `.agents/plugins/marketplace.json` (Codex),
  `.cursor-plugin/marketplace.json` (Cursor).
- Field-by-field: [docs/manifests.md](./docs/manifests.md). Adding a plugin or skill:
  [docs/how-to.md](./docs/how-to.md).

## Releasing

See [docs/release.md](./docs/release.md). Never bump a version, commit or tag on `main` directly:
`pnpm release` (shiplane) opens the release PR and writes the version into every manifest. Commit
subjects become each release's changelog lines, so write them for users.

## Before committing

Run
`pnpm typecheck && pnpm lint && pnpm lint:md && pnpm lint:context && pnpm lint:docs && pnpm format:check && pnpm test`
and `claude plugin validate . --strict`. `pnpm test:e2e` installs every skill through the real
skills CLI and needs the network.
