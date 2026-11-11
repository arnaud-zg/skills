# 🚀 Tutorial: catch a domain that imports its database

[📚 Docs home](../../../../docs/README.md) › [⬡ hexagonal-architecture](README.md) › **🚀 Tutorial**
· [🛠️ How-to](how-to.md) · [📖 Reference](reference.md) · [💡 Explanation](explanation.md)

**2 minutes, 2 runs: a leak, then the same code with a port.**

## 1. Run the check on the leaking version

```sh
node plugins/arnaud-zg/skills/hexagonal-architecture/scripts/check-layers.mjs plugins/arnaud-zg/examples/hexagonal-architecture/before
```

You should see:

```text
LAYERS domain 1 · ports 0 · application 0 · adapters 1
  domain/order.mjs:2  outward
  domain points out at adapters: ../adapters/prices.mjs
  → name what domain needs as a port, and let the adapters side fill it
✗ 1 findings.
```

The domain cannot run without the price list: it imports it.

## 2. Run it on the version with a port

```sh
node plugins/arnaud-zg/skills/hexagonal-architecture/scripts/check-layers.mjs plugins/arnaud-zg/examples/hexagonal-architecture/after
```

```text
LAYERS domain 1 · ports 1 · application 1 · adapters 1
✓ every dependency points inward.
```

The domain takes the price as a function, the use case asks the `PriceList` port, and `main.mjs`
wires an in-memory adapter to it. Next, the [How-to guides](how-to.md) do the same to your code.
