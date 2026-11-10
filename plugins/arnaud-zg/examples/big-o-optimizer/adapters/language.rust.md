---
fulfils: language
matches: .rs
---

# language · rust

| Generic         | Use                                           |
| --------------- | --------------------------------------------- |
| hash set        | `std::collections::HashSet`                   |
| hash map        | `HashMap`, or `BTreeMap` when order matters   |
| heap            | `BinaryHeap`; wrap in `Reverse` for a min     |
| growable buffer | `String::with_capacity`, `Vec::with_capacity` |
| front removal   | `VecDeque::pop_front`                         |

## Pitfalls

- `Vec::contains` and `iter().position` are O(n); `BTreeMap` lookups are O(log n).
- Keys need `Hash + Eq`: derive them on the compared fields only.
- Tests: `cargo test`. Bench: `cargo bench`, or `hyperfine`.
