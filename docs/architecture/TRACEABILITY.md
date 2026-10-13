# Scientific traceability matrix

This is the canonical index between the mathematical reference, pure implementation, regression evidence, geometry adapters and user-visible representation. It is maintained during development rather than reconstructed at release time.

| Object / invariant | Canonical mathematics | Pure implementation | Regression evidence | Geometry / UI | Status |
|---|---|---|---|---|---|
| General quadratic flux `F=(f,g)`, `DF` | `01-flux.tex` | `src/math/flux/quadraticFlux.js`: `flux`, `jacobian` | flux/Jacobian, RH and eigenvector tests | coefficient controls | **validated** |
| Wave state, `U_-`, `U_+`, `s`, RH residual | `02-wave-manifold.tex` | `src/math/manifold/waveState.js`: `waveState`, `rhResidual`, `eigenResidual` | RH/eigenvector residual tests | inspection/global scene | **validated** |
| Finite chart `(tau,Y,z)` and `r(z)` | `02-wave-manifold.tex`, `03-charts.tex` | `src/math/charts/zChart.js`: `zChartCoefficients`, `fiber` | fiber/chart and eigenvector tests | global scene | **validated** |
| Reciprocal chart `(eta,Y,Z)` | `03-charts.tex` | `src/math/charts/reciprocalChart.js`: `ZChartCoefficients`, `fiberZ` | homogenization and overlap tests | reciprocal local chart | **validated** |
| Visual compactification `zc` | `03-charts.tex` | `zChart.js`: `zcFromZ`, `zFromZc` | chart round-trip tests | renderer coordinate only | **validated** |
| Characteristic `C={Y=0}` | `04-characteristic.tex` | `waveState.js`, `characteristic/spectrum.js` | characteristic/projection tests | global + state-space views | **validated** |
| Coincidence `E subset C` | `04-characteristic.tex` | `characteristic/coincidence.js`, `spectrum.js` | discriminant and refined crossing tests | transition marker | **validated** |
| Sonic sheets `S^-`, `S^+` | `05-sonic.tex` | `src/math/sonic/sonic.js` | factorization/determinant/residual tests | `geometry/sonic/surface.js` -> scene | **validated** |
| Rarefaction field | `06-rarefaction.tex` | `src/math/rarefaction/field.js` | determinant identity/tangency tests | downstream curves | **validated** |
| Generic rarefaction orbits | `06-rarefaction.tex` | `src/math/rarefaction/orbits.js` | orbit/projection/event tests | global + state-space views | **validated with adaptive RK4 (dev.19)** |
| Slow/fast segmentation through `E` | `06-rarefaction.tex` | `orbits.js`, `spectrum.js` | shared refined event and `orbitId` tests | solid/dashed segments | **validated** |
| Finite singularities | `06-rarefaction.tex` | `src/math/rarefaction/singularities.js` | field-zero/classification tests | global scene | **validated** |
| Finite saddle separatrices | `06-rarefaction.tex` | `src/math/rarefaction/finiteSeparatrices.js` | separatrix/renderer-boundary tests | scene consumes polylines | **validated with adaptive RK4 (dev.19)** |
| Infinity saddle | `03-charts.tex`, `06-rarefaction.tex` | `singularities.js`: `infinityRarefactionLinearData` | analytic reciprocal-saddle tests | reciprocal local chart | **validated** |
| Four infinity half-separatrices | `06-rarefaction.tex` | `src/math/rarefaction/separatrices.js` | branch/boundary/transition tests | `geometry/rarefaction/localChart.js` | **validated with adaptive RK4 (dev.19)** |
| State projections `pi_-`, `pi_+` | `07-state-and-physical-spaces.tex` | `src/math/state/projections.js` | projection/coincidence tests | `geometry/state/stateSpace.js` | **validated** |
| Rarefaction in `(u,v)` | `06-rarefaction.tex`, `07-state-and-physical-spaces.tex` | `orbits.js`, `projections.js` | projected tangent/eigenvector tests | state-space dialog | **validated** |
| Physical rarefaction realization in `(x,t)` | `07-state-and-physical-spaces.tex`, `09-three-spaces.tex` | `src/math/solution/rarefactionSolution.js` | monotonicity/admissibility and three-space tests | `geometry/physical/rarefactionFan.js` -> `PhysicalSpaceDialog.jsx` | **validated for regular rarefaction fans (dev.20); general Riemann solver not claimed** |
| Numerical policy | technical: `docs/architecture/NUMERICS.md` | `src/math/numerics/policy.js`, `integration.js`, `polynomialRoots.js` | policy/serialization tests | not a renderer concern | **centralized; adaptive RK4 + event refinement implemented in dev.19** |
| Reproducible experiment schema | `docs/architecture/REPRODUCIBILITY.md` | `src/experiment/schema.js` | round-trip, migration, validation tests | import/export UI | **validated (schema v2)** |

