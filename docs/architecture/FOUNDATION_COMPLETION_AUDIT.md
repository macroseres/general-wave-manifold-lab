# v0.7.0 Foundation Completion Audit

> Historical snapshot. For the current pre-Hugoniot status, see `FOUNDATION_VERIFICATION.md`.
Audit baseline: `v0.7.0-dev.12`.

## Confirmed boundaries

- `src/math/` has no React, React Three Fiber, or Three.js dependency.
- `src/geometry/` has no React, React Three Fiber, or Three.js dependency.
- The reciprocal local-chart geometry and state-space geometry already follow the intended `math -> geometry -> UI` direction.
- Mathematical notation is centralized through `MathLabel` / `MathBlock` with KaTeX as a presentation engine; KaTeX does not own mathematical definitions.

These dependency rules are now protected by `tests/architecture.test.js`.

## Numerical debt found

Numerical policy is not yet centralized. Current examples include:

- root tolerances in `math/numerics/polynomialRoots.js`;
- regularity tolerances in chart, sonic and characteristic modules;
- adaptive RK4 parameters are centralized in `math/numerics/policy.js`; rarefaction modules consume the shared adaptive integrator;
- finite-difference steps and classification tolerances in `math/rarefaction/singularities.js`;
- renderer-side thresholds in `Scene.jsx`.

This is the target of `v0.7.0-dev.14`. The goal is not one universal epsilon; it is named numerical policies with explicit ownership and scale-aware criteria.

## Geometry / renderer debt found

`src/components/Scene.jsx` still does more than rendering:

1. it samples and triangulates the nontrivial sonic sheets, including pole-avoidance heuristics;
2. it contains a second RK4 integration path for finite rarefaction separatrices;
3. it owns several clipping, proximity and display thresholds.

The second item is the most important architectural violation because a React/Three component is integrating a mathematical vector field. It must move downstream of the validated math/numerics layer. Sonic mesh construction belongs in `src/geometry/sonic/`.

`LocalChartDialog.jsx` also requests mathematical separatrices directly before passing them to the geometry adapter. This is less severe, but the final UI boundary should preferably receive already prepared geometry from a controller/hook rather than orchestrate mathematics itself.

These items are targets of `v0.7.0-dev.15`, after numerical policy is stabilized in dev.14.

## UI foundation status

Implemented: shared design tokens, scientific dialogs, KaTeX mathematical typography, state-space and local-chart views, responsive work on the dialogs.

Still open: complete token adoption, coherent light/dark theme policy, systematic tooltips/interaction states, and a final responsive/accessibility pass. These remain for the final Foundation UI audit rather than being mixed into numerical refactoring.

## Reproducibility status

Experiment serialization is not implemented. The planned reproducible state must include at least:

- schema version and application version;
- ten flux coefficients;
- mathematical domain;
- active chart and chart-specific settings;
- numerical settings;
- visible mathematical objects;
- visual scales/view settings that affect a published figure.

This is a separate Foundation milestone. A saved experiment must describe scientific state, not transient React component state.

## Decision

Do not start Hugoniot yet. Complete numerical ownership, geometry/renderer separation, reproducible experiment state, and the final UI/Foundation audit first. Hugoniot will then use the same traceability pipeline without creating new architectural exceptions.
