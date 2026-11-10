# Patterns

**Each slow shape has a known cut, in any language.** Find the worst term, match its shape, apply
the cut. The structures are named generically; the `language` adapter names them in the code's
language. Space is the usual price; say it.

| Slow shape                                           | Before        | Cut                                                | After          | Space   |
| ---------------------------------------------------- | ------------- | -------------------------------------------------- | -------------- | ------- |
| membership test on a list inside a loop              | O(n·m)        | build a hash set or hash map once, look up in it   | O(n+m)         | O(m)    |
| compare every pair (duplicates, two-sum, matching)   | O(n²)         | one pass with a hash map of what was seen          | O(n)           | O(n)    |
| group or count with a nested filter                  | O(n·k)        | one pass into a hash map of buckets                | O(n)           | O(n)    |
| sort inside a loop, or re-sort after each insert     | O(n² log n)   | sort once outside; a heap for a running min or max | O(n log n)     | O(n)    |
| linear search in sorted data                         | O(n)          | binary search                                      | O(log n)       | O(1)    |
| sum or count over a range, asked again and again     | O(n·q)        | prefix sums built once                             | O(n+q)         | O(n)    |
| best window or pair in a sequence                    | O(n²)         | sliding window or two pointers                     | O(n)           | O(1)    |
| top k of n                                           | O(n log n)    | a heap of size k                                   | O(n log k)     | O(k)    |
| the same pure call repeated with the same input      | O(calls·cost) | memoize, or hoist it out of the loop               | O(unique·cost) | O(uniq) |
| immutable string or array grown by copying in a loop | O(n²)         | append to a growable buffer, join once             | O(n)           | O(n)    |
| removing from the front of an array                  | O(n²)         | an index pointer, or a double-ended queue          | O(n)           | O(1)    |
| one query or request per item (N+1)                  | n round trips | one batched query (`IN`, a join, a bulk endpoint)  | 1 round trip   | O(n)    |
| scan to the end when the answer is known early       | O(n)          | return or break at the first answer                | best case O(1) | O(1)    |

## Keep the behaviour

- A set drops duplicates and a map keeps the last write: check the old code did the same.
- Equality changes: a list search compares by the language's equality, a hash by the key's hash. Key
  by the field the old code compared.
- Order: an ordered map keeps insertion order, a plain hash map or a heap may not. Sort the result
  if the old one was sorted.
- A hidden cost the language adds (a copy on slice, a lookup that is O(log n), not O(1)) is in the
  `language` adapter. Without one, check the standard library's documented complexity.
