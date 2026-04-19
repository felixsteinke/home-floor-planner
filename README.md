# Home Floor Planner

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.7.

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running linting

To check your code for linting errors, run:

```bash
npm run lint
```

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
npm run test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
npm run e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Specifications

This project keeps its working specifications in Markdown files under [`specs/`](./specs/README.md).

- Start with [`specs/README.md`](./specs/README.md) for the structure, read order, and maintenance rules.
- Use [`specs/product.md`](./specs/product.md) for product goals and scope.
- Use [`specs/architecture.md`](./specs/architecture.md) for product constraints and domain semantics.
- Use [`specs/features/README.md`](./specs/features/README.md) for feature-level requirements and acceptance criteria.
- Use [`specs/decisions/README.md`](./specs/decisions/README.md) for durable architecture and product decisions.

When behavior, scope, or architecture changes, update the relevant spec files in the same change as the code.

## Local verification

Use the project `package.json` scripts for local verification:

```bash
npm run format
npm run lint
npm run test
npm run build
```

Run `npm run e2e` when changes affect user flows, routing, forms, or accessibility behavior.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
