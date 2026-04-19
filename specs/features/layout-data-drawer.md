# Layout Data Drawer

## Summary

The layout data drawer is the structural control center for the plan. It exposes the full property hierarchy, visibility controls, shape metadata, and context switching for nested coordinate systems.

The drawer is not the 2D floor-map viewport; visual map rendering belongs to the main editor workspace.

## User value

Users need a reliable, inspectable view of all layout entities to avoid losing track of nested parents, hidden frames, and style semantics while editing.

## Goals

- Show the full property structure (property -> buildings -> layers -> shapes).
- Enable fast selection and contextual navigation.
- Make visibility and type filtering easy to control.
- Surface key read/write metadata without forcing canvas-only interactions.

## Non-goals

- Freeform geometry editing directly inside the drawer.
- Replacing the editor frame for spatial manipulation.
- Acting as a persistence or import/export workflow owner.

## Requirements

- The drawer must show one root property object at the top.
- Buildings must be grouped under the property.
- Building layers must be grouped under each building.
- Shapes must be grouped under each layer and support recursive child display.
- Each node must display at least:
  - Name.
  - Identifier (node id).
  - Type.
  - Parent reference context (where applicable).
  - Visibility state.
  - Effective visibility state (visible because all ancestors are visible).
  - Basic geometry summary (for example width/height or line length).
  - Core style summary (stroke/fill/z-index where applicable).
- Users must be able to select any node from the drawer.
- Selection in drawer and editor must stay synchronized.
- Drawer hierarchy ordering is data-defined only for the current version.
- Users must have add, update, and delete actions for supported entities, but no manual sibling reordering.
- Users must be able to hide/show:
  - Individual shapes.
  - Type groups.
  - Higher-level structures (building, layer, property).
- Hiding a parent must hide all descendants in the visual editor.
- Visibility changes in the drawer do not require per-action undo support in the current version.
- The drawer must expose anchor coordinates and other values for display and selection context.
- The drawer and canvas are not direct editing surfaces for geometry/text values; editing is done through dedicated input fields.
- The drawer must expose style semantics:
  - Stroke color.
  - Fill color (if applicable).
  - Stroke thickness.
  - Z-index.
- The drawer must expose calculated and user-readable fields:
  - Area/length.
  - Labels/names.
- Drawer UI expansion/collapse state resets to default on page reload.

## Acceptance criteria

- [ ] A user can inspect the full hierarchy from property to nested child shapes.
- [ ] Selecting a node highlights and focuses the same entity in the editor frame.
- [ ] Hiding a parent removes all descendant shapes from visual display.
- [ ] When top-level visibility changes, drawer context updates to the current highest visible parent.
- [ ] A user can read geometry and label values in the drawer and edit them via dedicated input fields.
- [ ] Changes made in dedicated input fields are reflected in drawer values for the selected shape.
- [ ] A user can add, update, and delete entities from the drawer where allowed.
- [ ] Sibling order is not manually reorderable in the current version.
- [ ] Visibility toggles apply immediately and are not required to support individual undo steps.
- [ ] Drawer expansion/collapse state returns to default after a page reload.
- [ ] A user can see id, parent context, effective visibility, and style summary for each node without opening another panel.

## UX and accessibility requirements

- Drawer must be fully keyboard navigable.
- Expand/collapse, selection, and visibility toggles must have visible focus states.
- Tree controls must expose semantic roles and states for assistive technologies.
- Visibility toggles must be announced with clear labels, including affected scope.
- Drawer interactions must avoid color-only meaning; include text/icon state indicators.

## Data and semantics

- Drawer order should mirror actual hierarchy order from JSON data.
- Hidden helper rectangles remain valid structural nodes and must be identifiable.
- Type group operations apply to all matching descendants in current scope.
- Calculated metrics are derived from geometry but shown in centimeter-based units.
- Drawer UI state (for example expanded/collapsed groups) is session-local and not persisted across reloads.

## Links

- [specs/product.md](../product.md)
- [specs/architecture.md](../architecture.md)
- [specs/features/application-layout-and-property-selection.md](./application-layout-and-property-selection.md)
- [specs/features/accessible-layout-editor.md](./accessible-layout-editor.md)
- [specs/features/import-export-and-local-persistence.md](./import-export-and-local-persistence.md)