## Maintenance rule

A scientific object is not complete until this matrix can identify its canonical definition, implementation and validation. Geometry/UI may be `planned` only when the mathematical object intentionally precedes visualization.

The compatibility facade `src/math/quadraticFlux.js` is not a canonical implementation location.

## Closure note — dev.18

The stale dev.13 debt markers for sonic meshing and finite-saddle separatrices are closed: dev.15 moved those responsibilities to `geometry/sonic/surface.js` and `math/rarefaction/finiteSeparatrices.js`. Dev.19 replaced the fixed-step rarefaction integrators with shared adaptive RK4 step-doubling and added bracketed scalar-event refinement plus convergence/error-control tests. Numerical policy remains serialized for reproducibility.

## dev.22 — State fibres and characteristic lifts

| Definition | Canonical reference | Pure implementation | Regression evidence | UI status |
|---|---|---|---|---|
| Projection fibres `pi_±^{-1}(U*)` | `10-state-fibers.tex` | `src/math/state/fibers.js`: `stateFiberPoint` | fixed-endpoint recovery | not rendered yet |
| Full reciprocal transition `(eta,Upsilon,Z)` | `03-charts.tex`, `10-state-fibers.tex` | `stateFiberPointReciprocal` | finite/reciprocal overlap | not rendered yet |
| Characteristic lifts of `U*` | `10-state-fibers.tex` | `characteristicLiftPolynomial`, `characteristicLifts` | `Y=0` fibre intersections + `Z=0` lift | not rendered yet |

The dev.22 layer deliberately stops before Hugoniot, admissibility, or a general Riemann solver. A fixed state is kept in `U`; its inverse images and characteristic lifts are objects in `W`.

## dev.24.19 — Hugoniot closure

| Definition | Canonical reference | Pure implementation | Regression evidence | Geometry / UI | Status |
|---|---|---|---|---|---|
| `H^{forw}(U*)=pi_-^{-1}(U*)`, `H^{back}(U*)=pi_+^{-1}(U*)` | `11-hugoniot.tex` | `state/fibers.js`, `state/stateRoles.js` | fixed-endpoint and state-role tests | fibre geometry / scene | **validated** |
| Global reciprocal Hugoniot continuation | `11-hugoniot.tex` | `state/fibers.js`, `fibreAnalysis.js` | chart-overlap / continuation tests | global scene | **validated** |
| Characteristic lifts `P_s`,`P_f` | `11-hugoniot.tex` | `fibreAnalysis.js` | common-intersection tests | analysis panel | **validated** |
| Spectral regions and signature `(n_-,n_+)` | `11-hugoniot.tex` | `hugoniotSpectrum.js`, `hugoniotSpectralRegions.js` | spectral-boundary/signature tests | spectral-region dialog | **validated** |
| Strict Lax 1/2 classification | `11-hugoniot.tex` | `hugoniotSpectralRegions.js`: `laxClass2x2` | Lax tests | `hugoniotLaxGeometry.js` -> scene | **validated; Liu not claimed** |
| Explicit state-space `pi_-` / `pi_+` projection | `11-hugoniot.tex` | `state/projections.js` + validated Hugoniot segments | projection regression | `StateSpaceDialog.jsx` | **validated** |
| State roles and saturation seeds | `11-hugoniot.tex` | `stateRoles.js`, `saturation.js` | role/seed tests | Help only; composite geometry deferred | **foundation for next block** |

See `HUGONIOT_VERIFICATION.md` for the closure audit.
