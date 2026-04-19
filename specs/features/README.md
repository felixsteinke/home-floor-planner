# Feature Specifications

This folder defines user-facing capabilities for the current product version.

## Naming

- Use `kebab-case.md` filenames.
- Name the file after the capability, not the implementation detail.
- Split files when one feature grows into multiple independent workflows.

## Current feature specs

- [layout-data-drawer.md](./layout-data-drawer.md)
- [accessible-layout-editor.md](./accessible-layout-editor.md)
- [import-export-and-local-persistence.md](./import-export-and-local-persistence.md)
- [application-layout-and-property-selection.md](./application-layout-and-property-selection.md)
- [first-time-user-guidance.md](./first-time-user-guidance.md)
- [workbook-management.md](./workbook-management.md)

## Minimum structure

Use [specs/templates/feature-spec.md](../templates/feature-spec.md) as the starting point.

A good feature spec should define:

- user or business value,
- goals and non-goals,
- functional requirements,
- acceptance criteria,
- accessibility or UX constraints,
- data semantics and domain rules,
- unresolved open questions when needed.

## Maintenance

- Create a new file before substantial implementation begins.
- Update the feature spec when behavior changes.
- Use real local Markdown links in each feature file's `## Links` section.
- Keep unresolved questions in [specs/discovery/open-questions.md](../discovery/open-questions.md), then remove them once resolved and the resulting behavior is reflected in specs.
- Link to related decision files when architecture choices affect the feature.

## Writing focus for this project

- Keep requirements implementation-agnostic.
- Use centimeter-based examples where measurements are relevant.
- Call out parent-child coordinate behavior explicitly.
- Define keyboard and screen-reader expectations for all editor actions.
- Distinguish required behavior from optional future enhancements.

## Future feature candidates

- [shape-style-presets.md](./shape-style-presets.md)
- [constraint-snapping-and-guides.md](./constraint-snapping-and-guides.md)
- [print-and-pdf-layout.md](./print-and-pdf-layout.md)
