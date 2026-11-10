---
fulfils: language
matches: .go
---

# language · go

| Generic         | Use                                                 |
| --------------- | --------------------------------------------------- |
| hash set        | `map[K]struct{}`                                    |
| hash map        | `map[K]V`                                           |
| heap            | `container/heap`                                    |
| growable buffer | `strings.Builder`, or `append` to a pre-sized slice |
| binary search   | `sort.Search`, `slices.BinarySearch`                |

## Pitfalls

- `slices.Contains` and `slices.Index` are O(n).
- Map iteration order is random: sort the keys if the old result was ordered.
- Map keys must be comparable: key by a struct of the compared fields, not by a slice.
- `s += x` on a string in a loop copies every time: O(n²).
- Tests: `go test ./...`. Bench: `go test -bench . -benchmem`.
