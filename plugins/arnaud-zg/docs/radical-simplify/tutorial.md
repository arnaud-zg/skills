# 🚀 Tutorial: cut a refund flow down to one tap

[📚 Docs home](../../../../docs/README.md) › [✂️ radical-simplify](README.md) › **🚀 Tutorial** ·
[🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

Five minutes. You will hand the skill a slow, real-looking process, read its six sections, and pick
the first change to make.

## 1. Install the plugin

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
```

## 2. Give it a process

In Claude Code, type:

```text
/arnaud-zg:radical-simplify Our expense refund: the employee fills a 14-field form, prints it,
gets a manager signature, scans it, emails it to finance, finance re-types it, a second person
approves anything over 50 euros, and the employee hears back about three weeks later.
```

## 3. Read the six sections in order

The answer has one section per step:

1. **Question**: a table of every element (each field, the print, the signature, the re-typing, the
   second approval) with why it exists and a verdict. Expect most to be marked legacy, and the tax
   rules to be kept, with finance named as their owner.
2. **Remove**: printing, scanning and re-typing go. It says what breaks if anything does.
3. **Simplify**: the form shrinks to what a receipt cannot tell you.
4. **Reimagine**: a new flow, as steps or an ASCII sketch, for example a photo of the receipt and
   one confirm.
5. **Accelerate**: the waits that disappear, such as the batch payment cycle.
6. **Automate**: only now, for example reading amounts off the receipt and routing approvals by
   rule.

Notice that automation comes last. Nothing that was removed in step 2 gets automated in step 6.

## 4. Check the count and pick the first change

The answer ends with a **before → after** line, counted from your description and from the proposal,
and the one change to make first. Start there.

## Next

- Point it at a screen or code instead: [How-to guides](how-to.md)
- What each step must return: [Reference](reference.md)
