# 📖 Reference: `marketplace.json` and `plugin.json` fields

[📚 Docs home](README.md) › Writing plugins › [📖 Reference](reference.md) › **Manifests**

## `marketplace.json`

At the repository root, in `.claude-plugin/`.

- `name` (string, required): Marketplace id used in `plugin@marketplace`. Kebab-case; no spaces,
  path separators or `..`. Cannot impersonate an official Anthropic marketplace. Reserved: `inline`,
  `builtin`, `skills-dir`, `synced`.
- `owner` (object, required): `{ name, email?, url? }`
- `plugins` (array, required): Catalogue entries; may be empty
- `description` (string): Shown when browsing marketplaces
- `metadata.pluginRoot` (string): Base directory for bare `source` names, e.g. `"./plugins"` makes
  `"source": "formatter"` resolve to `./plugins/formatter`. Sources already starting with `./` are
  unaffected.
- `metadata.version` (string): Marketplace version. Optional, and unused here: nothing updates it,
  so a hand-written value goes stale. This repository omits it and versions plugins individually
  instead.
- `metadata.description` (string): Alternate description slot
- `allowCrossMarketplaceDependenciesOn` (string[]): Marketplace names whose plugins may be
  auto-installed as dependencies. Only the root marketplace's allowlist applies, with no transitive
  trust.
- `forceRemoveDeletedPlugins` (boolean): When true, plugins removed from the catalogue are
  uninstalled from users and flagged
- `renames` (map): Append-only `old name → current name`, or `null` when removed. Followed on
  plugin-not-found; migrates user settings.

### Catalogue entry

- `name`: Required. Must match the plugin's own `name`.
- `source`: Required. See below.
- `description`: Shown in `/plugin` browse and search. This is the discovery text: write it for a
  human deciding whether to install.
- `author`: `{ name, email?, url? }`
- `category`: e.g. `development`, `security`, `productivity`
- `homepage`: Documentation URL
- `tags`: string[]
- `version`: Leave it out. `plugin.json`'s version wins at install time, and `claude plugin tag`
  refuses to tag when they disagree. `marketplace.unit.test.ts` rejects it.
- `strict`: Stricter manifest validation for this entry

### `source` forms

```jsonc
"source": "hello-tools"                    // bare name, resolved under metadata.pluginRoot
"source": "./plugins/hello-tools"          // path relative to the marketplace root
"source": { "source": "github", "repo": "owner/repo" }
"source": {                                 // a subdirectory of another repository, pinned
  "source": "git-subdir",
  "url": "https://github.com/owner/repo.git",
  "path": "plugins/thing",
  "ref": "v1.5.5",
  "sha": "30287f5e3f122a646d1ac5ca3ab96e130c52a3ad"
}
```

Pin third-party entries with both `ref` and `sha`. A tag can be moved; a SHA cannot.

## `plugin.json`

In the plugin's `.claude-plugin/` directory.

- `name` (string, required): Unique id, used for namespacing. Kebab-case, no spaces.
- `displayName` (string): Human-readable name shown in the UI; may contain spaces and casing. Not
  used for lookup.
- `version` (string): Semver. Claude Code compares it with the installed version to decide whether
  an update exists: until it changes, users keep their cached copy. Set by the release flow here,
  never by hand.
- `description` (string): User-facing explanation of what the plugin provides
- `author` (object): `{ name, email?, url? }`
- `homepage` (string (URL)):
- `repository` (string): Source repository URL
- `license` (string): SPDX identifier, e.g. `MIT`
- `keywords` (string[]): Discovery tags
- `defaultEnabled` (boolean): Whether the plugin starts enabled absent an explicit user setting
  (default `true`). Explicit user settings always win, and a plugin required by an enabled dependent
  is enabled regardless.
- `dependencies` (string[]): See below
- `metadata` (object): Free-form, for the author's own use. Preserved but not read by Claude Code.

### `dependencies`

Plugins that must be enabled for this plugin to function.

- `"ts-base"`: Resolved against the declaring plugin's own marketplace
- `"ts-base@other"`: From marketplace `other`; requires `allowCrossMarketplaceDependenciesOn`
- `"ts-base@^1.2.0"`: Version constraint, resolved against the dependency's git tags

Dependencies are auto-installed and flagged as such; `claude plugin prune` removes auto-installed
plugins that nothing depends on any more.
