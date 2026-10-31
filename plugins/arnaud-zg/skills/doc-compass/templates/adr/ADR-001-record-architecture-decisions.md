# ADR-001: Record architecture decisions

[🏠 Home](../README.md) · [🧭 Decisions](README.md) · **ADR-001**

- **Status:** Accepted
- **Date:** {YYYY-MM-DD}

<!-- Status is Proposed, Accepted, or "Superseded by" with a link to the newer record. The newer
     record's status then says "Supersedes" with a link back: the check holds both ends. -->

## Context

Design choices get made in reviews and chats, then lost. A year later nobody knows why the code is
the way it is, and the obvious alternative is tried again.

## Decision

Every real design choice gets a record in `docs/adr/`, named `ADR-NNN-short-title.md`, with Status,
Date, Context, Decision and Consequences. A decided record is never edited: a new one supersedes it.

## Consequences

- The reason behind a choice survives the people who made it.
- A record costs ten minutes. Following an established pattern needs none.
