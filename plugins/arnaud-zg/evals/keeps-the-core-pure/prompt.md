---
max_turns: 6
allowed_tools: [Read, Glob, Grep, Skill]
---

Our domain imports the database. Use hexagonal architecture to fix it, and show the port:

```js
// src/domain/order.js
import { db } from "../adapters/postgres.js";

export async function total(orderId) {
  const lines = await db.query("select price, quantity from lines where order_id = $1", [orderId]);
  return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
```
