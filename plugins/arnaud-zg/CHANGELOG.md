# @arnaud-zg/plugin-arnaud-zg

## 0.4.0

### Minor Changes

- cdc82ab: glance-first: a new skill that presents any piece of work so a reader gets the key
  information in under one minute: the answer, the key numbers, then at most four blocks that each
  open on a diagram. A Node script checks the brief before it is drawn as an artifact page, a pull
  request body, terminal text or a Markdown file. Ships its four Diataxis pages and an eval.

  doc-compass: every page now opens glance-first (the answer line, the key numbers, then a picture
  before the prose), written with the glance-first skill when it is installed.

## 0.3.0

### Minor Changes

- 679b4f5: doc-compass: a new skill that writes Diataxis documentation and keeps it true. It ships
  templates that form a whole `docs/` folder (index, tutorial, how-to, reference, explanation,
  decision records, gravestone), four verbs (create, place, maintain, audit), and
  `scripts/check-docs.mjs`, which checks a docs folder for pages no index reaches, broken links and
  anchors, missing breadcrumbs, decisions superseded one way only, stale "generated from" headers,
  long pages and banned strings.
- ab48cf4: radical-simplify: a new skill that rebuilds a process, product or UI into its simplest,
  fastest version, working strictly through Question, Remove, Simplify, Reimagine, Accelerate,
  Automate, and ending with a counted before and after. Instructions only, with its four Diataxis
  pages and an eval.

### Patch Changes

- d7366c5: doc-compass: `framed` accepts a link to the `README.md` of a folder above the page, so a
  docs set nested inside another (a plugin's docs holding one folder per skill) passes with its own
  section index in the breadcrumb.
- 4743bf5: hexagonal-skill-builder: the entry now routes to a new `create.md` for creating or
  editing a skill, and its map is a list, cutting `SKILL.md` from about 1,435 to 845 tokens. The
  plugin README and reference turn their wide tables into lists to fit the context budget.
- 52c12cd: The plugin README now presents all three skills, hexagonal-skill-builder, doc-compass and
  radical-simplify, with one install section and a docs table. hexagonal-skill-builder's own README
  and its four pages move to `docs/hexagonal-skill-builder/`, like the other two skills.

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
