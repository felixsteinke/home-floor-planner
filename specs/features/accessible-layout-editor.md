# Accessible Layout Editor

## Summary

The editor frame is the main workspace for placing and adjusting rectangle and line shapes within nested coordinate systems, while keeping interactions simple and accessible.

## User value

Users need direct visual editing to model real properties quickly, but they also need precise numeric control and clear context for nested parent-child geometry.

## Goals

- Enable simple placement and modification of rectangles and lines.
- Preserve parent-child anchor behavior across all hierarchy levels.
- Support both rectangular rooms and non-rectangular rooms using hidden frames plus wall lines.
- Provide clear coordinate context and straightforward editing interactions.

## Non-goals

- 3D editing.
- Complex CAD-grade constraints.
- Automatic generation of complete architectural plans.

## Requirements

- The editor must render a centimeter-based coordinate space.
- The editor must visually render the active layout as a 2D floor map (rectangle and line primitives).
- Property frame dimensions define top-level coordinate bounds.
- Example mapping: 25m x 20.5m maps to 2500 x 2050 in model coordinates.
- The property root coordinate origin is fixed at the bottom-left corner of the property frame (0,0).
- Child shape coordinates are always relative to the bottom-left origin of their immediate parent.
- Users must be able to create rectangles by setting:
  - Anchor (bottom-left coordinate in mathematical orientation).
  - Width.
  - Height.
- Users must be able to create lines by setting:
  - Start point.
  - End point.
- Users must be able to place children inside selected parent contexts.
- Moving a parent anchor must move all descendants by the same offset.
- Users must be able to create hidden rectangles as layout frames.
- Users must be able to build non-rectangular rooms from lines within a hidden frame.
- Users must be able to apply semantic types (for example room, wall, door, opening).
- Walls and doors are modeled as line shapes only in the current version.
- Wall and door lines must be placed within a rectangle parent and cannot exist without a parent rectangle context.
- Users must be able to style shapes with color, thickness, and z-index.
- Doors and openings are represented as line shapes in the current version.
- Door/opening line shapes must support a stored opening-direction value for future use.
- Users must be able to show/hide coordinate overlays independently of shape visibility.
- When only one highest-level parent remains visible, editor context should shift to that parent.
- Snapping (grid, edge, midpoint) is not included in the current version.
- Drawer and canvas interactions are for display and selection; edits are committed through dedicated input fields.
- Users place geometry by selecting a parent context, choosing coordinates, and adjusting values through manual input fields.
- Rectangle rotation is not included in the current version; rectangles remain axis-aligned.

## Acceptance criteria

- [ ] A user can create and position a property frame with custom dimensions.
- [ ] A user can add at least one building rectangle under the property.
- [ ] A user can add child shapes in nested contexts and verify parent-relative placement.
- [ ] Moving a parent updates every child position consistently.
- [ ] The editor shows a visible 2D floor map of active layout geometry.
- [ ] Property origin is fixed at (0,0) in the bottom-left of the property frame.
- [ ] A child shape placed inside a parent uses coordinates relative to that parent's bottom-left corner.
- [ ] A user can create a non-rectangular room using a hidden rectangle plus wall lines.
- [ ] A user can style walls and doors/openings differently.
- [ ] Wall and door lines cannot be created without selecting a rectangle parent context.
- [ ] Door/opening elements are created as line shapes and include an opening-direction value in data.
- [ ] A user can toggle coordinate overlays without hiding the underlying shapes.
- [ ] Snapping behavior is absent; users can still create precise geometry via manual coordinate inputs.
- [ ] Drawer and canvas interactions select/inspect entities, while value edits are applied through dedicated input fields.
- [ ] Rectangle editing does not include rotation controls.

## UX and accessibility requirements

- Core edit actions must be possible via keyboard, not mouse only.
- Focus order must follow a predictable workflow: context -> tool -> target -> properties.
- Current selection and parent context must be clearly announced and visible.
- Interaction states (selected, hidden, locked if supported later) must not rely on color alone.
- Numeric inputs must provide clear validation and error messaging.

## Data and semantics

- Coordinates are always centimeters.
- Shape coordinates are relative to immediate parent.
- Type semantics should remain consistent between drawer, editor, and exported JSON.
- Area and length values derive from geometry; labels remain editable.

## Links

- [specs/product.md](../product.md)
- [specs/architecture.md](../architecture.md)
- [specs/features/application-layout-and-property-selection.md](./application-layout-and-property-selection.md)
- [specs/features/first-time-user-guidance.md](./first-time-user-guidance.md)
- [specs/features/layout-data-drawer.md](./layout-data-drawer.md)
- [specs/features/import-export-and-local-persistence.md](./import-export-and-local-persistence.md)
