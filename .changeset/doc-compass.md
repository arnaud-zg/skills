---
"@arnaud-zg/plugin-arnaud-zg": minor
---

doc-compass: a new skill that writes Diataxis documentation and keeps it true. It ships templates
that form a whole `docs/` folder (index, tutorial, how-to, reference, explanation, decision records,
gravestone), four verbs (create, place, maintain, audit), and `scripts/check-docs.mjs`, which checks
a docs folder for pages no index reaches, broken links and anchors, missing breadcrumbs, decisions
superseded one way only, stale "generated from" headers, long pages and banned strings.
