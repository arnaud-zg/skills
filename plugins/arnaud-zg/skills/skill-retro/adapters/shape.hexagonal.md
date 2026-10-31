---
fulfils: shape
delivers: holds, or findings each with a file, a line and a fix
binds: the hexagonal-skill-builder plugin's check script, check.mjs
---

# shape: hexagonal-skill-builder

The plugin's checker holds four rules: `named`, `small`, `resolves` and `tested`. Run it on the
changed skill's folder:

```sh
node <plugin-dir>/scripts/check.mjs <skills-folder>/<skill> [--suite <package-script>]
```

- Exit 0: the skill holds. Exit 1: fix each printed finding and run it again. Exit 2: nothing was
  checked, which is not a pass.
- Pass `--suite` when the project runs its skill tests from one `package.json` script, so a new test
  must be named there too.
- If the caller binds a second shelf check of its own, run that as well. Both must exit 0.

`small` counts lines only: an entry's body to 150, any other page to 300, a description to 1024
characters. The plugin counts no tokens and finds no repeated text, which is why this skill carries
`scripts/weight.mjs`. A skill can hold every rule and still be expensive.
