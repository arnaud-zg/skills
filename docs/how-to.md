# How-to

Task-oriented recipes. For the guided first run, use [tutorial.md](./tutorial.md).

## Add a plugin

```sh
cp -R templates/plugin-template plugins/<name>
```

1. Set `name` in `plugins/<name>/.claude-plugin/plugin.json` to match the directory.
2. Set `name` in `plugins/<name>/package.json` to `@arnaud-zg/plugin-<name>`. That file is private
   and never published — it exists so changesets can version the plugin. See
   [why](#why-plugins-carry-a-packagejson).
3. Delete the component directories the plugin does not use.
4. Delete the two `metadata: internal: true` lines from each copied `SKILL.md`. They keep the
   template out of `npx skills add` listings, and would hide your skill the same way.
5. Add an entry to `.claude-plugin/marketplace.json` with `"source": "<name>"` and no `version` —
   `plugin.json` carries it.
6. `pnpm changeset`: pick `@arnaud-zg/plugin-<name>`, `minor`, and say what the plugin does. The
   plugin stays at `0.0.0` until the next release PR gives it `0.1.0` and its first changelog entry.
7. `claude plugin validate . --strict`
8. `pnpm test` — `marketplace.unit.test.ts` fails if the package name, the manifest name and the
   directory disagree, if the versions drift apart, if the catalogue entry carries a version, if the
   plugin is missing from the catalogue, or if it has no changelog and no pending changeset. Those
   are the steps that are easy to skip when copying the template.

## Add a skill to an existing plugin

```sh
mkdir -p plugins/<plugin>/skills/<skill>
```

Write `SKILL.md` with `name` and `description` frontmatter. Nothing to register — `skills/` is
scanned by name.

Make it a slash command instead of a model-invoked skill by adding `argument-hint` and
`allowed-tools`:

```markdown
---
name: audit-deps
description: Audit dependencies for known advisories and unpinned ranges.
argument-hint: "[package-name]"
allowed-tools: [Read, Glob, Grep, Bash]
---
```

It becomes `/<plugin>:audit-deps`.

Keep `SKILL.md` short. Put long material in sibling files and reference them from the body:

```
skills/audit-deps/
├── SKILL.md              # loaded whenever the skill fires
├── advisory-format.md    # loaded only if SKILL.md tells Claude to read it
└── scripts/scan.sh
```

## Add a subagent

`plugins/<plugin>/agents/<name>.md`, frontmatter `name`, `description`, `tools`. The `description`
tells Claude when to delegate. Auto-discovered.

## Add hooks

`plugins/<plugin>/hooks/hooks.json`, same shape as the `hooks` block in `settings.json`. Reference
handler scripts through `${CLAUDE_PLUGIN_ROOT}`, which expands to the installed plugin directory:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks-handlers/guard.sh\"" }
        ]
      }
    ]
  }
}
```

Keep the escaped quotes: the expanded path can contain spaces, and `claude plugin validate --strict`
fails on an unquoted `${CLAUDE_PLUGIN_ROOT}`.

Hooks run on the installing machine, on every matching tool call. Keep them fast and make them exit
non-zero only when you genuinely want to block.

## Add an MCP server

`plugins/<plugin>/.mcp.json`, keyed under `mcpServers`. Auto-discovered.

```json
{
  "mcpServers": {
    "my-api": { "type": "http", "url": "https://api.example.com/mcp" }
  }
}
```

## Make a plugin depend on a base

In the dependent plugin's `plugin.json`:

```jsonc
{
  "name": "react-tools",
  "dependencies": ["ts-base"],
}
```

A bare name resolves inside this marketplace. Installing `react-tools` auto-installs `ts-base` and
enables it. To depend on a plugin from another marketplace, use `name@marketplace` **and** allow
that marketplace at the root:

```jsonc
// .claude-plugin/marketplace.json
{
  "allowCrossMarketplaceDependenciesOn": ["claude-plugins-official"],
}
```

To constrain the version, append a range: `"ts-base@^1.2.0"`. It resolves against the dependency's
git tags, so the dependency must be tagged (see below).

Changesets does not see these ranges — they live in `plugin.json`, not `package.json` — so a major
bump of `ts-base` neither updates nor warns the plugins that depend on `^1.x`. Update their ranges
by hand in the same release.

## Test locally before pushing

```sh
claude plugin validate . --strict            # marketplace + every listed plugin
claude plugin marketplace add ./             # from the repo root
claude plugin install <plugin>@arnaud-zg
claude plugin details <plugin>               # inventory + projected token cost
```

Iterating on an installed plugin: `/reload-plugins` picks up changes without restarting the session.

Undo:

```sh
claude plugin uninstall <plugin>
claude plugin marketplace remove arnaud-zg
```

## Draft a skill without packaging it

```sh
claude plugin init <name> --with skills agents hooks mcp
```

This scaffolds `~/.claude/skills/<name>/`, which auto-loads next session as `<name>@skills-dir` — no
marketplace, no install, no version. Iterate there, then move the directory into `plugins/` when it
is worth publishing.

## Evaluate a skill

```sh
claude plugin eval init --bare <case>   # blank case under the plugin's evals/
claude plugin eval <name>               # scored run
claude plugin details <name>            # inventory + projected token cost
```

A case is a directory under `evals/` inside the plugin. `prompt.md` is the prompt to send, with
`max_turns` and `allowed_tools` in its frontmatter. Each `graders/*.md` is one grading criterion,
with `type: llm` and a `weight` in its frontmatter. Start from the two or three prompts that should
trigger the skill.

By default every case also runs without the plugin, and the report shows the score difference, so
you can tell whether the skill changes anything. Results land in `evals/results/<timestamp>/`; don't
commit them.

Evals run on your machine, as you. Only evaluate plugins you trust.

## Document a plugin

Every plugin carries a `README.md` and a `docs/` folder with four pages, one per
[Diataxis](https://diataxis.fr/) type. Copy the shape of `plugins/arnaud-zg/`:

```
plugins/<name>/
├── README.md            # what it is, install, a short FAQ, links to the four pages
└── docs/
    ├── tutorial.md      # learning: one guided first run that always works
    ├── how-to.md        # a task: goal-titled recipes for someone who knows the basics
    ├── reference.md     # looking up: every command, flag, field and exit code, nothing else
    └── explanation.md   # understanding: why it is shaped this way, trade-offs, history
```

1. Write the tutorial first, and run every command in it. It has one path, no choices and no theory;
   a reader who follows it ends with something that works.
2. Title each how-to with the task it solves ("Fail a build when a skill breaks"), not a topic
   ("CI"). Start from the goal, skip what the tutorial taught, link to reference for details.
3. Organise the reference like the thing it describes: by command, by field, by rule. Keep it dry,
   complete and free of advice.
4. Put every "why" in the explanation, and nowhere else. When a how-to needs a reason, link to it.
5. Open each page with one line that says what kind of page it is and who it is for, and link to the
   sibling page a reader probably wanted instead.
6. Keep `README.md` and `docs/` outside the skill folder: the agent loads the skill, people read the
   docs, and neither should pay for the other's text.
7. `pnpm lint:md` checks the Markdown and every relative link.

## Release a version

Three commands release every plugin. Changesets is the entry point, and you never edit a version, a
changelog or a tag by hand.

```sh
pnpm changeset          # 1. in the PR that makes the change
pnpm release:version    # 2. opens the release PR; review and merge it
pnpm release            # 3. after the merge: tags and creates the GitHub releases
```

Each plugin has its own version, changelog (`plugins/<name>/CHANGELOG.md`) and `<name>--v<version>`
tag, and a changeset bumps only the plugins it names.

### 1. Describe the change

Any pull request that should show up in a release carries a changeset:

```sh
pnpm changeset
```

It asks which plugins changed and how much to bump them, then writes a Markdown file into
`.changeset/`. Commit that file with your work. Plugins appear in the list as
`@arnaud-zg/plugin-<name>`, because each one has a private `package.json` beside its `plugin.json` —
see [why](#why-plugins-carry-a-packagejson). To skip the prompts:

```sh
pnpm changeset add --minor @arnaud-zg/plugin-hello-tools -m "Add the audit-deps skill"
```

For a change that needs no release at all, `pnpm changeset add --empty` records that decision
explicitly.

A new plugin starts at `0.0.0` and gets its first version from a changeset too, so it has a
changelog from day one and its first GitHub release has real notes. Add the changeset in the PR that
adds the plugin (`minor` for `0.1.0`). `pnpm release` never tags a `0.0.0`, and
`marketplace.unit.test.ts` fails on a plugin with no changelog and no pending changeset.

### 2. Open the release PR

```sh
pnpm release:version
```

Run it with a clean working tree. It switches to an up-to-date `main` and, if any changesets are
pending, does the rest:

| Step                                | What it does                                                               |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `git switch -c release/<timestamp>` | `main` is protected, so versions only reach it through a PR                |
| `changeset version`                 | consumes `.changeset/*.md`, bumps each plugin's `package.json`, changelogs |
| `node scripts/sync-versions.mjs`    | copies each plugin's new version into its `plugin.json`                    |
| `pnpm install --lockfile-only`      | refreshes the lockfile for the bumped workspace versions                   |
| commit, push, `gh pr create`        | opens the PR, listing every bump                                           |

With no pending changesets it says so and stops. Review the PR, then merge it.

Leave `version` out of the plugin's marketplace entry. Claude Code reads `plugin.json` first, so a
version there is ignored at install time, can only go stale, and makes `claude plugin tag` refuse to
tag once it does. `marketplace.unit.test.ts` fails if one appears.

### 3. Release, after the PR merges

```sh
pnpm release
```

It switches to an up-to-date `main` and finds every plugin version that has no GitHub release yet.
For each one it tags `<name>--v<version>` with `claude plugin tag`, which validates the plugin
first, pushes the tag, and creates the GitHub release with the plugin's changelog section as its
notes. Every step is safe to repeat: fix whatever stopped it and run `pnpm release` again.

It needs `gh auth login` and the `claude` CLI on your `PATH`. Nothing goes to npm.

### What a plugin release actually ships

Nothing is uploaded anywhere — the marketplace _is_ this git repository — but merging a plugin
change to `main` does not ship it. Claude Code decides whether an installed plugin has an update by
comparing versions, and it reads the version from `plugin.json` first. Until that string changes,
`claude plugin update` reports the plugin as already at the latest version, however many commits
land.

The release PR from step 2 is what ships a plugin: merging it changes the version in `plugin.json`.
Users then get the new code with `claude plugin update <name>`, or on their next auto-update if they
turned it on for this marketplace — it is off by default for marketplaces not run by Anthropic.
Updates apply on restart or `/reload-plugins`.

Two consequences:

- A plugin change merged to `main` waits for the next release PR, so several can ship together.
- Someone who installs the plugin in that window gets the new code under the old version number.
  Keep the window short.

Catalogue edits in `marketplace.json` — descriptions, categories — carry no version and reach users
on their next `claude plugin marketplace update`.

The tag from step 3 does a narrower job: it makes the plugin resolvable by a dependency range like
`ts-base@^1.2.0`, and gives a `git-subdir` entry something to pin.

### Why plugins carry a package.json

A plugin's real manifest is `.claude-plugin/plugin.json`. The `package.json` beside it is private,
never published, and exists only so changesets can see the plugin as a workspace package and version
it; `scripts/sync-versions.mjs` copies the result across. Keeping two files in step is the price of
one release flow — the alternative was versioning every plugin by hand.

## Rename a plugin

Renaming breaks every existing install, so record it in the marketplace's append-only `renames` map:

```jsonc
{
  "renames": { "old-name": "new-name" },
}
```

The loader follows this when a plugin is not found and migrates user settings to the new name. Map
to `null` instead of a name when a plugin is removed for good.

## Remove a plugin

Delete the directory and its marketplace entry, and add `"<name>": null` to `renames`. If you want
existing installs cleaned up rather than left orphaned, set `forceRemoveDeletedPlugins: true` at the
marketplace root — removed plugins are then uninstalled automatically and flagged for users.

## Review a plugin before installing one you did not write

Plugins execute code on your machine through hooks and MCP servers, and there is no sandbox. Before
installing:

- Read `hooks/hooks.json` and every script it points at.
- Read `.mcp.json` — check where a remote server sends data, and what a local one runs.
- Check `dependencies` for plugins from marketplaces you have not vetted.
- Pin: install from a tag, and read the diff before `claude plugin update`.
