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

### v0.7.0-dev.9 — State space

- [x] Implement canonical `pi_-` and `pi_+` projection functions.
- [x] Add a dedicated `(u,v)` view for the selected point `P` of the wave manifold.
- [x] Keep state-space rendering downstream of math and geometry adapters.
- [x] Document that complete wave curves will be projected from validated wave objects, not recomputed by the view.
- [ ] Add complete rarefaction/Hugoniot/composite curves when their reusable mathematical representations are available.

### v0.7.0-dev.8 — Rarefaction visualization

- Close the rarefaction block visually without changing its validated mathematics.
- Show all four infinity half-separatrices in the reciprocal local chart with physical-time orientation and branch identity.
- Keep projective-boundary branches out of the finite chart when no finite representative exists.
- Keep visualization components downstream of math and geometry adapters.

### v0.7.0-dev.7 — Documentation continuity and solution spaces
- [x] Distinguish wave manifold `W`, state space `(u,v)`, and physical space `(x,t)`.
- [x] Document `pi_-`, `pi_+`, and the future solution map `U(x,t)`.
- [x] Start an incremental user-manual source alongside the mathematical and technical documentation.
- [ ] Implement the dedicated state-space view only after its mathematical/geometry interface is specified and tested.
- [ ] Implement physical-space Riemann solutions only after the required wave constructions are validated.

## v0.8.x — Geometry and local analysis

- Introduce `src/geometry` and separate sampling/meshing from equations.
- Strengthen local-chart inspection, singularity classification and separatrix validation.
- Prepare compactification/blow-up infrastructure.
- Add reproducible experiment/state export.

## v0.9.x — Wave constructions

- Hugoniot families and projections.
  - [x] Fixed-state forward/backward fibres and global chart continuation.
  - [x] Spectral regions, signatures and strict Lax classification.
  - [x] Lax-class geometry in the wave-manifold view.
  - [x] Project the same classified Hugoniot segments to state space with explicit `pi_-` / `pi_+` choice.
  - [x] Close the Hugoniot block before starting composite-wave saturation (dev.24.19).
- Composite-wave constructions.
  - [x] Fix canonical forward/backward saturation definitions and the constructions `K_- = sat_forw(R) ∩ S^-`, `K_+ = sat_back(R) ∩ S^+` (dev.24.20).
  - [ ] Build numerical saturation leaves independently of rendering.
  - [ ] Continue the sonic intersections as composite curves and validate branch selection.
  - [ ] Project validated composite curves to state/physical views only after mathematical closure.
- Additional sonic/hysteresis/Hopf objects only after their definitions are documented and tested.

## v1.0.0

Stable mathematical conventions, reproducible experiments, documented architecture, validated core objects and a stable research workflow.

### v0.7.0-dev.6 — Local chart and geometry
- [x] Introduce a geometry layer independent of React/Three.js.
- [x] Inspect the infinity saddle directly in `(eta,Z)`.
- [x] Preserve all four local half-separatrices without fake finite-chart projection.

### v0.7.0-dev.10 — Rarefaction in state space
- [x] Reuse one mathematical representation of generic rarefaction orbits in both global and state-space views.
- [x] Project rarefaction orbits from `C` to `(u,v)` rather than reintegrating them.
- [x] Preserve the spectral slow/fast classification as `R_s` and `R_f` segments.
- [x] Test projected tangency to the selected characteristic eigendirection.

### v0.7.0-dev.11 — State-space and notation polish
- [x] Preserve a single rarefaction orbit through `E` while changing slow/fast segment classification.
- [x] Refine coincidence crossings numerically and share the event point between adjacent segments.
- [x] Enforce a square 1:1 `(u,v)` plotting region and distinguish slow/fast by line style as well as color.
- [x] Introduce reusable mathematical-label/block UI primitives.
- [x] Synchronize Help with canonical `C`/`E` notation and current general-flux derivations.

- [x] Renderização matemática real via KaTeX e polimento final da vista de estados (dev.12).

### v0.7.0-dev.13 — Scientific traceability
- [x] Map canonical definitions to implementation, tests, geometry and UI.
- [x] Protect math/geometry dependency boundaries with executable architecture tests.
- [x] Audit numerical constants/integrators and renderer-side scientific work.
- [x] Record remaining Foundation work explicitly before Hugoniot.

### Foundation completion sequence
- [x] dev.14 — numerical policy and integration ownership.
- [x] dev.15 — geometry/renderer boundary, including sonic meshes and finite separatrices.
- [x] dev.16 — reproducible experiment serialization/import.
- [x] dev.17 — final scientific UI/Foundation audit.
- [x] dev.18 — canonical mathematics closure and traceability refresh.
- [x] dev.19 — adaptive numerics with error control, events and convergence tests.
- [x] dev.20 — synchronized three-space solution framework `W <-> U <-> X`.
- [x] dev.21 — final Foundation Verification with explicit PASS/DEFERRED/FAIL audit.
- [x] dev.22 — state fibres and characteristic lifts, including the full reciprocal jump-coordinate transition.
- [ ] dev.23 — multi-space solution model as unions of validated wave segments; no general Riemann solver claim.
- [x] Hugoniot block subsequently implemented and formally closed in dev.24.19; see `HUGONIOT_VERIFICATION.md`.

### Foundation Completion — dev.15
- [x] Move finite-saddle separatrix integration out of `Scene.jsx`.
- [x] Move sonic-sheet sampling/clipping/triangulation to `geometry/`.
- [x] Add renderer-boundary regression guard.
- [x] dev.16: reproducible experiment schema and import/export.

### v0.7.0-dev.20 — Three-space solution framework
- [x] Make `W`, state space `U`, and physical space `X=(x,t)` executable views of shared mathematical data.
- [x] Build physical rarefaction fans from already-computed characteristic orbits; do not integrate a second physical-space ODE.
- [x] Require monotone characteristic speed before admitting a rarefaction orbit as a self-similar physical fan.
- [x] Add reverse selection from a physical ray to its wave-manifold coordinate.
- [x] Keep a general Riemann solver explicitly out of scope until Hugoniot/composite waves are validated.

### v0.7.0-dev.23 — State Fibre Visualization
Status: implemented; local user validation pending.

- Render `pi_-^{-1}(U*)` and `pi_+^{-1}(U*)` in the wave-manifold view from a state `U*` fixed in state space.
- Mark finite characteristic lifts and their slow/fast/coincidence classification.
- Keep fibre mathematics in `src/math/state/fibers.js`, sampling/display geometry in `src/geometry/state/fibreGeometry.js`, and Three.js restricted to rendering.
- This increment does not introduce Hugoniot loci or a Riemann solver.

### dev.24.21 — Numerical composite trace
Finite-chart leaf/sonic intersections and branch continuation are implemented in the mathematical layer. Reciprocal-chart continuation, exceptional sonic cases, geometry and rendering remain subsequent steps.


- [x] dev.24.22: projective continuation of composite traces through the reciprocal chart, without fake finite infinity points.
