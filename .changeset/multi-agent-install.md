---
"@arnaud-zg/plugin-arnaud-zg": minor
---

Install in Codex, Cursor and GitHub Copilot CLI, not only Claude Code. The plugin ships a
`.codex-plugin/` and a `.cursor-plugin/` manifest beside the Claude one, at the same version, and
every skill that runs a script says what `${CLAUDE_SKILL_DIR}` means in an agent that does not set
it. The example skill no longer leaks into `npx skills add` listings.
