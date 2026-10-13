# v0.6.0 Foundation audit

> Historical snapshot. For the current pre-Hugoniot status, see `FOUNDATION_VERIFICATION.md`.
Date: 2026-10-07

## Result
The Foundation refactor is structurally complete. The original `src/math/quadraticFlux.js` is now a compatibility facade and the mathematical implementation is split into domain modules.

## Verified structure
- `flux/`: quadratic flux, Jacobian, presets.
- `charts/`: finite `z` chart and complementary `Z=1/z` chart.
- `manifold/`: wave state, Rankine–Hugoniot/eigenvector residuals, coincidence locus.
- `sonic/`: sonic data, implicit conditions, residuals.
- `rarefaction/`: vector fields, singularities, separatrices.
- `numerics/`: polynomial-root helpers.

The mathematical modules contain no React or Three.js imports. Existing application imports remain valid through the compatibility facade.

## Regression status
The mathematical test suite contains 17 tests. All 17 pass in the audit environment. The user's Windows baseline also passed `npm run check` immediately before this audit.

## Portability
The complementary chart module is named `reciprocalChart.js`, not `ZChart.js`, to avoid a case-only filename collision with `zChart.js` on Windows. This rule is recorded in ADR-003.

## Documentation findings addressed
- Consolidated the duplicated/inconsistent v0.6.0 changelog entries.
- Updated the roadmap so v0.7.x no longer lists decomposition work already completed in v0.6.0.
- Clarified that the LaTeX reference is still under formula-by-formula verification and is not yet authoritative.
- Added a reusable release checklist.

## Deliberately deferred
These are not blockers for v0.6.0 and should not be mixed into the Foundation release:
- formula-by-formula migration from `docs/MATHEMATICS.md` to LaTeX;
- consolidation of numerical tolerances into named policies/constants;
- creation of the `src/geometry` layer when geometry extraction begins;
- migration of application imports away from the compatibility facade;
- broader formatting/style cleanup of legacy React source;
- adoption of the scientific design tokens in the UI.

No mathematical formula or numerical algorithm was intentionally changed during this audit.
