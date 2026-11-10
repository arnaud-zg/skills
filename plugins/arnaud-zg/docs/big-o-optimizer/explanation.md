# 💡 Explanation: why it proves both

[📚 Docs home](../../../../docs/README.md) › [⚡ big-o-optimizer](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · **💡
Explanation**

Why the skill works the way it does. To get something done, see the [How-to guides](how-to.md).

## Faster and wrong is a bug

The common way a complexity cut breaks code is quiet: a `Set` drops duplicates, a `Map` reorders, an
object key turns `1` into `"1"`. So the tests run before the rewrite and after it, and a test is
written first when none reaches the code.

## The worst term only

O(n²) to O(n) changes what a program can handle. A cached length does not. Fixing the worst term
first, and stopping when no pattern pays, keeps the change small and readable.

## Numbers are read, never guessed

The Big O is read from quoted lines. A timing is copied from the command that printed it, at two
sizes so the growth shows. Without a bench, the hand-over says "not measured" rather than inventing
a speed-up.

## The method is language-agnostic

A nested membership test is O(n·m) in every language, and a hash set fixes it in every language.
What changes is the spelling and the traps: an object key that turns `1` into `"1"`, a Go map that
iterates in random order, a Python list that cannot be a dict key. So the patterns are written once,
generically, and each language's spelling and traps live in a `language` adapter. Without one, the
skill reads the standard library's documented costs instead.

## Why adapters

Every project proves things its own way: unit tests, golden files, a profiler, a perf budget in CI.
Ports keep the method fixed and let the project plug its tools in by dropping one file, without
forking the skill.
