# 🚢 How to release a Claude Code plugin version

[📚 Docs home](README.md) › Writing plugins › [🛠️ How-to](how-to.md) › **Release**

Two commands release every plugin. Changesets is the entry point, and you never edit a version, a
changelog or a tag by hand.

```sh
pnpm changeset    # 1. in the PR that makes the change
pnpm release      # 2. opens the release PR, waits for its merge, then tags and creates the GitHub releases
```

`pnpm release` runs [shiplane](https://github.com/arnaud-zg/packages/tree/main/packages/shiplane),
configured in `shiplane.config.ts`. Each plugin has its own version, changelog
(`plugins/<name>/CHANGELOG.md`) and `<name>--v<version>` tag, and a changeset bumps only the plugins
it names.

## 1. Describe the change

Any pull request that should show up in a release carries a changeset:

```sh
pnpm changeset
```

It asks which plugins changed and how much to bump them, then writes a Markdown file into
`.changeset/`. Commit that file with your work. Plugins appear in the list as
`@arnaud-zg/plugin-<name>`, because each one has a private `package.json` beside its `plugin.json`
(see [why](#why-plugins-carry-a-packagejson)). To skip the prompts:

```sh
pnpm changeset add --minor @arnaud-zg/plugin-hello-tools -m "Add the audit-deps skill"
```

For a change that needs no release at all, `pnpm changeset add --empty` records that decision
explicitly.

A new plugin starts at `0.0.0` and gets its first version from a changeset too, so it has a
changelog from day one and its first GitHub release has real notes. Add the changeset in the PR that
adds the plugin (`minor` for `0.1.0`). shiplane never tags a `0.0.0`, and `marketplace.unit.test.ts`
fails on a plugin with no changelog and no pending changeset.

## 2. Release

```sh
pnpm release
```

Run it from an up-to-date `main` with a clean working tree; it refuses anything else. It reads where
things stand first, so each run picks up where the last one stopped:

| Where things stand                | What `pnpm release` does                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| changesets pending, no release PR | shows each plugin's bump, asks, then opens the release PR                           |
| a release PR is open              | waits for its merge: merge it on GitHub, or press `m` to merge it from the terminal |
| merged, not tagged yet            | tags each plugin `<name>--v<version>` and creates its GitHub release                |
| nothing pending                   | says so and stops; `pnpm changeset` queues a change                                 |

Opening the release PR runs:

| Step                                | What it does                                                               |
| ----------------------------------- | -------------------------------------------------------------------------- |
| `git switch -c release/<timestamp>` | `main` is protected, so versions only reach it through a PR                |
| `changeset version`                 | consumes `.changeset/*.md`, bumps each plugin's `package.json`, changelogs |
| `node scripts/sync-versions.mjs`    | copies each plugin's new version into its agent manifests                  |
| commit, push, open the PR           | titled `chore(<plugin>): release v<version>`, listing every bump           |

Once it merges, shiplane tags each version on the commit that brought it, pushes the tags, and
creates each GitHub release with the plugin's changelog section as its notes. A failed step undoes
what it ran and says so; fix whatever stopped it and run `pnpm release` again. To see where each
plugin stands without changing anything, run `pnpm shiplane status`.

Run `claude plugin validate . --strict` before merging the release PR. shiplane tags with git, so
nothing else validates the plugin at release time.

Leave `version` out of the plugin's marketplace entry. Claude Code reads `plugin.json` first, so a
version there is ignored at install time and can only go stale. `marketplace.unit.test.ts` fails if
one appears.

The tag format, and how each agent pins a release, are in [tags.md](tags.md).

## What a plugin release actually ships

Nothing is uploaded anywhere, because the marketplace _is_ this git repository. But merging a plugin
change to `main` does not ship it. Claude Code decides whether an installed plugin has an update by
comparing versions, and it reads the version from `plugin.json` first. Until that string changes,
`claude plugin update` reports the plugin as already at the latest version, however many commits
land.

The release PR is what ships a plugin: merging it changes the version in `plugin.json`. Users then
get the new code with `claude plugin update <name>`, or on their next auto-update if they turned it
on for this marketplace. It is off by default for marketplaces not run by Anthropic. Updates apply
on restart or `/reload-plugins`.

Two consequences:

- A plugin change merged to `main` waits for the next release PR, so several can ship together.
- Someone who installs the plugin in that window gets the new code under the old version number.
  Keep the window short.

Catalogue edits in `marketplace.json` (descriptions, categories) carry no version and reach users on
their next `claude plugin marketplace update`.

The tag does a narrower job: it makes the plugin resolvable by a dependency range like
`ts-base@^1.2.0`, and gives a `git-subdir` entry something to pin.

## Why plugins carry a package.json

A plugin's real manifest is `.claude-plugin/plugin.json`. The `package.json` beside it is private,
never published, and exists only so changesets can see the plugin as a workspace package and version
it; `scripts/sync-versions.mjs` copies the result across. Keeping two files in step is the price of
one release flow; the alternative was versioning every plugin by hand.
