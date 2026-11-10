---
fulfils: language
matches: .py
---

# language · python

| Generic         | Use                                                      |
| --------------- | -------------------------------------------------------- |
| hash set        | `set(items)`, `x in s`                                   |
| hash map        | `dict`, `collections.defaultdict`, `collections.Counter` |
| heap            | `heapq`; `heapq.nlargest(k, ...)` for top k              |
| growable buffer | append to a list, `"".join(parts)` once                  |
| front removal   | `collections.deque.popleft()` instead of `list.pop(0)`   |
| binary search   | `bisect`                                                 |
| memoize         | `functools.cache`                                        |

## Pitfalls

- `x in list`, `list.index`, `list.count`, `list.remove` are O(n).
- Only hashable values go in a set or a dict key: turn a list into a tuple first.
- `dict` keeps insertion order; `set` does not. Sort if the old result was ordered.
- Tests: `pytest`, or `python -m unittest`. Bench: `pytest-benchmark`, `python -m timeit`.
