# ✍️ plain-language

[📚 Docs home](../../../../docs/README.md) › [arnaud-zg](../../README.md) › **✍️ plain-language**

A skill that writes any output in plain language, after ASD-STE100 (Simplified Technical English).
ASD-STE100 is the controlled language of aircraft maintenance manuals. The skill takes its writing
rules, not its dictionary. A script checks the text before you see it.

**3 levels** · **7 rules** · **20 or 25 words per sentence** · **English and French**

```mermaid
flowchart LR
  a["Pick the level"] --> b["Write by the rules"] --> c["check-plain.mjs"] --> d["Hand over"]
  c -- "a finding" --> b
```

## At a glance

- **What is it?** Seven writing rules at three levels: strict for steps, standard for reports, light
  for comments to paste
- **Who uses it?** You, when you ask Claude to write plainly. Other skills, when they reach their
  output step
- **How do I install it?** `/plugin install arnaud-zg --marketplace arnaud-zg/skills`, or
  `npx skills add arnaud-zg/skills --skill plain-language` for any agent
- **How do I call it?** Ask Claude to _write this plainly_ or to _use STE_, or type
  `/arnaud-zg:plain-language`
- **What does it need?** Node 22 for the check. No network, no dependency

## Which page do I need?

| If you want to…                          | Go to                            | It gives you                           |
| ---------------------------------------- | -------------------------------- | -------------------------------------- |
| rewrite a first text                     | 🚀 [Tutorial](tutorial.md)       | a wordy note turned plain, checked     |
| check a file, or name a level in a skill | 🛠️ [How-to guides](how-to.md)    | one recipe per task                    |
| look up the levels, rules and exit codes | 📖 [Reference](reference.md)     | every option, rule and finding         |
| understand why 80% of STE, not 100%      | 💡 [Explanation](explanation.md) | what STE gives, and what it would cost |

## 🔒 Know what you're installing

- **The check reads one file or stdin and writes nothing.** `scripts/check-plain.mjs` prints its
  findings. No network, no dependency.
- **It never changes code, a path, a number or a quote.** It does not read them.

Read [`SKILL.md`](../../skills/plain-language/SKILL.md) before installing it. Claude reads
`SKILL.md`, not this page.
