# 💡 Explanation: composing plugins with bases and dependencies

[📚 Docs home](README.md) › Writing plugins › [💡 Explanation](explanation.md) › **Composition**

## Composition: base plugins and dependencies

`plugin.json` has a `dependencies` array — _"plugins that must be enabled for this plugin to
function"_. This is the mechanism for a shared base:

```jsonc
// plugins/react/.claude-plugin/plugin.json
{
  "name": "react",
  "dependencies": ["ts-base", "lint-base@^1.2.0"],
}
```

- A bare name (`ts-base`) resolves inside the declaring plugin's own marketplace.
- `name@marketplace` crosses marketplaces, and only works if the root marketplace lists that
  marketplace in `allowCrossMarketplaceDependenciesOn`. There is no transitive trust.
- `name@^1.2.0` constrains the version, resolved against the dependency's git tags.

Installing `react` pulls `ts-base` in automatically and marks it auto-installed. Uninstalling
`react` leaves it behind until `claude plugin prune` sweeps dependencies nothing depends on any
more. A plugin required by an enabled dependent is enabled regardless of its own `defaultEnabled`.

So composition happens twice, and it is worth being deliberate about which one you are using:

- **The user composes** by installing several small plugins. Best when the pieces are genuinely
  independent and someone might want one without the others.
- **You compose** by declaring `dependencies` on a base. Best when a plugin is meaningless without
  the base — shared conventions, a shared reference document, a shared hook.

Prefer the first. A dependency is a constraint you impose on every consumer; splitting into
independent plugins leaves the choice with them.
