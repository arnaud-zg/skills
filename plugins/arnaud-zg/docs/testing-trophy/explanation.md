# 💡 Explanation: why the trophy is widest at integration

[📚 Docs home](../../../../docs/README.md) › [🏆 testing-trophy](README.md) ›
[🚀 Tutorial](tutorial.md) · [🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · **💡
Explanation**

Why the skill works the way it does. To get something done, see the [How-to guides](how-to.md).

## A test earns trust by resembling real use

Users meet modules together, never one function alone. An integration test fails when they do; a
unit test with its neighbours mocked keeps passing.

## A mock of your own code tests the mock

Mocking a module the project owns removes the very seam that breaks. Mocks stay at the edge: the
network, the clock, a paid API.

## The name is the failure message

A test titled by its behaviour says what broke when it fails. A test titled `checkLimit` says only
where to start reading.

## The project chooses its strategy

The skill is opt-in. doc-compass asks only that examples are run by some test; which strategy writes
those tests is the project's call.
