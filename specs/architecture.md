# Architecture and Data Semantics

Status: Draft

## Summary

This document defines product-level structural constraints and domain semantics for layout modeling. It intentionally avoids framework or implementation details.

## Core constraints

- The product is a static website with no backend.
- The source data model is JSON.
- One JSON object represents one property.
- Persistence is local to the browser via local storage.
- Import/export must preserve the same JSON structure.
- Exactly one property is active in local storage at a time.
- Built-in bundled property files may be loaded as the active property.

## Object hierarchy

- Property (root)
  - Buildings (0..n)
  - Building layers (0..n)
    - Shapes (0..n)
    - Child shapes (0..n recursively)

Hierarchy behavior:

- Every non-root shape may have a parent reference.
- Child coordinates are relative to the immediate parent coordinate system.
- Parent transforms must be propagated to descendants.

## Shape primitives

- Rectangle
  - Usage: property/building bounds, room bounds, hidden layout frames.
  - Geometry: anchor point, width, height.
- Line
  - Usage: walls, doors, openings, separators.
  - Geometry: start/end points relative to the current parent context.

Door and opening elements are represented as lines in the current version.

Wall and door lines require a rectangle parent context and cannot exist without a parent rectangle.

No other primitive shapes are in scope for the current version.

## Semantic typing

Shapes can be tagged with semantic types, including at least:

- `property`
- `building`
- `building-layer`
- `room`
- `wall`
- `door`
- `opening`
- `helper-frame`

Type drives default styling, filtering, visibility, and drawer grouping.

## Coordinate systems

- All measurement units are centimeters.
- The property is the top-level coordinate system.
- Property origin is fixed at bottom-left (0,0).
- A child shape creates or participates in a nested local coordinate space.
- Child origin is always the bottom-left corner of the immediate parent shape.
- Coordinate system overlays are separate from shape visibility and can be toggled independently.

## Editing constraints for current version

- Snapping (grid, edge, midpoint) is deferred.
- Rectangles remain axis-aligned; rotation is out of scope.
- Drawer and canvas are selection/display surfaces; value edits are performed through dedicated input fields.

## Derived and editable data semantics

- Auto-derived values include:
  - Rectangle area.
  - Line length.
- User-readable fields include:
  - Name/title.
  - Notes.
  - Optional overrides for displayed metric text.
  - Opening-direction metadata for door/opening lines.

## Import and export semantics

- Import requires explicit confirmation before replacing the active property.
- JSON documents include a schema version field.
- Export metadata includes:
  - property ID,
  - export timestamp,
  - optional property display name.

Derived values must remain available even when users customize display labels.

## Visibility semantics

- Users can hide shapes and type groups.
- Hiding a parent hides all descendants from viewport rendering.
- Drawer context reflects the highest visible hierarchy level.
- If one top-level visible parent remains, it becomes the default active context candidate.

## Open questions (optional)

- Add unresolved architecture/data-semantics questions only.
- Remove each item after the decision is reflected in architecture/feature specs.

## Links

- [specs/README.md](./README.md)
- [specs/product.md](./product.md)
- [specs/features/layout-data-drawer.md](./features/layout-data-drawer.md)
- [specs/features/accessible-layout-editor.md](./features/accessible-layout-editor.md)
- [specs/features/import-export-and-local-persistence.md](./features/import-export-and-local-persistence.md)
- [specs/features/application-layout-and-property-selection.md](./features/application-layout-and-property-selection.md)
- [specs/features/first-time-user-guidance.md](./features/first-time-user-guidance.md)
