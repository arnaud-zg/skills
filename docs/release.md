# 🚢 How to release a Claude Code plugin version

[📚 Docs home](README.md) › Writing plugins › [🛠️ How-to](how-to.md) › **Release**

Three commands release every plugin. Changesets is the entry point, and you never edit a version, a
changelog or a tag by hand.

```sh
pnpm changeset          # 1. in the PR that makes the change
pnpm release:version    # 2. opens the release PR; review and merge it
pnpm release            # 3. after the merge: tags and creates the GitHub releases
```

Each plugin has its own version, changelog (`plugins/<name>/CHANGELOG.md`) and `<name>--v<version>`
tag, and a changeset bumps only the plugins it names.

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
adds the plugin (`minor` for `0.1.0`). `pnpm release` never tags a `0.0.0`, and
`marketplace.unit.test.ts` fails on a plugin with no changelog and no pending changeset.

## 2. Open the release PR

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

## 3. Release, after the PR merges

```sh
pnpm release
```

It switches to an up-to-date `main` and finds every plugin version that has no GitHub release yet.
For each one it tags `<name>--v<version>` with `claude plugin tag`, which validates the plugin
first, pushes the tag, and creates the GitHub release with the plugin's changelog section as its
notes. Every step is safe to repeat: fix whatever stopped it and run `pnpm release` again.

It needs `gh auth login` and the `claude` CLI on your `PATH`. Nothing goes to npm.

## What a plugin release actually ships

Nothing is uploaded anywhere, because the marketplace _is_ this git repository. But merging a plugin
change to `main` does not ship it. Claude Code decides whether an installed plugin has an update by
comparing versions, and it reads the version from `plugin.json` first. Until that string changes,
`claude plugin update` reports the plugin as already at the latest version, however many commits
land.

The release PR from step 2 is what ships a plugin: merging it changes the version in `plugin.json`.
Users then get the new code with `claude plugin update <name>`, or on their next auto-update if they
turned it on for this marketplace. It is off by default for marketplaces not run by Anthropic.
Updates apply on restart or `/reload-plugins`.

Two consequences:

- A plugin change merged to `main` waits for the next release PR, so several can ship together.
- Someone who installs the plugin in that window gets the new code under the old version number.
  Keep the window short.

Catalogue edits in `marketplace.json` (descriptions, categories) carry no version and reach users on
their next `claude plugin marketplace update`.

The tag from step 3 does a narrower job: it makes the plugin resolvable by a dependency range like
`ts-base@^1.2.0`, and gives a `git-subdir` entry something to pin.

## Why plugins carry a package.json

A plugin's real manifest is `.claude-plugin/plugin.json`. The `package.json` beside it is private,
never published, and exists only so changesets can see the plugin as a workspace package and version
it; `scripts/sync-versions.mjs` copies the result across. Keeping two files in step is the price of
one release flow; the alternative was versioning every plugin by hand.
