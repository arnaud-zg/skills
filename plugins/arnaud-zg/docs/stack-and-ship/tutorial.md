# 🚀 Tutorial: ship a first checked pull request

[📚 Docs home](../../../../docs/README.md) › [🚢 stack-and-ship](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

**10 minutes, 4 steps: install, describe the project, write a body, check it.**

You will give the skill your project's rules in one file, then check a pull request against them
before it is opened.

## 1. Install the plugin

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

## 2. Describe your project

Create `.agents/adapters/stack-and-ship/project.acme.md` at the root of your repository. Start from
[`project.acme.md`](../../examples/stack-and-ship/project.acme.md): a made-up shop whose phases are
`S30`, `S30-04`, and whose PR bodies keep a commented Ticket line.

## 3. Write a body

Save the PR body to a file, here [`body.md`](../../examples/stack-and-ship/body.md):

```markdown
<!-- Ticket: acme/shop#2092 (S30-04) -->

## What & why

Totals round once, at checkout, so the cart and the receipt agree to the cent.
```

## 4. Check it

```sh
node ${CLAUDE_SKILL_DIR}/scripts/check-pr.mjs \
  --title "fix(cart): [S30-04] totals round once, so the cart and the receipt agree" \
  --branch fix/S30-04-totals-round-once --body body.md
```

```text
✓ the PR holds every house rule this script checks
```

Drop the Ticket line and run it again: it prints `ticket  → keep ... commented` and exits 1. From
now on, ask _open the PR_ and the skill runs this check before it opens one.

## Next

- Add a rule, another forge, or stack a phase: [How-to guides](how-to.md)
- Every key of the project adapter: [Reference](reference.md)
