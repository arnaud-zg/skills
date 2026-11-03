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
git commit -m "feat(hexagonal-skill-builder): add a new rule"
git push -u origin my-change
gh pr create --fill
```

Commit messages follow Conventional Commits with a mandatory scope: `type(scope): description`.
Enforced by the `commit-msg` hook. The subject is also the changelog line users read, so write it
for them ([how](./docs/release.md#1-write-the-commit-subject)).

To add a plugin or a skill, follow [docs/how-to.md](./docs/how-to.md).

## Before opening a PR

```sh
pnpm typecheck && pnpm lint && pnpm lint:md && pnpm format:check && pnpm test
claude plugin validate . --strict
```

All must pass; CI runs the same checks.

## Releasing

See [docs/release.md](./docs/release.md).
