# @arnaud-zg/plugin-arnaud-zg

## 0.2.1

### Patch Changes

- bee28d3: The marketplace is now named `arnaud-zg-skills`, so the plugin installs as
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

## 0.2.0

### Minor Changes

- ad109f9: The plugin is now `arnaud-zg`, so its skill reads `/arnaud-zg:hexagonal-skill-builder`
  instead of `/hexagonal-skill-builder:hexagonal-skill-builder`, and later skills from this
  marketplace join it under the same name. The skill itself is unchanged, and so is
  `npx skills add`.

  If you installed 0.1.0 in Claude Code, swap the plugin:

  ```sh
  /plugin uninstall hexagonal-skill-builder@arnaud-zg
  /plugin install arnaud-zg@arnaud-zg
  ```

  and in a team's `.claude/settings.json`, replace `"hexagonal-skill-builder@arnaud-zg"` with
  `"arnaud-zg@arnaud-zg"` under `enabledPlugins`.

### Patch Changes

- ad109f9: The plugin has an icon, and its tests no longer pass the whole environment to the check
  they run.
- 2fc882d: The plugin now lives in [arnaud-zg/skills](https://github.com/arnaud-zg/skills). Install
  it from there:

  ```sh
  /plugin install arnaud-zg --marketplace arnaud-zg/skills
  npx skills add arnaud-zg/skills --skill hexagonal-skill-builder
  ```

  If you added the marketplace from `arnaud-zg/configs`, it keeps working for one more release, then
  stops: run `/plugin marketplace remove arnaud-zg` and `/plugin marketplace add arnaud-zg/skills`.

## 0.1.0

### Minor Changes

- 28abaa8: First release. Write Agent Skills, and check them against four rules a script can hold:
  named, small, resolves, tested. Every finding comes with its file, its line and its fix, and seven
  guards cover what no script can see.
