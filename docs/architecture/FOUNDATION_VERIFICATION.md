# v0.7.0-dev.21 — Foundation Verification

Audit baseline: locally validated `v0.7.0-dev.20`, including the lint cleanup reported after dev.20.

This document verifies the seven pre-Hugoniot foundation commitments. `PASS` means the requirement is implemented with evidence in the repository. `DEFERRED` means a non-blocking presentation or future-scope item is explicitly postponed. `FAIL` would block closure. **No blocking FAIL remains.**

| # | Foundation commitment | Evidence | Verification | Status |
|---|---|---|---|---|
| 1 | Open `v0.7.0` cycle; versioning, CHANGELOG/ROADMAP; preserve `v0.6.0` | `package.json`, `docs/CHANGELOG.md`, `docs/ROADMAP.md`; historical `v0.6.0` release is not rewritten by this tree | version/document guard tests + release workflow | **PASS** |
| 2 | Canonical LaTeX mathematics: general flux, `W`, RH, `(tau,Y,z)`, reciprocal chart, `C`, `E`, `S^±`, rarefaction | `docs/mathematics/01`–`09`; closure in `08-canonical-status.tex` | canonical-reference guard + scientific regression tests | **PASS** |
| 3 | Mathematics ↔ code ↔ tests traceability | `docs/architecture/TRACEABILITY.md` | traceability guard; every current pre-Hugoniot scientific object has an implementation/test owner | **PASS** |
| 4 | Numerical layer: tolerances, roots/equilibria, adaptive integration, events/continuation criteria, stopping rules | `src/math/numerics/{policy,integration,polynomialRoots}.js`, rarefaction modules | error-control, rejection, convergence, event and orbit tests | **PASS** |
| 5 | Geometry separated from Three.js/rendering | `src/geometry/`; finite separatrices in `src/math/`; sonic meshing in `src/geometry/sonic/` | architecture dependency guards + renderer-boundary guard | **PASS** |
| 6 | Scientific UI foundation: tokens, math typography, interaction states, responsive behavior, light/dark | `tokens.css`, KaTeX `MathLabel/MathBlock`, dialogs/styles/theme handling | lint/build + UI architecture audit | **PASS**, with exhaustive per-control scientific tooltips **DEFERRED** until each new object supplies its canonical tooltip text |
| 7 | Reproducible experiments | `src/experiment/schema.js`, schema v2, v1→v2 migration, numerical-policy snapshot, import/export UI | round-trip/migration/validation tests | **PASS**, camera pose persistence **DEFERRED** because it is renderer-owned and not scientific state |

## Three-space extension completed before closure

The additional pre-Hugoniot requirement introduced during the foundation cycle is also implemented:

\[
\mathcal W\longrightarrow\mathcal U\longrightarrow\mathcal X.
\]

`src/math/solution/rarefactionSolution.js` and `src/geometry/physical/rarefactionFan.js` realize already validated regular rarefaction orbits in physical space. The implementation requires monotone characteristic speed and does **not** claim a general Riemann solver. This is documented in `docs/mathematics/09-three-spaces.tex` and the user manual.

## Deferred items are not hidden failures

Two presentation-level items remain intentionally deferred: persistence of the Three.js camera pose and exhaustive object-specific tooltips. Neither changes the mathematical/numerical experiment, the dependency boundaries, or the validated three-space rarefaction construction. They must not be silently promoted to scientific requirements later; if a publication workflow requires exact camera reproduction, the experiment presentation schema must be extended explicitly.

## Closure decision

The pre-Hugoniot foundation has **no blocking FAIL**. The next scientific object may enter through the established pipeline:

\[
\boxed{\text{definition}\to\text{pure implementation}\to\text{test}\to\text{numerics}\to\text{geometry}\to\text{visualization}}.
\]

This verification authorizes starting the Hugoniot block only after the repository passes `npm run check` on the validated development environment.
