---
type: regex
pattern:
  "1\\.\\s*Run the tests[\\s\\S]*2\\.\\s*[A-Z][a-z]+ [\\s\\S]*[Vv]ersion[\\s\\S]*3\\.\\s*Push the
  tag[\\s\\S]*4\\.[\\s\\S]*release notes"
match: contains
target: last_message
---
