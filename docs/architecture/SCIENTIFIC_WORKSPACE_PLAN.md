# Scientific workspace — architecture decision (proposal, not implemented)

## Scientific goals

1. Classify the **general quadratic flux** by its coefficients, including the hyperbolic/parabolic/elliptic regions **in state space**.
2. Construct and test wave curves and admissibility criteria before claiming a Riemann solver.
3. Given left/right states, construct and inspect a Riemann solution when a validated solver exists.
4. Link the wave manifold 3D view, the (u,v) state-space view, and the self-similar x/t wave diagram.

## Panel map

- **Flux and classification:** ten quadratic coefficients (or actual coefficient count in kernel), selected presets, Jacobian, discriminant, parameter study; parameter stratification is a separate research problem.
- **Wave geometry:** charts, sampling, visible surfaces, rarefaction, separatrices, Hugoniot, composite curves and diagnostics.
- **Riemann problem:** U_L, U_R, wave sequence, admissibility, intermediate states, residuals; do not display an unimplemented solver as complete.
- **Experiments:** save/restore numerical settings, geometry visibility, chart, selected states, version, and solver output when supported.

Keep 3D and state space concurrently accessible, preferably synchronized; retain x/t as a third view. Present numerical diagnostics as an expandable inspector, not as the main research task.

## Classification is not a two-parameter claim

For a real 2x2 Jacobian A(U)=DF(U), let Delta(U)=(tr A)^2-4 det A. Delta>0 gives two distinct real characteristic speeds (strictly hyperbolic); Delta=0 gives a repeated real speed (parabolic/transition in the eigenvalue-discriminant sense, **not** automatically a parabolic PDE); Delta<0 gives a nonreal conjugate pair (elliptic in this local spectral classification). These are classifications at a state U, not a single unconditional label for the flux.

The previous restricted wave-manifold-app parameter reduction to b1,b2 must **not** be generalized to arbitrary quadratic fluxes without proving an equivalence under allowed changes of variables and checking how those transformations affect the Riemann problem. A parameter-space classification should distinguish structural invariants, normalization orbits, and numerical slices, and should track regions where Delta changes sign.

## Implementation milestones

A. Audit existing UI labels and align KaTeX only where mathematically meaningful; avoid changing Three.js labels blindly.
B. Implement pure state-space classification using the existing Jacobian and discriminant, with tests for all three signs and degeneracies.
C. Provide a parameter-slice explorer, explicitly marking it as a slice rather than a global classification.
D. Reorganize panel layout with 3D and state-space coordinated selections, without altering existing scientific kernels.
E. Implement the Riemann solver incrementally through definition -> pure code -> test -> numerics -> geometry -> renderer.

**Current status:** This document is a proposed product architecture. It does not claim that parameter classification or a complete Riemann solver has been implemented.
