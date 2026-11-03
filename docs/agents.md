# 💡 Explanation: one plugin, many agents

[📚 Docs home](README.md) › Writing plugins › [💡 Explanation](explanation.md) › **Agents**

Claude Code, Codex, Cursor and Copilot CLI all read the same `SKILL.md` format, but each looks for
its own manifest. So the skills live once, under `plugins/<name>/skills/`, and each agent gets a
small manifest beside them: `.claude-plugin/` (also read by Copilot CLI), `.codex-plugin/` and
`.cursor-plugin/`. Copying the skills into one folder per agent would make three copies drift apart.
Three manifests can drift too, but they are small, a test compares them, and the release writes the
version into all of them.

Agents without a plugin system, such as Gemini CLI and OpenCode, install through the skills CLI. It
reads the Claude catalogue and copies each skill folder where that agent looks. A native Gemini
extension was left out on purpose: Gemini finds updates by the repository's latest GitHub release,
which in a repository of several independently released plugins points at whichever shipped last.

The rules are tested, not trusted: `manifests.unit.test.ts` compares the manifests,
`agents.integration.test.ts` follows each catalogue to the skills, and `pnpm test:e2e` installs them
through the real skills CLI. The fields are in [manifests.md](manifests.md#other-agents) and the tag
format in [tags.md](tags.md).
