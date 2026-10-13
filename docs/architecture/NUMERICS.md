# Numerical conventions

This document records numerical algorithms, tolerances, event refinement and stopping criteria used by the scientific core.

## Canonical ownership

Scientific numerical defaults live in `src/math/numerics/policy.js`. Shared integration/event primitives live in `src/math/numerics/integration.js`. Domain modules may expose overrides, but UI/rendering code must not invent scientific tolerances.

There is deliberately **no universal epsilon**. Algebraic regularity, chart regularity, spectral coincidence, sonic degeneracy, equilibrium classification, finite-difference steps, ODE error control and event tolerances have different meanings and therefore distinct controls.

## Adaptive integration

As of dev.19, rarefaction orbits and finite/infinite separatrices use adaptive classical RK4 with step doubling. For a trial step `h`, the integrator compares one full RK4 step with two half steps. The local error estimate is

`err = ||y_(h/2,h/2) - y_h|| / 15`.

A step is accepted when

`err <= atol + rtol * max(||y_n||, ||y_(n+1)||)`.

Rejected steps are reduced and retried. Accepted steps return a suggested next step. Domain modules retain an explicit maximum step so adaptive stepping cannot silently reduce geometric sampling quality relative to the previously validated fixed-step curves. Minimum step, rejection limit and safety factor are canonical numerical-policy values.

The accepted state is the two-half-step RK4 state. We deliberately do not apply a Richardson correction: this keeps the propagated method behavior simple while using step doubling strictly as an error controller.

## Events and roots

`locateBracketedEvent()` is the shared scalar-event refinement primitive. It requires an already bracketed sign change and refines it by bisection/interpolation without starting a second ODE integration. The rarefaction coincidence transition uses this primitive for the spectral gap `s - lambda_other = 0`.

Polynomial roots remain owned by `polynomialRoots.js`; equilibrium detection and analytic residual checks remain in their domain modules. Event localization and algebraic root solving are intentionally distinct numerical tasks.

## Failure and stopping semantics

Integration stops on invalid field evaluation, declared chart/domain boundary, maximum accepted-step count, stagnation, or inability to satisfy error control above the minimum step/rejection policy. Separatrix-specific saddle-hit and return criteria remain named domain controls. A failure is reported/handled explicitly; the integrator does not manufacture a point.

## Verification

The numerical test suite includes: forced rejection of an oversized trial step; convergence on the harmonic oscillator; improvement under tighter tolerances; preservation of the established rarefaction projection/tangent tests; infinity-separatrix topology; and finite-saddle separatrix generation.

## Reproducibility

`numericalPolicySnapshot()` serializes the canonical defaults, including adaptive absolute/relative tolerances, minimum step, rejection limit and safety factor. Experiment files therefore record the numerical policy against which they were created; policy mismatches are surfaced rather than silently treated as identical experiments.
