You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Prefer Angular Material components and theming primitives for styling and UI structure before creating custom styling elements.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## Local Verification Best Practices

- Use project `package.json` scripts for local verification instead of ad-hoc CLI commands.
- Run `npm run format` before verification to normalize code style.
- Run `npm run lint` and fix all lint issues before submitting changes.
- Run `npm run test` for unit tests and ensure they pass locally.
- Run `npm run build` to confirm the app compiles for production.
- Run `npm run e2e` when changes affect user flows, routing, forms, or accessibility behavior.
- Preferred pre-submit order: `npm run format`, `npm run lint`, `npm run test`, `npm run build`.

## Specification-Driven Development

- Treat the Markdown files under `specs/` as the project specification source of truth.
- Before starting non-trivial work, read `specs/README.md`, then the most relevant files in `specs/features/`, `specs/decisions/`, and `specs/architecture.md` before changing code.
- Keep the entire specification in Markdown files inside `specs/`; do not spread core requirements across issue comments or code-only notes.
- Use real local Markdown links for all spec references (for example `[specs/product.md](specs/product.md)` and `[specs/features/layout-data-drawer.md](specs/features/layout-data-drawer.md)`).
- Keep only unresolved questions in `specs/discovery/open-questions.md`; remove entries once resolved.
- After resolving a question, update the resulting behavior requirements in relevant spec files and do not keep duplicate Q/A history.
- Update the relevant spec files in the same change whenever requirements, behavior, UX, architecture, or delivery scope changes.
- Create a new feature spec before implementing a substantial feature, workflow, or route.
- Record durable architectural choices as separate decision files under `specs/decisions/` instead of burying them inside implementation details.
- Keep spec files small, focused, and linkable. Prefer one topic per file, kebab-case filenames, and explicit cross-links between related specs.
- Write spec files for efficient AI consumption: use stable headings, concrete requirements, acceptance criteria, and constraints.
- Include Mermaid diagrams in architecture-related specs for visualization of layers and dependencies.
- When a spec becomes outdated, update it immediately or mark it clearly as `Superseded` with a link to the replacement.
- If code and specs disagree, resolve the mismatch instead of silently coding around it.

## Layered Architecture Rules

- Follow the three required layers from [specs/architecture.md](specs/architecture.md): `domain`, `service`, and `representation`.
- Domain layer must be pure TypeScript with no Angular dependencies and minimal external dependencies.
- Service layer must orchestrate domain behavior using Angular services and avoid representation logic.
- Representation layer must contain no business logic and use services for behavior.
- Reflect layer boundaries in file structure under `src/app/domain`, `src/app/service`, and `src/app/representation`.
- Prefer Angular Material in representation for UI components and interactions.
- Prioritize readability over abstraction complexity.

## Testing and Architecture Enforcement

- Add strong unit-test coverage for domain and service layers.
- Add e2e coverage for representation workflows and accessibility behavior.
- Enforce architecture boundaries with ArchUnitTS rules.
- Treat architecture lint failures as blocking issues.
- Maintain ArchUnitTS tests in `src/architecture/architecture.spec.ts` and follow `docs/architecture-testing.md` when adding or changing rules.
- Keep `docs/architecture-testing.md` updated whenever ArchUnitTS usage patterns, options, or rule coverage change.
