# Architecture Testing (ArchUnitTS)

This document explains how architecture tests are maintained for Home Floor Planner.

## What ArchUnitTS is used for here

ArchUnitTS enforces architecture boundaries as executable tests. In this repository, it is used to prevent layer violations and dependency cycles between:

- `src/app/domain`
- `src/app/service`
- `src/app/representation`

Reference docs:

- [ArchUnitTS package](https://www.npmjs.com/package/archunit)
- [ArchUnitTS documentation](https://lukasniessen.github.io/ArchUnitTS/)

## Scope

Architecture tests enforce layer boundaries from [specs/architecture.md](../specs/architecture.md):

- `src/app/domain`
- `src/app/service`
- `src/app/representation`

Current tests live in [src/architecture/architecture.spec.ts](../src/architecture/architecture.spec.ts).

## How ArchUnitTS is used in this project

Current tests use the `projectFiles()` API from `archunit`:

- `projectFiles().inFolder('...').should().haveNoCycles()`
- `projectFiles().inFolder('...').shouldNot().dependOnFiles().inFolder('...')`

Test assertions use `toPassAsync()`:

- `await expect(rule).toPassAsync(archunitOptions)`

Repository-specific options are defined once in `src/architecture/architecture.spec.ts`:

- `allowEmptyTests: true` for gradual migration while some layer folders may still be empty.

Pattern style in this repository:

- Prefer `inFolder('src/app/<layer>/**')` glob patterns for layer targeting.
- Keep patterns explicit and aligned with the actual folder structure from [specs/architecture.md](../specs/architecture.md).

## Run commands

```bash
npm run test:architecture
```

For full verification pipeline:

```bash
npm run format
npm run lint
npm run test:architecture
npm run test
npm run build
```

## Rule authoring recipe

When adding a new architecture boundary check, use this sequence:

1. Update architecture intent in [specs/architecture.md](../specs/architecture.md).
2. Add a focused `it(...)` rule in [src/architecture/architecture.spec.ts](../src/architecture/architecture.spec.ts).
3. Keep the rule name behavioral (for example, "service layer should not depend on representation layer").
4. Use the same `archunitOptions` object unless there is a strong reason not to.
5. Update this document's rule list so docs and tests stay aligned.

## Current rules

- No cycles in `src/app`.
- Domain must not depend on service.
- Domain must not depend on representation.
- Service must not depend on representation.
- No cycles inside layer folders.

## Maintenance workflow

1. Update [specs/architecture.md](../specs/architecture.md) first when a boundary rule changes.
2. Update [src/architecture/architecture.spec.ts](../src/architecture/architecture.spec.ts) in the same change.
3. Run `npm run test:architecture` and fix all failures.
4. If a failure is intentional architecture evolution, add or update a decision record in [specs/decisions/](../specs/decisions/README.md).

## Troubleshooting

- Rule passes unexpectedly:
  - Verify `inFolder(...)` patterns match real paths.
  - Keep `allowEmptyTests` behavior in mind during migration.
- Slow first cycle scan:
  - Keep the increased timeout on the global cycle test.

## Notes

- Tests currently use `allowEmptyTests: true` to support gradual migration into layer folders.
- When all three layer folders contain production code, set `allowEmptyTests` to `false` to make checks stricter.
- The global cycle check uses an increased timeout because initial ArchUnitTS scans can exceed Vitest's default 5 seconds.
