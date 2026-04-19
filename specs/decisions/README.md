# Decision Records

Use this folder for durable decisions that explain important choices and trade-offs.

## When to add a decision file

Create a decision record when a change affects multiple features or has long-term impact, for example:

- state management strategy,
- routing structure,
- persistence approach,
- rendering approach,
- collaboration model,
- testing strategy.

## Naming

Use a short, descriptive `kebab-case.md` filename, for example:

- `state-management-strategy.md`
- `canvas-rendering-approach.md`

## Minimum structure

Use this section order:

1. Title
2. Status
3. Date
4. Context
5. Decision
6. Consequences
7. Links

Use real relative Markdown links in the `Links` section, for example `[specs/product.md](../product.md)`.

## Status values

- `Proposed`
- `Approved`
- `Superseded`

If a decision is replaced, keep the old file and mark it `Superseded` with a link to the new one.
