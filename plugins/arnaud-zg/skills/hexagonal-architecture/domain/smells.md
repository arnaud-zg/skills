# Leaks no import shows

**The check sees an import that points out. These leak with every import pointing the right way.**
Read them in an audit, and before a port is drawn.

| Smell                                | Sign                                                                         | Fix                                                                                                           |
| ------------------------------------ | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **a framework type in the core**     | the domain takes a `Request`, a `Row`, an ORM entity, a `Date.now()`         | take plain values; the adapter converts at the edge, the clock is a port                                      |
| **a port shaped like its adapter**   | `query(sql)`, `get(url)`, `exec(cmd)` on a port                              | name it for the core's need: `ordersOf(customer)`                                                             |
| **a port per class**                 | every service has an interface with one implementation and no second in view | a port exists for something that varies or is slow: I/O, time, money, a model                                 |
| **logic in the adapter**             | a rule, a price or a decision sits in a controller, a query or a handler     | move it to the domain; the adapter translates and nothing more                                                |
| **a use case that calls a use case** | one job reaches into another's internals                                     | share the domain rule they both need, or give the second a port                                               |
| **the core that knows its caller**   | the domain returns HTTP codes, CLI exit codes or Markdown                    | return a result; the driving adapter renders it                                                               |
| **mocking what you own**             | a test mocks the project's own module to reach a use case                    | test the core through its ports with an in-memory adapter; test each real adapter once against the real thing |
| **a skill step that names its tool** | a verb says "run `gh`" or "read the Claude transcript" outright              | name the port in the step; the tool goes in an adapter                                                        |

## In tests

The port is the seam. The core is tested with an in-memory adapter on each driven port, fast and
real; each adapter is tested once, against what it wraps. A mock of a port is fine; a mock of the
project's own module removes the seam that breaks.
