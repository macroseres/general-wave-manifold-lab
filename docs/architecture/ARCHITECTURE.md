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
- `manifold/` — Rankine–Hugoniot relations and wave-manifold objects.
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
