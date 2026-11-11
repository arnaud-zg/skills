# audit

**The check finds the imports; the reading finds the rest.**

1. **Find the layers.** Read the tree. If the folders use other names than the
   [defaults](../domain/rules.md#the-layers), write the project's own list, innermost first, for
   `--layers`. If there are no layers at all, say so: the audit becomes a [design](design.md) of
   where each part would go.
2. **Run the check** on the folder and keep its output as printed.
3. **Read the core** for [the smells](../domain/smells.md) the check cannot see: framework types,
   ports shaped like their adapter, logic in adapters, mocks of the project's own modules.
4. **For a skill**, also read each `ports/PORTS.md` against
   [what a ports page holds](../domain/contract.md#what-a-portsportsmd-holds): a page that restates
   the contract instead of linking it is a finding.
5. **Rank the findings**: an outward import first, then a smell that blocks swapping an adapter,
   then the rest. Each gets its file, its line and its fix.

Hand back the check's counts line, the ranked findings, and the one change to make first.
