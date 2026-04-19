# First-Time User Guidance

Status: Draft

## Summary

This feature defines an optional onboarding experience that helps first-time users discover the application layout, property selection flow, and basic editing workflow without forcing a mandatory tutorial.

## User value

New users can understand core concepts faster (property selection, hierarchy, editing inputs, import/export) and become productive with less confusion or trial-and-error.

## Goals

- Offer optional guided onboarding for first-time use.
- Explain the core workflow from property selection to editing and export.
- Keep guidance dismissible, resumable, and non-blocking.
- Improve confidence without reducing accessibility.

## Non-goals

- Mandatory walkthrough that blocks normal app usage.
- Deep training for advanced modeling workflows.
- Personalized cloud-based onboarding progress.

## Requirements

- The app must offer an optional first-time guidance flow when a user first opens the app.
- Users must be able to skip guidance immediately and continue using the app.
- Guidance must be re-openable later from a clear help/learn entry point.
- Guidance content must cover at least:
  - App layout regions and their purpose.
  - How to select/switch active properties (including bundled built-in properties).
  - Difference between selection/display surfaces and dedicated editing input fields.
  - Basic import/export and local privacy behavior.
- Guidance steps must be contextual to current UI regions and controls.
- Guidance state (completed/skipped) must be stored locally.
- Users must be able to reset guidance state and replay the onboarding flow.

## Acceptance criteria

- [ ] A first-time user is offered onboarding with clear options to start or skip.
- [ ] A user can complete onboarding without blocking access to app features.
- [ ] A user can reopen onboarding after skipping or completing it.
- [ ] Onboarding explains property switching, editing inputs, and import/export behavior.
- [ ] Onboarding progress state persists locally and can be reset.

## UX and accessibility requirements

- Guidance controls must be fully keyboard accessible.
- Step announcements and context changes must be exposed to assistive technologies.
- Users must be able to pause/close guidance without losing app control.
- Motion and focus changes during guidance must avoid disorientation.
- Guidance text must be concise, plain-language, and readable at standard zoom levels.

## Data and semantics

- Guidance state is UI preference metadata, separate from property model data.
- Guidance completion/skipped status must not modify property geometry/data.
- Guidance reset affects onboarding state only.

## Open questions (optional)

No unresolved questions currently.

## Links

- [specs/product.md](../product.md)
- [specs/features/application-layout-and-property-selection.md](./application-layout-and-property-selection.md)
- [specs/features/layout-data-drawer.md](./layout-data-drawer.md)
- [specs/features/accessible-layout-editor.md](./accessible-layout-editor.md)
- [specs/features/import-export-and-local-persistence.md](./import-export-and-local-persistence.md)
