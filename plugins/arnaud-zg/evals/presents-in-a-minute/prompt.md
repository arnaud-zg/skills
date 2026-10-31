---
max_turns: 8
allowed_tools: [Read, Glob, Grep, Bash, Write, Skill]
---

We moved our image resizing from the web server to a background queue. p95 upload time went from 4.2
s to 0.6 s, the server now runs 3 instances instead of 8, and 2 thumbnail sizes were dropped.
Nothing was load tested. Give me a one-minute TLDR of this change in the terminal.
