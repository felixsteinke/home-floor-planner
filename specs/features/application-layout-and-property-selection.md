# Application Layout and Property Selection

## Summary

This feature defines the overall application shell for current capabilities (layout drawer, editor workspace, import/export and persistence controls), while keeping room for future feature extensions. It also defines privacy-facing behavior and property selection across imported and bundled built-in property files.

## User value

Users need a clear, predictable layout where they can navigate property data, edit geometry, and import/export safely. They also need confidence about where data is stored and how privacy is preserved in a static, local-first application.

## Goals

- Provide a stable, extensible app layout for current and near-future features.
- Keep drawer, editor, and import/export actions discoverable and consistent.
- Support switching between one active property at a time, including bundled built-in properties.
- Make privacy and data-handling behavior clear in the interface.

## Non-goals

- Defining pixel-perfect visual design tokens.
- Defining backend-driven account, sync, or cloud storage experiences.
- Replacing detailed interaction requirements from feature-specific specs.

## Requirements

- The app must provide a persistent shell layout with distinct areas for:
  - Navigation and global actions.
  - Layout data drawer fixed to the left side on wide screens.
  - Main editor workspace with visible 2D floor-map rendering for the active property.
  - Editing input fields and property/value controls fixed to the right side on wide screens.
- Import/export and local data-management actions must be available from a secondary dialog instead of occupying main-frame space.
- Privacy/local-first messaging must be presented in that same secondary dialog.
- The shell layout must support responsive behavior while preserving access to all core actions.
- The app must support one active property at a time.
- The app must support one active workbook at a time.
- The app must allow creating a completely new workbook from the application shell/data dialog.
- The app must allow switching between locally stored workbooks.
- The shell must resolve startup context from route rules:
  - `/` opens the first bundled static workbook.
  - `/new` starts a new workbook flow.
  - `/w/:workbookPath` opens matching static workbook, or starts new workbook flow on no match.
- Creating a workbook must require a name-entry dialog before creation is finalized.
- After workbook creation, the shell must show a dialog that the workbook is only accessible in the current browser.
- After workbook creation, the shell route must update to the created workbook path.
- Users must be able to switch active property by:
  - Loading a bundled built-in property.
  - Importing a property JSON file.
- Switching active property must replace the active dataset context across drawer, editor, and input fields.
- The app must clearly communicate data locality and privacy at the UI level, including:
  - Data is stored locally in the browser.
  - No backend/cloud sync is used in the current version.
  - Export is user-initiated for moving data across devices.
- The app must provide a way to clear/reset local active property data.
- Bundled built-in properties must remain available as source examples even after user modifications to the active local property.
- The layout must allow extension points for future features (for example additional panels, inspectors, or tools) without breaking core workflows.

## Acceptance criteria

- [ ] A user can access drawer, editor, dedicated editing inputs, and import/export controls from the app shell without hidden dependencies.
- [ ] A user can switch active property between a bundled built-in property and an imported property file.
- [ ] A user can create a new workbook from the shell or data dialog.
- [ ] A user can switch active workbook and see drawer/editor/input context update accordingly.
- [ ] The startup route rules (`/`, `/new`, `/w/:workbookPath`) resolve workbook context as specified.
- [ ] Workbook creation requires a name-entry dialog.
- [ ] Workbook creation shows a browser-local accessibility confirmation dialog.
- [ ] Workbook creation updates URL to the created workbook path.
- [ ] After switching property, drawer/editor/input fields show the same active property data context.
- [ ] Privacy messaging is visible and understandable from the application layout.
- [ ] A user can clear local active property data through an explicit action.
- [ ] Core layout remains usable on narrower screens without blocking major workflows.
- [ ] Main editor workspace presents a visible 2D floor-map view of active layout geometry.
- [ ] On wide screens, drawer is left-aligned and editing inputs are right-aligned around the editor.
- [ ] Import/export and local data actions are accessed through a dedicated dialog and not shown as a primary panel.
- [ ] Privacy messaging is moved into the same dedicated data/privacy dialog.

## UX and accessibility requirements

- Global regions must be keyboard reachable with a predictable focus order.
- Region boundaries and purpose must be programmatically exposed for assistive technologies.
- Property switching and data-clearing actions must include explicit confirmation and understandable outcomes.
- Privacy messaging must be readable and not rely on color-only emphasis.
- Layout changes across screen sizes must preserve meaningful labels and control discoverability.

## Data and semantics

- Application shell state is separate from property geometry/model state.
- Exactly one property is active at runtime.
- Active property source may be local storage, imported JSON, or bundled built-in JSON.
- Privacy indicators describe behavior, not permissions unrelated to current static/local architecture.

## Open questions (optional)

No unresolved questions currently.

## Links

- [specs/product.md](../product.md)
- [specs/architecture.md](../architecture.md)
- [specs/features/layout-data-drawer.md](./layout-data-drawer.md)
- [specs/features/accessible-layout-editor.md](./accessible-layout-editor.md)
- [specs/features/import-export-and-local-persistence.md](./import-export-and-local-persistence.md)
- [specs/features/first-time-user-guidance.md](./first-time-user-guidance.md)
- [specs/features/workbook-management.md](./workbook-management.md)
