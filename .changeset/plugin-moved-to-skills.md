---
"@arnaud-zg/plugin-arnaud-zg": patch
---

The plugin now lives in [arnaud-zg/skills](https://github.com/arnaud-zg/skills). Install it from
there:

```sh
/plugin install arnaud-zg --marketplace arnaud-zg/skills
npx skills add arnaud-zg/skills --skill hexagonal-skill-builder
```

If you added the marketplace from `arnaud-zg/configs`, it keeps working for one more release, then
stops: run `/plugin marketplace remove arnaud-zg` and `/plugin marketplace add arnaud-zg/skills`.
