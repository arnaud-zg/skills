# Patterns

**Each slow shape has a known cut.** Find the worst term, match its shape, apply the cut. Space is
the usual price; say it.

| Slow shape                                         | Before        | Cut                                                | After          | Space   |
| -------------------------------------------------- | ------------- | -------------------------------------------------- | -------------- | ------- |
| search a list inside a loop (`includes`, `find`)   | O(n·m)        | build a `Set` or `Map` once, look up in it         | O(n+m)         | O(m)    |
| compare every pair (duplicates, two-sum, matching) | O(n²)         | one pass with a `Map` of what was seen             | O(n)           | O(n)    |
| group or count with a nested filter                | O(n·k)        | one pass into a `Map` of buckets                   | O(n)           | O(n)    |
| sort inside a loop, or re-sort after each insert   | O(n² log n)   | sort once outside; a heap for a running min or max | O(n log n)     | O(n)    |
| linear search in sorted data                       | O(n)          | binary search                                      | O(log n)       | O(1)    |
| sum or count over a range, asked again and again   | O(n·q)        | prefix sums built once                             | O(n+q)         | O(n)    |
| best window or pair in a sequence                  | O(n²)         | sliding window or two pointers                     | O(n)           | O(1)    |
| top k of n                                         | O(n log n)    | a heap of size k                                   | O(n log k)     | O(k)    |
| the same pure call repeated with the same input    | O(calls·cost) | memoize, or hoist it out of the loop               | O(unique·cost) | O(uniq) |
| string or array built by `+=` / spread in a loop   | O(n²)         | push into an array, join once                      | O(n)           | O(n)    |
| removing from the front of an array (`shift`)      | O(n²)         | an index pointer, or a queue                       | O(n)           | O(1)    |
| one query or request per item (N+1)                | n round trips | one batched query (`IN`, a join, a bulk endpoint)  | 1 round trip   | O(n)    |
| scan to the end when the answer is known early     | O(n)          | return or `break` at the first answer              | best case O(1) | O(1)    |

## Keep the behaviour

- A `Set` drops duplicates and a `Map` keeps the last write: check the old code did the same.
- `Object` keys are strings: use a `Map` when keys are numbers or objects.
- Equality changes: `includes` uses `SameValueZero`, a hash on objects uses identity. Key by the
  field the old code compared.
- Order: a `Map` keeps insertion order, a heap does not. Sort the result if the old one was sorted.
