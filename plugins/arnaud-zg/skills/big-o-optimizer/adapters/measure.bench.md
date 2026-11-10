---
fulfils: measure
---

# measure · bench

**A timing, run on the same input before and after.** Used when the person asks for numbers.

1. Use the project's bench tool if it has one (`vitest bench`, `pytest-benchmark`, `go test -bench`,
   `hyperfine`). Otherwise, a throwaway script in the scratch folder that runs both versions.
2. Feed an input large enough for the term to show, at two sizes (such as 1 000 and 100 000), so the
   growth is seen, not only one ratio.
3. Copy each figure from the output, with the command that printed it. Delete the throwaway script.

A figure no command printed is not written.
