---
name: skill-retro
description:
  Finds what made a session's skills slow, wrong or expensive in tokens, ranks it by cost, trims
  each skill and books every fix as its own draft pull request in a skills stack beside the feature
  stack. Use when a session ends, or for "retro", "end of session", "improve the skills", "what
  slowed us down", "make the skills cheaper", "skill feedback" or "too many tokens".
argument-hint: "[<skill> ...] [--bind <binding>]"
metadata:
  format: hexagon/1
  bind: "feedback=transcript,idle,spend,memory; shape=hexagonal; stack=gh-stack"
allowed-tools: Bash(node ${CLAUDE_SKILL_DIR}/scripts/*.mjs *)
---

# skill-retro

**A skill gets cheaper and truer only when its friction is fixed where the next session reads it.**

Read `domain/rules.md`, then follow `verbs/retro.md`. The three ports it asks, the adapters that
answer them and how a caller binds its own are in `ports/PORTS.md`.
