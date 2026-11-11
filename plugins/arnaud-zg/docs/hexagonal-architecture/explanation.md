# 💡 Explanation: why every dependency points inward

[📚 Docs home](../../../../docs/README.md) › [⬡ hexagonal-architecture](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · **💡
Explanation**

Why the skill works the way it does. To get something done, see the [How-to guides](how-to.md).

## The core changes for business reasons, the edges for technical ones

A price rule changes when the business does; a database driver changes when a vendor does. Pointing
every dependency inward keeps the second kind of change at the edge.

## The core owns its ports

A port is written in the core's words, for the core's need. An interface shaped like its first
adapter only moves the coupling one file over.

## Hexagonal, clean, onion: one rule

The names differ in how many rings they draw. The rule they share is the one the check holds.

## A skill is a hexagon too

A skill's verbs are its use cases, its domain pages what stays true, its adapters the tools it
touches. A domain page that links a tool's page leaks the same way an import does, so the check
reads links too.

## One contract, said once

Five skills in this plugin have ports. Each used to explain ports, bindings and drop-ins in its own
words, and the words drifted. The contract now lives in this skill, and each ports page keeps only
its own ports.

```mermaid
flowchart LR
  classDef old fill:#f4ebe7,stroke:#8c6d62,stroke-width:1px,stroke-dasharray:4 3,color:#2a1d18
  classDef bad fill:#ffffff,stroke:#8c6d62,stroke-width:2px,color:#5a3a2f
  classDef src fill:#ffe6b8,stroke:#8a5200,stroke-width:3px,color:#1a1200
  classDef hook fill:#efe4fb,stroke:#5a2d91,stroke-width:2px,color:#1f0b33
  classDef copy fill:#e3f3df,stroke:#2f7d32,stroke-width:2px,stroke-dasharray:4 3,color:#0f2a10

  subgraph BEFORE["BEFORE · 6 places, each in its own words"]
    direction TB
    b1["big-o-optimizer<br/>ports + its own rules"]:::old
    b2["skill-retro<br/>ports + its own binding grammar"]:::old
    b3["glance-audit · glance-first · usage-runway<br/>ports + the same intro, reworded"]:::old
    b4["hexagonal-skill-builder<br/>the layers, explained again"]:::old
    drift["✗ they drift apart<br/>a fix in one place never reaches the others"]:::bad
    b1 ~~~ b2 ~~~ b3 ~~~ b4 ~~~ drift
  end

  subgraph AFTER["AFTER · 1 source, copied into each skill, checked"]
    direction TB
    src["✎ EDIT ONLY THIS<br/>hexagonal-architecture/domain/contract.md<br/>A port · An adapter · Binding · Drop-in · What a PORTS.md holds<br/>67 lines · no links out"]:::src
    hook(["⟳ pre-commit hook copies it"]):::hook
    subgraph SKILLS["each skill with ports/ · works installed alone"]
      direction LR
      s1["big-o-optimizer<br/>PORTS.md → CONTRACT.md"]:::copy
      s2["skill-retro<br/>PORTS.md → CONTRACT.md"]:::copy
      s3["+ 3 more skills<br/>PORTS.md → CONTRACT.md"]:::copy
    end
    guard["✓ pnpm test fails if a copy differs<br/>or if the source links to another file"]:::hook
    src ==> hook ==> SKILLS
    SKILLS --- guard
  end

  BEFORE ==> AFTER
```

Every skill with ports carries an exact copy of the contract, so it keeps its rules however it is
installed: an agent only ever reads a skill's own folder. The source is the one file to edit; the
pre-commit hook rewrites the copies, and `pnpm test` fails if one differs. The source links to no
other file, because each copy lives in a different folder.
