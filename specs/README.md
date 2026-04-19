# Specifications

This folder is the product source of truth for Home Floor Planner.

## Purpose

- Keep all product requirements, behavior rules, and UX expectations in Markdown.
- Keep specifications explicit and easy for both humans and AI tools to consume.
- Keep requirements synchronized with implementation as the project evolves.

## Read order for AI-assisted work

1. [specs/README.md](./README.md)
2. [specs/product.md](./product.md)
3. [specs/architecture.md](./architecture.md)
4. Relevant files in [specs/features/](./features/README.md)
5. [specs/discovery/open-questions.md](./discovery/open-questions.md)
6. Relevant files in [specs/decisions/](./decisions/README.md)

## Structure

- [specs/product.md](./product.md): product vision, scope, and cross-feature requirements.
- [specs/architecture.md](./architecture.md): product-level constraints and domain/data semantics (not framework implementation).
- [specs/features/](./features/README.md): one file per user-facing capability.
- [specs/discovery/](./discovery/README.md): open product questions and decision backlog.
- [specs/decisions/](./decisions/README.md): durable decisions and tradeoffs.
- [specs/templates/](./templates/feature-spec.md): reusable document templates.

## Core rules

- Use one topic per file with `kebab-case` filenames.
- Use stable headings and concise bullet points.
- Include measurable acceptance criteria.
- Capture unresolved questions in [specs/discovery/open-questions.md](./discovery/open-questions.md) instead of scattering Q/A across feature files.
- Keep only unresolved questions in [specs/discovery/open-questions.md](./discovery/open-questions.md); remove entries after decisions are applied to specs.
- Use real local Markdown links for every file reference (for example `[specs/product.md](./product.md)`).
- Use Mermaid diagrams in architecture-related specs to visualize dependency flow and structure.
- Link related specs and decisions.

## Required sections for feature specs

1. Title
2. Status
3. Summary
4. User value
5. Goals
6. Non-goals
7. Requirements
8. Acceptance criteria
9. UX and accessibility requirements
10. Data and semantics
11. Open questions (optional, unresolved only)
12. Links

## Status values

- `Draft`
- `Proposed`
- `Approved`
- `Implemented`
- `Superseded`

If a file is `Superseded`, include a link to its replacement.

## Maintenance workflow

- Update specifications before or with any behavior change.
- Keep product-level concerns in [specs/product.md](./product.md).
- Keep feature behavior in [specs/features/](./features/README.md).
- Keep unresolved question tracking in [specs/discovery/open-questions.md](./discovery/open-questions.md).
- Keep long-lived tradeoff decisions in [specs/decisions/](./decisions/README.md).
- If code and specs differ, resolve the mismatch immediately.

## Current feature set

- [specs/features/layout-data-drawer.md](./features/layout-data-drawer.md)
- [specs/features/accessible-layout-editor.md](./features/accessible-layout-editor.md)
- [specs/features/import-export-and-local-persistence.md](./features/import-export-and-local-persistence.md)
- [specs/features/application-layout-and-property-selection.md](./features/application-layout-and-property-selection.md)
- [specs/features/first-time-user-guidance.md](./features/first-time-user-guidance.md)
- [specs/features/workbook-management.md](./features/workbook-management.md)
