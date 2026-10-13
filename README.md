# General Wave Manifold Lab

Scientific laboratory for the study and visualization of wave manifolds, sonic loci, rarefaction fields and related constructions for systems of conservation laws.

Current version: **v0.7.0-dev.21 — Foundation Verification**.

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

- `docs/mathematics/` — canonical LaTeX mathematical reference for the validated pre-Hugoniot core.
- `docs/architecture/` — software and numerical architecture.
- `docs/decisions/` — architecture/mathematics decision records.
- `docs/ROADMAP.md` — planned milestones.
- `docs/CHANGELOG.md` — version history.
- `CONTRIBUTING.md` — Git and contribution workflow.

The existing `docs/MATHEMATICS.md` is retained as legacy/reference material only; canonical pre-Hugoniot formulas live in `docs/mathematics/`.
