// The domain holds the rule and nothing else: the price of an item is handed in.

/**
 * @param {{ item: string, quantity: number }[]} lines
 * @param {(item: string) => number} priceOf
 */
export const total = (lines, priceOf) =>
  lines.reduce((sum, { item, quantity }) => sum + priceOf(item) * quantity, 0);
