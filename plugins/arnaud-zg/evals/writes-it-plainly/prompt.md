---
max_turns: 8
allowed_tools: [Read, Glob, Grep, Bash, Write, Skill]
---

Rewrite our release procedure in plain language, STE style, strict level, as numbered steps, and
check it: "In order to release, it's basically really important that the tests should be run first;
after that the version is bumped by the release script and then the tag is pushed, which is
something that needs to happen before the release notes can be written by whoever is on duty."
