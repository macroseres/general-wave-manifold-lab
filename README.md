# General Wave Manifold Lab

Scientific laboratory for the study and visualization of wave manifolds, sonic loci, rarefaction fields and related constructions for systems of conservation laws.

Current package version: **v0.7.0-dev.24.47.90**.

The central research goal is to construct and visualize Riemann solutions on the wave manifold, linked to state-space constructions and physical-space realizations, and study their classification by flux parameters. The implemented model is the general ten-coefficient quadratic flux. Complete solution coverage and a general validated Riemann solver remain research objectives. See [scientific objectives and scope](docs/OBJETIVOS_E_ESCOPO.md).

## Development

```bash
npm ci
npm run dev
```

Before committing:

```bash
npm run check
```

`npm run check` executes lint, mathematical tests and the production build.

## Scientific architecture

The project follows one dependency direction:

**mathematics → numerics → geometry → visualization → UI**

Mathematical definitions must remain independent of React and Three.js. New scientific objects should be documented and testable before their visual representation becomes authoritative.

## Documentation

The [state-space implementation status](docs/STATE_SPACE_STATUS.md) records the current chain coverage: RR candidates now complement the existing RS, SR and SS constructions, with strict endpoint classification and shared physical profiles. RC, SC, CR, CS and CC are now available for constant-direction contact families; this is a restricted contact model, not complete coverage of linearly degenerate fields.

The current scientific writing priority is the independent [traditional construction](docs/traditional/README.md): conservation laws, classical and nonclassical admissibility, state-space waves and physical Riemann profiles. The topological construction on the wave manifold is the second layer; existing material is preserved for that later consolidation.

Start with the [reference guide](docs/mathematics/README.md), [coverage of all 26 chapters](docs/DOCUMENTATION_COVERAGE.md), [bibliography and provenance](docs/BIBLIOGRAPHY.md), and [reproducible examples](docs/examples/README.md). The application and Help share the Markdown chapters; canonical core formulas also retain their LaTeX reference.

The [notation guide](docs/NOTACAO.md) distinguishes state roles, chart coordinates and symbols that have different meanings across sources.

- `docs/mathematics/` — canonical LaTeX mathematical reference for the validated pre-Hugoniot core.
- `docs/architecture/` — software and numerical architecture.
- `docs/decisions/` — architecture/mathematics decision records.
- `docs/ROADMAP.md` — planned milestones.
- `docs/CHANGELOG.md` — version history.
- `CONTRIBUTING.md` — Git and contribution workflow.

The existing `docs/MATHEMATICS.md` is retained as legacy/reference material only; canonical pre-Hugoniot formulas live in `docs/mathematics/`.
