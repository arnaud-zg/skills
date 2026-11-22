---
type: llm
weight: 2
---

The answer holds a numbered list of steps. Each step starts with a verb in the imperative ("Run",
"Bump", "Push", "Write"), holds one action, and has at most 20 words. The order is kept: tests,
version, tag, release notes. No fact from the prompt is lost. Judge the numbered steps only: a note
or a table after them may quote the words that were removed.
