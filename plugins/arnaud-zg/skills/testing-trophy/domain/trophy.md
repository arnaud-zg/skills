# The testing trophy

**The more a test resembles the way the code is used, the more confidence it gives.** From Kent C.
Dodds,
[The Testing Trophy and Testing Classifications](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications).

## The layers, by file name

The check reads a test's layer from its name, so the name is the contract:

| Layer       | File                              | Uses                                     |
| ----------- | --------------------------------- | ---------------------------------------- |
| static      | `tsconfig.json`, an ESLint config | the type checker and the linter          |
| unit        | `*.unit.test.*`                   | one module, inputs in, outputs out       |
| integration | `*.integration.test.*`            | real modules together, a temp folder, db |
| end to end  | `*.e2e.test.*`, or under `e2e/`   | the built product, as a user drives it   |

A test file with none of these names is `unlayered`: the check asks for one.

## The shape

- **Integration is the widest layer.** More unit files than integration files is an inverted trophy:
  each unit test proves less about what users meet.
- **Mock only what you do not own**: the network, the clock, a paid API. A mock of the project's own
  module (`vi.mock("./x")`, `jest.mock("../x")`) tests the mock, not the code.
- **Name a test by its behaviour**, "given a zero limit, then every request is refused", never by
  the function it calls ("checkLimit"). The name is what a reader sees when it fails.
- **A bug gets a failing test first**, at the lowest layer that reproduces it, then the fix, in its
  own change.

## What the check cannot see

Whether a test asserts anything worth asserting, and whether the integration tests touch the real
seams. Read the tests for that; a clean check is where the audit starts.
