// An adapter that answers the port from memory; a database adapter would answer it the same way.

/** @returns {import("../ports/price-list.mjs").PriceList} */
export const inMemoryPrices = () => {
  const prices = new Map([
    ["apple", 2],
    ["pear", 3],
  ]);
  return { priceOf: (item) => prices.get(item) ?? 0 };
};
