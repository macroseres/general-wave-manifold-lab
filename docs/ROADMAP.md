# Roadmap

## v0.6.0 — Foundation

- Repository hygiene and GitHub CI.
- Scientific architecture and numerical conventions.
- Decomposition of the original mathematical core into domain modules.
- Compatibility facade for the pre-refactor API.
- LaTeX reference structure and ADR workflow.
- Scientific design tokens without changing current behavior.
- Preserve the existing mathematical regression suite.

## v0.6.x — Foundation maintenance

- Fix regressions only; avoid adding new mathematical scope.
- Complete formula-by-formula verification of the legacy mathematical notes before declaring the LaTeX reference authoritative.
- Consolidate named numerical tolerances where this can be done without changing results.

## v0.7.x — Mathematical core

- Formalize the public flux/model interface beyond the current quadratic preset.
- Expand invariant/residual tests for the general quadratic flux.
- Make chart-transition conventions and the meaning of the current `tau` coordinate explicit in the mathematical reference.
- Retire compatibility-facade imports from new code; keep the facade only for migration until removal is explicitly versioned.

## v0.8.x — Geometry and local analysis

- Introduce `src/geometry` and separate sampling/meshing from equations.
- Strengthen local-chart inspection, singularity classification and separatrix validation.
- Prepare compactification/blow-up infrastructure.
- Add reproducible experiment/state export.

## v0.9.x — Wave constructions

- Hugoniot families and projections.
- Composite-wave constructions.
- Additional sonic/hysteresis/Hopf objects only after their definitions are documented and tested.

## v1.0.0

Stable mathematical conventions, reproducible experiments, documented architecture, validated core objects and a stable research workflow.
