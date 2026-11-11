// The use case: it knows the port, never the adapter behind it.
import { total } from "../domain/order.mjs";

/** @typedef {import("../ports/price-list.mjs").PriceList} PriceList */

/** @param {PriceList} priceList @param {{ item: string, quantity: number }[]} lines */
export const checkout = (priceList, lines) => total(lines, (item) => priceList.priceOf(item));
