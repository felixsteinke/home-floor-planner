# Product Specification

## Summary

Home Floor Planner is a fully static web application for creating and editing simple 2D property and home layouts. The product is centered on rectangle and line primitives, centimeter-based coordinates, and a JSON model persisted in browser local storage.

## Product vision

Enable users to quickly model real-world properties and buildings in a clear, accessible 2D editor, with enough precision for practical planning while keeping interaction simple.

## Primary user value

- Model a full property with multiple buildings and floors in one place.
- Build layouts from simple primitives (rectangles and lines) with predictable behavior.
- Store and reopen data locally without requiring a backend service.
- Export and import plans as JSON to move data between browsers or devices.
- Keep multiple local workbooks and switch active planning context quickly.

## Scope for current version

### In scope

- Static website with no backend dependency.
- 2D layout planning using only rectangles and lines.
- Three core product capabilities:
  - Layout data drawer.
  - Accessible editor frame.
  - Import/export with local persistence.
- Property-level coordinate system in centimeters.
- Local workbook management with one active workbook at a time.
- Parent-child shape relationships with anchor-based positioning.
- Visual and semantic attributes per shape, including dimensions and text metadata.

### Out of scope

- 3D visualization.
- Real-time collaboration.
- Cloud sync.
- Snapping behavior (grid, edge, midpoint).
- Shape rotation in the current version.
- Automated code/build implementation details in this document.

## Domain model requirements

- One root JSON object represents one property.
- A property can contain multiple buildings (for example: house, garage, shed).
- Each building can contain multiple layers (for example: ground floor, first floor).
- Layout elements are restricted to:
  - Rectangles (visible rooms or hidden parent frames).
  - Lines (for example walls).
- Elements support parent-child relations and anchor-based coordinates.
- Moving a parent anchor must move all descendants by the same offset.
- Hidden rectangles are valid structural parents for non-rectangular room compositions built from walls.

## Persistence and property exchange rules

- Users edit one active property at a time.
- Users can keep multiple local workbooks and edit one active workbook at a time.
- Each workbook holds one active property in the current version.
- Route-based workbook rules apply:
  - `/` opens the first bundled static workbook.
  - `/new` always starts a new workbook flow.
  - `/w/:workbookPath` opens matching bundled static workbook or starts new workbook flow if no match exists.
- Creating a workbook requires explicit name entry before creation.
- After workbook creation, users must be informed that workbook access is limited to the current browser.
- Users can replace the active property by importing another property JSON file.
- The application ships with bundled built-in properties that can be loaded and edited as the active property.
- Import requires explicit confirmation before replacing the current active property.
- Distribution across devices happens through user-exported JSON files.
- JSON documents include schema version metadata.
- Export metadata includes property ID and export timestamp, with optional property name for display.

## Coordinate and measurement rules

- Coordinate units are centimeters across the entire product.
- Property frame defines the top-level coordinate system.
- Property origin is fixed at the bottom-left corner of the property frame at (0,0).
- Each child uses a coordinate origin at the bottom-left corner of its immediate parent.
- Example: 25m x 20.5m is represented as 2500 x 2050 in the model.
- Rectangle geometry is defined by anchor point, width, and height.
- Line geometry is defined by anchored endpoints in the active parent coordinate system.

## Shape attribute requirements

Each shape must support at least:

- Semantic type (for example: property, building, building-layer, room, wall, door, opening, helper-frame).
- Stroke color.
- Fill color (where applicable).
- Stroke thickness.
- Z-index.
- Name/label.
- Auto-calculated values (for example area or length where applicable).
- User-overridable display values for text metadata.
- Opening-direction metadata for door/opening lines.

Door and opening elements are modeled as lines in the current version.

Wall and door lines must always be placed within a rectangle parent context.

## Layering and visibility requirements

- Types and structures must be hideable.
- If the outermost visible parent is hidden, the drawer and viewport context must update accordingly.
- If only one highest-level parent remains visible, its coordinate system should be shown as the active context.
- Coordinate system visualization must be independently hideable.

## Editing interaction rules

- Drawer and canvas are used for display and selection.
- Main editor workspace must render a visible 2D floor map (rectangles and lines) for the active property.
- Drawer is structural navigation/inspection and does not replace the floor-map viewport.
- Geometry/text value editing is done through dedicated input fields.
- Import/export and local data-management actions are provided through a dedicated data/privacy dialog.
- Workbook creation uses a required-name dialog and then a browser-local visibility confirmation dialog.

## High-level user flow

1. User creates property frame (root coordinate system).
2. User places building rectangles within the property.
3. User creates building layers and room structures.
4. User places either direct room rectangles or hidden room frames with custom wall lines.
5. User adds doors/openings with distinct visual style.
6. User adjusts anchors and dimensions; descendants move with parents.
7. User views and edits readable metadata (names, area, lengths, style attributes).
8. User saves implicitly to local storage and optionally imports/exports JSON snapshots.
9. User creates/switches workbooks to separate planning scenarios.

## Quality requirements

- Interaction model must favor simple, low-friction editing.
- Accessibility must meet WCAG AA and pass AXE checks.
- Core product behavior should remain predictable for nested coordinate systems.

## Open questions (optional)

- Add unresolved product-level questions only.
- Remove each item after the decision is reflected in product/feature specs.

## Links

- [specs/README.md](./README.md)
- [specs/architecture.md](./architecture.md)
- [specs/features/layout-data-drawer.md](./features/layout-data-drawer.md)
- [specs/features/accessible-layout-editor.md](./features/accessible-layout-editor.md)
- [specs/features/import-export-and-local-persistence.md](./features/import-export-and-local-persistence.md)
- [specs/features/application-layout-and-property-selection.md](./features/application-layout-and-property-selection.md)
- [specs/features/first-time-user-guidance.md](./features/first-time-user-guidance.md)
- [specs/features/workbook-management.md](./features/workbook-management.md)
