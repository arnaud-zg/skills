---
"@arnaud-zg/plugin-arnaud-zg": patch
---

The marketplace is now named `arnaud-zg-skills`, so the plugin installs as
`arnaud-zg@arnaud-zg-skills` instead of `arnaud-zg@arnaud-zg`. Slash commands are unchanged:
`/arnaud-zg:hexagonal-skill-builder`.

To switch, in Claude Code:

```sh
/plugin uninstall arnaud-zg@arnaud-zg
/plugin marketplace remove arnaud-zg
/plugin marketplace add arnaud-zg/skills
/plugin install arnaud-zg@arnaud-zg-skills
```

In a team's `.claude/settings.json`, rename the `extraKnownMarketplaces` key from `arnaud-zg` to
`arnaud-zg-skills`, and `"arnaud-zg@arnaud-zg"` to `"arnaud-zg@arnaud-zg-skills"` under
`enabledPlugins`.
