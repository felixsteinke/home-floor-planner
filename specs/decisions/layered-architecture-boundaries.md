# Layered Architecture Boundaries

Status: Approved

Date: 2026-04-19

## Context

The project requires strict separation between business rules, orchestration, and UI representation to keep the codebase readable, testable, and maintainable during AI-assisted implementation. Without explicit boundaries, business logic can leak into Angular components and create long-term complexity.

## Decision

Adopt a three-layer architecture with enforced dependency direction:

- Domain layer (`src/app/domain`)
- Service layer (`src/app/service`)
- Representation layer (`src/app/representation`)

Boundary rules:

- Domain is pure TypeScript and must not depend on Angular.
- Service orchestrates domain logic via Angular services and must not contain representation code.
- Representation contains no business logic and uses service APIs.
- Representation should primarily use Angular Material.
- ArchUnitTS is used to enforce boundary rules.

## Consequences

- Positive:
  - Better readability and maintainability.
  - Clear testing ownership across unit and e2e levels.
  - More reliable AI-generated implementation consistency.
- Trade-offs:
  - Additional structure and architecture lint setup overhead.
  - Explicit adaptation code needed between layers.

## Links

- [specs/architecture.md](../architecture.md)
- [specs/product.md](../product.md)
- [specs/decisions/README.md](./README.md)
