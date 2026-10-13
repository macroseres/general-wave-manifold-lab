# Architecture

## Principle

The application is scientific software. Mathematical definitions must not depend on React, Three.js, or UI state.

The dependency direction is:

**mathematics → numerics → geometry → visualization → UI**

Dependencies in the opposite direction are not allowed.

## Layers

### `src/math`
Pure mathematical definitions and operations. No React or Three.js imports.

Target modules as the project grows:

- `flux/` — flux functions, Jacobians and parameter presets.
- `manifold/` — Rankine–Hugoniot relations and wave-manifold state.
- `characteristic/` — objects contained in the characteristic surface `C`, including the coincidence locus `E`.
- `charts/` — projective/local coordinate charts and chart transitions.
- `sonic/` — sonic loci and related conditions.
- `rarefaction/` — rarefaction fields, singularities and separatrices.
- `numerics/` — integration, root finding and linear algebra used by the mathematical layer.

### `src/geometry`
Sampling, meshes, curve discretization and transformations needed to display mathematical objects.

### `src/components/scene`
Three.js / React Three Fiber rendering only. It consumes mathematical/geometry results; it does not define them.

### `src/components/panels` and `src/components/ui`
Interaction, controls and presentation.

### `src/styles`
Design tokens and shared visual rules.

## Scientific invariant

Every new mathematical object should have, whenever possible:

1. a definition in the mathematical documentation;
2. a pure implementation;
3. a residual, identity, invariant, or benchmark that can be tested;
4. only then, a numerical/visual representation.

## Refactoring rule

Architectural refactors must preserve existing mathematical tests. A renderer change must not be used to conceal a mathematical regression.

## Geometry layer
Rendering must not consume mathematical state by inventing chart values. Pure adapters under `src/geometry/` convert already-computed mathematical objects into drawable, chart-specific geometry. React/Three/SVG components consume that geometry only. In particular, the reciprocal local chart keeps `(eta,Z)` as its native coordinates and never maps `Z=0` to fake finite `z` or `zc` values.

## Mathematical spaces and solution layer

The architecture distinguishes three spaces:

- `W`: wave manifold, carrying wave data such as `U_-`, `U_+`, and `s`;
- `U ≃ R²_(u,v)`: state space;
- `X`: physical `(x,t)` space.

The canonical state projections are `pi_-(P)=U_-` and `pi_+(P)=U_+`. A physical solution is a map `U: X -> U`, `(x,t) -> (u(x,t),v(x,t))`.

Current and planned ownership:

```text
src/math/state/       state-space operations and projections
src/math/solution/     validated physical realizations (currently rarefaction fans)
src/math/riemann/      future assembly of wave families into general Riemann solutions
src/geometry/state/   drawable geometry in the (u,v) plane
src/geometry/physical/ drawable geometry in the (x,t) plane
```

The state and physical geometry directories are implemented. A general `math/riemann/` solver remains future work. Physical-space visualization consumes validated solution data from `math/solution/`; React/Three.js must not reconstruct PDE solutions.

## Documentation lifecycle

Scientific features are documented incrementally. `docs/mathematics/` is the canonical formula-level reference under verification; `docs/architecture/` records implementation ownership and numerical boundaries; `docs/user-manual/` records user-facing meaning and operation. Planned functionality must be labeled as planned rather than described as already available.


### Rarefaction visualization boundary

`math/rarefaction/separatrices.js` owns orbit integration and dynamical metadata. `geometry/rarefaction/localChart.js` clips those orbits to a drawable reciprocal-chart window and derives display orientation from `timeDirection`. React/SVG components consume that geometry; they must not reintegrate or alter the rarefaction field.

## State-space projection boundary (v0.7.0-dev.9)

State-space inspection follows the same dependency direction as the rarefaction local chart:

`math/state/projections.js` -> `geometry/state/stateSpace.js` -> `components/StateSpaceDialog.jsx`.

The math module owns the canonical maps `pi_-` and `pi_+`; the geometry module owns bounds and display coordinates; React only renders. Complete wave curves in `(u,v)` must later be projections of reusable validated wave objects rather than independent integrations embedded in the view.

## State-space wave curves

State-space views consume validated wave objects.  Generic rarefaction
orbits are integrated once in `src/math/rarefaction/orbits.js`; their
state-space representation is the canonical projection `Ubar(tau,z)` on
`C`.  React/Three.js must not maintain an independent rarefaction integrator.

## Rarefaction branch events

Slow/fast is segment metadata, not an identity of an entire integral orbit. The
math layer integrates one orbit and detects/refines crossings of the
coincidence locus `E` from the signed spectral gap. Geometry/UI may style the
adjacent segments differently, but must preserve the same `orbitId` and the
same refined transition point. React must not reintegrate or reconnect these
segments heuristically.

## Mathematical UI notation

Reusable `MathLabel` and `MathBlock` components centralize mathematical
presentation in the UI. They are presentation primitives only: canonical
formulas remain in `docs/mathematics/`, and no mathematical computation is
allowed in these components.

## Traceability gate (v0.7.0-dev.13)

`docs/architecture/TRACEABILITY.md` is the maintained index from canonical mathematics to implementation, tests, geometry and UI. `tests/architecture.test.js` makes the most important dependency boundary executable: neither `src/math` nor `src/geometry` may import React, React Three Fiber, or Three.js.

Known violations *inside the renderer* are documented in `FOUNDATION_COMPLETION_AUDIT.md` rather than normalized as architecture. In particular, finite rarefaction-separatrix integration and sonic-sheet meshing currently present in `Scene.jsx` are migration targets, not approved ownership.

### Renderer boundary (dev.15)
`src/components/Scene.jsx` may own camera, lights, materials, interaction and Three.js buffers. ODE integration belongs to `src/math/`; sampling/triangulation of already-defined mathematical objects belongs to `src/geometry/`. Finite rarefaction separatrices and sonic-sheet triangulation now obey this boundary.
