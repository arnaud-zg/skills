# arnaud-zg/skills

Claude Code plugin marketplace (`.claude-plugin/marketplace.json`, plugins under `plugins/`). Not
published to npm. Tooling comes from `@arnaud-zg/configs`. Full docs: [README.md](./README.md) and
[docs/](./docs/) (Diataxis: tutorial, how-to, reference, explanation).

## Plugins and skills

To add or change a plugin or skill, follow [docs/how-to.md](./docs/how-to.md). Draft in
`~/.claude/skills/<name>/`, evaluate, then move it into `plugins/`. Document each plugin in its own
`docs/` with the four Diataxis pages ([how](./docs/test-and-document.md#document-a-plugin)).

## Subagents and handoffs

Load the `agent-context-budget` skill before launching any subagent, workflow or background lane,
and whenever a handoff or result would be more than a short summary. Every brief carries a return
cap, long output goes to a file returned by path, and mechanical lanes use a cheaper model tier.

## Releasing

See [docs/release.md](./docs/release.md). `main` is protected by a Lefthook hook, so the version
bump goes through the PR that `pnpm release:version` opens, then `pnpm release` tags. Don't bump,
commit or tag directly on `main`.

## Before committing

Run
`pnpm typecheck && pnpm lint && pnpm lint:md && pnpm lint:context && pnpm lint:docs && pnpm format:check && pnpm test`
and `claude plugin validate . --strict`. All must pass.
