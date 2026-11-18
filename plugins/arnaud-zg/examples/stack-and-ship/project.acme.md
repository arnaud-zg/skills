# Project adapter: Acme

A made-up project. Its PR rules are the JSON block `scripts/check-pr.mjs` reads.

```json
{
  "defaultBranch": "main",
  "phaseId": "S\\d+(?:-\\d+)?",
  "sections": ["What & why", "Testing"],
  "required": [
    {
      "rule": "ticket",
      "pattern": "<!--\\s*Ticket:\\s*acme/shop#\\d+",
      "fix": "keep `<!-- Ticket: acme/shop#<N> ... -->` commented"
    },
    {
      "rule": "screenshots",
      "pattern": "!\\[[^\\]]*\\]\\(|<img\\s|no\\s+ui\\s+change",
      "fix": "embed the refreshed screenshots, or say `No UI change`",
      "shown": true
    }
  ],
  "banned": [
    {
      "rule": "closing-keyword",
      "pattern": "\\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\\s+#\\d+",
      "fix": "remove `Closes #N`: the Ticket line names the issue",
      "shown": true
    },
    {
      "rule": "em-dash",
      "pattern": "\\u2014",
      "fix": "use a period, comma, colon or parentheses"
    },
    {
      "rule": "chat-link",
      "pattern": "chat\\.example\\.com/",
      "fix": "copy the content in: a chat link expires"
    }
  ]
}
```
