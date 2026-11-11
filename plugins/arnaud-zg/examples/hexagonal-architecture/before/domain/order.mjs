// The domain reaches out to an adapter: it cannot run without the price list.
import { prices } from "../adapters/prices.mjs";

/** @param {{ item: string, quantity: number }[]} lines */
export const total = (lines) =>
  lines.reduce((sum, { item, quantity }) => sum + (prices.get(item) ?? 0) * quantity, 0);
