# Workbook Management

## Summary

This feature defines how users create and switch between multiple local workbooks, where each workbook contains one active property dataset.

## User value

Users need separate planning spaces (for example different houses, renovation scenarios, or clients) without replacing current work whenever they import or reset data.

## Goals

- Let users create a completely new workbook.
- Let users switch between existing workbooks.
- Keep workbook data local-first and independent from other workbooks.
- Support deterministic workbook opening through URL paths.

## Non-goals

- Cloud-synced workbook sharing.
- Concurrent collaborative workbook editing.
- Multi-property workbook structures in the current version.

## Requirements

- The app must support multiple local workbooks.
- Exactly one workbook is active at runtime.
- Each workbook contains exactly one active property object for the current version.
- Users must be able to create a new workbook from a clear UI action.
- Creating a new workbook must require a workbook name via a dedicated confirmation dialog.
- Creating a new workbook must initialize an editable default property frame.
- After new workbook creation is confirmed, a second dialog must clearly state the workbook is only accessible in the current browser.
- Users must be able to switch active workbook from a dedicated workbook control.
- Switching workbooks must update drawer, editor, and input fields to the selected workbook data.
- Workbook updates must auto-save locally.
- Import/export actions operate on the active workbook only.
- Deleting or resetting one workbook must not silently destroy other workbook data.
- Route behavior must be deterministic and follow these rules:
  - `/` opens the first available static workbook from bundled assets.
  - `/new` always starts a new workbook flow and never opens an existing workbook.
  - `/w/:workbookPath` tries to open a bundled static workbook that matches `workbookPath`.
  - If `/w/:workbookPath` has no static workbook match, the app must open a new workbook flow instead.
- After creating a workbook, the app route must update to `/w/:workbookPath` derived from the confirmed workbook name.

## Acceptance criteria

- [ ] A user can create a new workbook and immediately edit it.
- [ ] A user can switch between at least two locally stored workbooks.
- [ ] Edits in workbook A do not overwrite workbook B.
- [ ] Refreshing the page restores the workbook list and the last active workbook.
- [ ] Import/export actions apply to the currently active workbook.
- [ ] Visiting `/` opens the first bundled static workbook.
- [ ] Visiting `/new` always opens a new workbook flow.
- [ ] Visiting `/w/:workbookPath` opens the matching bundled static workbook when available.
- [ ] Visiting `/w/:workbookPath` without a match opens a new workbook flow.
- [ ] New workbook creation requires a name in a dialog before creation is finalized.
- [ ] After workbook creation, the app shows a dialog that the workbook is browser-local only.
- [ ] After workbook creation, the URL updates to the created workbook path.

## UX and accessibility requirements

- Workbook create/switch controls must be keyboard accessible.
- Active workbook must be visible in text, not color-only indicators.
- Workbook change feedback must be announced via polite status messaging.
- Creating or switching workbook must preserve predictable focus behavior.
- Route-driven workbook load success/fallback outcomes must be announced with clear status text.
- Name-required and browser-local confirmation dialogs must be keyboard reachable and screen-reader readable.

## Data and semantics

- Workbook metadata must include a stable local workbook ID and display name.
- Workbook metadata must include a route-safe `workbookPath` string.
- Workbook persistence must remain browser-local only.
- Workbook state is separate from onboarding preference state.
- Bundled static workbooks are read-only sources loaded from shipped asset JSON files and become local editable workbooks when opened.
- The "first bundled static workbook" must be determined by manifest order from the static workbook source list.

## Links

- [specs/product.md](../product.md)
- [specs/features/application-layout-and-property-selection.md](./application-layout-and-property-selection.md)
- [specs/features/import-export-and-local-persistence.md](./import-export-and-local-persistence.md)
