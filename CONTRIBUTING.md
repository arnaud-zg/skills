# 🤝 Contributing

Thanks for helping improve this marketplace.

## Setup

```sh
corepack enable
pnpm install
```

`pnpm install` also runs `lefthook install`, wiring up the Git hooks from
[`@arnaud-zg/configs`](https://github.com/arnaud-zg/configs): formatting on commit, Conventional
Commits on the message, and a block on direct commits to `main`.

## Making a change

`main` is protected, direct commits are blocked. Work on a branch and open a PR:

```sh
git checkout -b my-change
# ...edit...
pnpm changeset          # unless the change needs no release
git commit -m "feat(hexagonal-skill-builder): add a new rule"
git push -u origin my-change
gh pr create --fill
```

`pnpm changeset` writes a file into `.changeset/` recording which plugins your change affects and
how much to bump them. Commit it with your work. If the change needs no release at all,
`pnpm changeset add --empty` says so explicitly.

Commit messages follow Conventional Commits with a mandatory scope: `type(scope): description`.
Enforced by the `commit-msg` hook.

To add a plugin or a skill, follow [docs/how-to.md](./docs/how-to.md).

## Before opening a PR

```sh
pnpm typecheck && pnpm lint && pnpm lint:md && pnpm format:check && pnpm test
claude plugin validate . --strict
```

All must pass; CI runs the same checks.

## Releasing

See [docs/how-to.md#release-a-version](./docs/how-to.md#release-a-version).
