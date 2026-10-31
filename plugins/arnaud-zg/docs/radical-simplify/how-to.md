# 🛠️ How-to guides: point radical-simplify at the right target

[📚 Docs home](../../../../docs/README.md) › [✂️ radical-simplify](README.md) ›
[🚀 Tutorial](tutorial.md) · **🛠️ How-to** · [📖 Reference](reference.md) ·
[💡 Explanation](explanation.md)

One recipe per kind of target. For a first run, see the [Tutorial](tutorial.md).

## Simplify a screen or a component in code

Name the file, so the skill reads what exists instead of guessing:

```text
/arnaud-zg:radical-simplify src/checkout/CheckoutForm.tsx
```

The Question table then lists the real fields and actions in that file. Ask for the code change
afterwards, as a separate request, once you agree with the redesign.

## Simplify a flow that spans several files

Name the entry point and say where the flow ends:

```text
/arnaud-zg:radical-simplify the signup flow, from app/signup/page.tsx to the welcome email
```

## Simplify a process written in a doc

Point it at the doc, or paste the steps:

```text
/arnaud-zg:radical-simplify docs/release.md
```

## Keep a constraint that must stay

Say so in the request: "the legal consent checkbox stays". The skill still questions it, but marks
it kept and names who owns it, instead of removing it.

## Get it to fire without the slash command

Ask in words it listens for: _make this radically simpler_, _streamline this flow_, _cut the steps_,
_make it 10x simpler_, _rethink this from first principles_.

## Example

[`examples/radical-simplify/onboarding.md`](../../examples/radical-simplify/onboarding.md): an
onboarding flow walked through the six steps.
[`examples.integration.test.ts`](../../examples/examples.integration.test.ts) runs it.
