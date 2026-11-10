---
fulfils: language
---

# language · any

**No adapter for this language: use what it ships.** This works for every language.

1. Name the language from the file extension or the build file.
2. Map each generic structure in [domain/patterns.md](../domain/patterns.md) to the standard
   library's own: its hash set, hash map, heap or priority queue, growable buffer, binary search.
   Prefer the standard library over a new dependency.
3. Check the documented complexity of each one you use. Some "maps" are trees (O(log n)), some
   "lists" are linked (O(n) index).
4. Find the test and bench commands in the build file (`Makefile`, `Cargo.toml`, `pom.xml`,
   `build.gradle`, `*.csproj`, `mix.exs` ...).

Say in the hand-over that no language adapter ran, so a project can add one.
