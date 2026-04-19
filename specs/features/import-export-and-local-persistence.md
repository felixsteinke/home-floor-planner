# Import, Export, and Local Persistence

Status: Draft

## Summary

This feature defines how plan data is saved, restored, imported, and exported in a fully static environment without backend services.

## User value

Users need confidence that their planning data is preserved locally, portable across devices, and recoverable from JSON without manual reconstruction.

## Goals

- Persist one property JSON in browser local storage.
- Allow explicit JSON import/export workflows.
- Keep data semantics consistent across editing sessions.

## Non-goals

- Cloud synchronization.
- Multi-user version merges.
- Server-side validation.

## Requirements

- Application must persist exactly one active property object in browser local storage at a time.
- Users must be able to replace the active property by importing another valid property file.
- Bundled built-in property files shipped with the app must be loadable as the active property.
- One JSON object represents one property and includes:
  - Property metadata and dimensions.
  - Buildings.
  - Building layers.
  - Shape hierarchy with parent-child relationships.
  - Style and semantic attributes.
  - Readable metadata and derived-value fields.
- Persistence must happen without backend calls.
- Import must require explicit user confirmation before replacing the current active property.
- Import must accept compatible JSON and load it as the active property dataset.
- Export must produce JSON representing the full active property state.
- Exported JSON must include schema version metadata.
- Exported JSON must include metadata fields for a property ID and export timestamp.
- Exported JSON should include a property display name when available.
- Import/export must preserve:
  - Coordinates.
  - Parent-child links.
  - Type semantics.
  - Visibility states.
  - Shape attributes and labels.
- User must receive clear feedback for:
  - Successful save/import/export.
  - Invalid JSON format.
  - Missing required structures.
- Invalid import payloads must not silently overwrite existing valid data.

## Acceptance criteria

- [ ] After changes, refreshing the page restores the same property from local storage.
- [ ] The app stores one active property at a time and replacing it switches the full active dataset.
- [ ] A user can load a bundled built-in property as the active dataset.
- [ ] Exported JSON can be imported back and recreates the same hierarchy and visual semantics.
- [ ] Import prompts for explicit confirmation before replacing the current active property.
- [ ] Import errors are explained with actionable messages.
- [ ] Failed import attempts do not destroy current working data.
- [ ] Imported data is immediately editable in drawer and editor views.
- [ ] Exported JSON includes schema version, property ID, and export timestamp metadata.
- [ ] Exported JSON includes property display name when available.

## UX and accessibility requirements

- Import/export controls must be keyboard accessible and clearly labeled.
- File and text-based import interactions must provide screen-reader friendly status updates.
- Error messages must identify the failing condition and suggested corrective action.
- Success/error feedback must not rely on color alone.

## Data and semantics

- Persisted model is JSON-first and authoritative for session restoration.
- Persistence granularity is one property per JSON document and one active property in local storage.
- Imported JSON becomes the new active state once validated and confirmed.
- Derived values should be recalculated or verified after import where necessary.
- Bundled built-in properties follow the same schema and activate through the same replacement flow.
- JSON documents include a schema version for format evolution.
- Export metadata includes property ID and export timestamp, with optional property display name.

## Links

- [specs/product.md](../product.md)
- [specs/architecture.md](../architecture.md)
- [specs/features/application-layout-and-property-selection.md](./application-layout-and-property-selection.md)
- [specs/features/first-time-user-guidance.md](./first-time-user-guidance.md)
- [specs/features/layout-data-drawer.md](./layout-data-drawer.md)
- [specs/features/accessible-layout-editor.md](./accessible-layout-editor.md)
