// The composition root: it wires the adapter to the use case.
import { inMemoryPrices } from "./adapters/prices.mjs";
import { checkout } from "./application/checkout.mjs";

export const run = () => checkout(inMemoryPrices(), [{ item: "apple", quantity: 2 }]);
