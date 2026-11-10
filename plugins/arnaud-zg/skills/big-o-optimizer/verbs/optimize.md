# optimize

**One hot path, one pattern, one proof.** Fix the worst complexity first, and stop when the next cut
would cost more readability than it saves time.

## Steps

1. **Load the adapters** by [ports/PORTS.md](../ports/PORTS.md): the `language` adapter matching the
   target's file, the defaults, then any the project injects. Say which ones run.
2. **Read** the target, and every function it calls inside a loop. A call hides a loop.
3. **Name the Big O** of each loop and call on the hot path, from what the code does: nested loops,
   a membership test on a list inside a loop (the `language` adapter lists its spellings), a sort
   inside a loop, a query per item. Quote the lines. Write the total, such as `O(n·m)`, and what `n`
   and `m` are.
4. **Pick the pattern** from [domain/patterns.md](../domain/patterns.md) for the worst term. If none
   fits, or the input is known to stay tiny, say so and stop: no rewrite is the right answer.
5. **Verify before** by the `verify` adapter, so a failure after the rewrite is the rewrite's.
6. **Rewrite** the smallest piece that removes the term. Keep the signature, the order of the
   result, duplicates and the edge cases (empty, one item, a missing value) exactly as they were.
7. **Verify after** by the same adapter. A failure is fixed or the rewrite is reverted, never
   explained away.
8. **Measure** by the `measure` adapter, then run each `extra` adapter at the step it names.
9. **Hand over** in this shape:

   | Path     | Before | After  | Pattern      | Verified      |
   | -------- | ------ | ------ | ------------ | ------------- |
   | `fn` L12 | O(n·m) | O(n+m) | lookup → set | 14 tests pass |

   Then the memory cost of the change (a hash set costs `O(m)` space), and what was not verified or
   measured, with why. "Not measured" is written, never shown as a blank or a zero.

## Never

- Change behaviour to gain speed, even a result order nobody seems to rely on.
- Write a timing that no command printed.
- Micro-optimize (a cached length, one loop form over another) while a higher term is left.
