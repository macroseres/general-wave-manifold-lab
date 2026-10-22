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

## Flux atlas — definitions and evidence

| Object / invariant | Mathematical definition | Pure implementation | Regression evidence | Geometry / UI | Status |
|---|---|---|---|---|---|
| Scalar locus and homogenization of all ten coefficients | `01-flux.tex`; `../mathematics/27-atlas-parametros-variedade-ondas.md`, §§4–6,14 | `flux/scalarStratification.js`: `classifyScalarStratum` | `scalarStratification.test.js`: six ranks, centers, transport, small nonzero obstructions | planned; algebraic object precedes visualization | exact rational classification of supplied decimals; no wave completeness claim |
| Trace / binary cubic and canonical quadratic coefficients | `../mathematics/29-atlas-global-fluxos.md`, §§1–3,9 | `flux/scalarStratification.js`: `quadraticAtlasData`, `quadraticCoefficientsFromPair` | `globalFluxAtlas.test.js`: root strata and structural identities; `scripts/verify-global-flux-atlas.mjs`: stabilizer identities | planned; metadata precedes UI | exact input diagnostics; canonical continuous parameters may be approximate |
| Generic residual flux normal form | `../mathematics/28-forma-normal-generica.md`, §§2–5 | `flux/genericNormalForm.js` | `genericNormalForm.test.js`; `scripts/verify-generic-normal-form.mjs` | planned; no renderer dependency | numerical on the declared generic chart; exceptional/ill-conditioned inputs rejected |
| Global flux atlas and exceptional linear quotients | `01-flux.tex`; `../mathematics/29-atlas-global-fluxos.md`, §§2–8 | `flux/globalFluxAtlas.js`: `globalFluxAtlas` | `globalFluxAtlas.test.js`: coverage, reconstruction, affine transport, rank-one classes and scale/boundary regressions | planned; not integrated into parameter UI | algebraic coverage argument documented; numerical realization with unresolved axes explicitly inconclusive; not certified wave classification |

Verification on 21/10/2026: research definitions and proofs are the linked Markdown chapters 27–29, anchored to the ten-coefficient convention of `01-flux.tex`. These are separate from the 26 application documentation sections and are not yet included in the compiled canonical LaTeX. Inclusion in this matrix records provenance and evidence; it does not imply that this editorial integration or the parameter UI is finished.

The group transports both state endpoints with the same affine map and speeds by `s -> k*s-d`, with k positive. The atlas does not select entropy/viscous admissibility and does not establish global regularity or equivalence of wave foliations. Physical/three-space visualization is intentionally deferred; no Riemann solution is fabricated for a flux orbit.

Boundary correction: discrete rank-one quotients no longer use an absolute magnitude threshold to identify exact axes. A small nonzero coordinate relative to the quotient scale produces `ill-conditioned`, reason `residual-axis-unresolved`, without a residual class or normalized representative. Exactly zero coordinates in the computed gauge retain axis cases. Rounded transformations of exact boundary data may therefore be inconclusive. Tests require explicit inconclusiveness rather than silently accepting a different orbit label, and separately preserve the resolved discrete representatives.

Regression: the T1, b=1/2 example with linear coordinates (x,y)=(1,1e-10), previously labeled differently at scales 1 and 100, is now inconclusive at both scales. Tests cover positive scales from 1e-12 through 1e12, both coordinate axes, the b=-1 product quotient and the traceless triple-root quotient. This is a policy for the computed gauge, not a proof of floating-point invariance under arbitrarily ill-conditioned affine transformations.

## Maintenance rule

A scientific object is not complete until this matrix can identify its canonical definition, implementation and validation. Geometry/UI may be `planned` only when the mathematical object intentionally precedes visualization.

The compatibility facade `src/math/quadraticFlux.js` is not a canonical implementation location.

## Closure note — dev.18

The stale dev.13 debt markers for sonic meshing and finite-saddle separatrices are closed: dev.15 moved those responsibilities to `geometry/sonic/surface.js` and `math/rarefaction/finiteSeparatrices.js`. Dev.19 replaced the fixed-step rarefaction integrators with shared adaptive RK4 step-doubling and added bracketed scalar-event refinement plus convergence/error-control tests. Numerical policy remains serialized for reproducibility.

## dev.22 — State fibres and characteristic lifts

Historical snapshot: “not rendered yet” below describes dev.22. See the subsequent dev.24.19 table for implemented fibre geometry and characteristic-lift inspection.

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

## Current coverage beyond the historical closure tables

Numerical composite constructions now exist in `src/math/state/composite.js` and `compositeTrace.js`, with geometry in `src/geometry/composite/`. Riemann candidate chains and Liu diagnostics are implemented under `src/math/solution/`. The older “composite geometry deferred” entry describes the seed-stage snapshot, not current rendering availability. These additions still need a consolidated object-by-object traceability update; their presence is not a global validation claim.

All 26 application reference sections now use shared Markdown. DocumentationContent.jsx preserves titles and ordering but contains no duplicated scientific prose. The LaTeX canonical reference retains its own responsibility; format migration is not a claim of completed scientific or bibliographic validation. See [scientific objectives and documentation requirements](../OBJETIVOS_E_ESCOPO.md).

## Documentation audit — strict Lax boundary qualification

The strict signature equivalence in `11-hugoniot.tex` requires strictly hyperbolic endpoints and exclusion of every characteristic equality. Historical finding (corrected in the state-space implementation step below): `spectralCount` assigns counts to `on-slow-characteristic` and `on-fast-characteristic`, and `laxClass2x2` classifies those counts without a separate strictness gate. Thus the function alone may label a characteristic boundary as Lax. Repeated endpoint eigenvalues also require an explicit gate. The application reference now documents this limitation in `05-choques-hugoniot-lax.md`; the migration left the correction pending; the subsequent implementation below adds the strict gate and regression tests. The historical “validated” table entry does not certify these boundary cases.

The entropy chapter documents the mathematical condition; it does not imply that a general convex entropy-pair evaluator exists in the application. Current Liu assessment explicitly retains absence of detected violation as finite evidence, with `passes: false`.

## Documentation audit — sonic and coincidence qualifications

The application reference distinguishes full endpoint determinant zeros from reduced sonic sheets, following `05-sonic.tex` and `sonic.js`. The algebraic inflection condition `Y=K=0` agrees with loss of genuine nonlinearity at a simple selected eigenvalue; coincidence and regularity need separate analysis. The derivation is recorded in `16-inflexao-dupla-sonica.md`.

`commonIntersection.js` includes zero-jump points in its algebraic `onDS` flag and can report `J-and-DS`; `doubleSonicResidual` in `intersections.js` excludes `Y=0` for nontrivial double-sonic shocks. These conventions are now explicitly distinguished in the application reference. Likewise, an empty `coincidenceTauRoots` result may mean no isolated root rather than no coincidence; the identically zero case requires additional analysis. No numerical behavior was changed in documenting these qualifications.

## Documentation audit — rarefaction and composite tracing

`17-campo-rarefacao.md` qualifies projected tangency by the nonzero map determinant; a zero tangency residual alone does not certify a regular projected curve. `18-separatrizes.md` records the exact parameter factor `D(Psi) Vz = -z VZ`, already checked by `tests/rarefactionChartTime.test.js`, and distinguishes integration direction from physical solution orientation.

Historical finding (corrected by the composite-block implementation below): the reciprocal search in `compositeTrace.js` used `Z² Phi = Z PhiHat` and symmetric continuation near zero. This is equivalent as an exact zero condition only for nonzero Z, and its magnitude may collapse near zero independently of the canonical factor. A read-only reproduction with `oldWavePreset()` modified by `b20=0.3`, a characteristic seed `waveState(0.3,0,0.4,p)` and `compositeLeafIntersections` default options returned a reciprocal candidate near `Z=-5.79e-11`: the reported residual magnitude was approximately `2.43e-12`, while the direct boundary factor had magnitude approximately `32.59`. Both orientations exhibited the issue. The documentation migration left production unchanged; the subsequent composite-block implementation replaces this residual and adds regression tests.

`19-ondas-compostas.md` also records that `traceCompositeField.complete` means one selected candidate per input sample, with nearest-direction branch selection, not exhaustive branch coverage or entropy certification. The canonical definitions remain in `12-composite-waves.tex`.

## Documentation audit — chains and parameter classification

`20-cadeias-riemann.md` maps two-shock and mixed candidate assembly to `riemannWaveChains.js`, `mixedWaveChains.js` and `riemannSelfSimilarCandidate.js`. It distinguishes weak-solution hypotheses, an initial-trace argument for bounded finite-speed profiles, numerical interpolation and entropy evidence. The current mixed physical profile requires strict speed separation, so it does not by itself implement the sonic equal-speed joins allowed in the mathematical construction.

`21-transformacoes-afins.md` records the affine transport of Riemann data, projective directions and known entropy pairs. `transformQuadraticFlux` returns transformed quadratic coefficients and a separate constant; dropping that constant preserves the conservation law and RH differences. `22-classificacao-estados.md` distinguishes `classifyState` spectral labels from `classifyConic` zero-locus types and `sampleParameterDiagram` two-coefficient slices. Category names in the parameter diagram do not classify all states or all Riemann solutions of a flux.

## Completion of the application text migration

Sections 23–26 now document numerical reproducibility, audit assumptions, workspace responsibilities, source provenance and remaining work. The registry contains only ordered titles and Markdown imports; its complete set of 26 sections is loaded in the rendering test. Semantic grouping also covers conventions, procedures and audit criteria. Scientific calculations were preserved. Bibliographic consolidation and visual inspection remain pending; automated rendering does not establish either.

## Worked Hugoniot reference chapter

| Claim / artifact | Source or derivation | Implementation / evidence | Scope |
|---|---|---|---|
| Fixed-state Hugoniot lift | `BIBLIOGRAPHY.md`, WM-01 §2.2; P,Q,R derivation in chapter 11 | `state/fibers.js` | Explicit regular chart and denominators |
| Triangular flux, states (2,0) → (0,-1) | Exact example in `11-fibras-hugoniot.md` | `docs/examples/hugoniot-reference.json`, `tests/hugoniotReferenceExample.test.js` | Single weak Lax-2 shock of speed 1; no global entropy/uniqueness claim |
| Finite/reciprocal coordinates | (-1/8,-1,2) ↔ (-1/2,-2,1/2) | `waveState`, `stateFiberPointReciprocal`, `liftHugoniotSample` | Regular overlap, excludes Z=0 |
| Curve and figure | `scripts/hugoniot-reference.mjs`, `scripts/plot_hugoniot_reference.py` | Generated JSON report, SVG/PNG in `public/docs/` | 81 samples over 7/4 ≤ z ≤ 9/4; not complete fibre coverage |
| Displayed sources and figure | Same chapter Markdown used by Help and Documentation | `documentationRendering.test.js` | Safe HTTP links and local figure parsing; browser appearance remains pending |

## Worked rarefaction and two-shock chapters

`17-campo-rarefacao.md` derives the exact fast-family fan for the triangular flux, with states (0,-3/4) and (1,1/4), orbit `(tau,Y,z)=(3/8-alpha,0,1)` and physical fan `V(xi)=(xi,xi-3/4)` between speeds 0 and 1. `20-cadeias-riemann.md` derives the two-shock chain (2,1) → (2,0) → (0,-1), with speeds 1/2 and 1.

`docs/examples/wave-patterns-reference.json`, `scripts/wave-patterns-reference.mjs` and `tests/wavePatternsReference.test.js` connect the formulas to field/projection operations and the physical candidate evaluators. The tests also preserve the first shock's `degenerate-fiber` lift status: its finite-chart P,Q,R all vanish, but the raw RH differential has rank two. An alternative local parametrization is required to represent it; no correction of that production limitation is claimed. Figures show only the stated arcs/points, including an explicitly labelled intrinsic projection for the chain rather than a fabricated finite-chart lift.

## Closure of the remaining worked blocks

`advancedReference.test.js` and the advanced fixture/generator cover an exact degenerate sonic connection, its implicit composite ODE, an isolated B=I viscous profile, a reciprocal stable branch with eigenvalues -8 and 7, four numerical half-separatrices, four exact conic types and affine covariance. The composite case has zero endpoint sonic determinants and requires a representation beyond the current P,Q,R chart; the physical equal-speed join is not a claim of general solver coverage.

`DOCUMENTATION_COVERAGE.md` maps all 26 chapters to provenance, evidence and exclusions. `NOTACAO.md` consolidates symbol meanings; the application glossary now uses Delta for the spectral discriminant. Production equations and the known numerical limitations remain unchanged. Exported figures are inspected separately from the still-pending integrated browser visual verification.

## State-space implementation — strict configurations and RR

The historical Lax boundary finding is corrected: `state/shockConfiguration.js` requires ordered simple endpoint spectra and excludes sonic equalities within its declared tolerance. `laxClass2x2` consumes that gate rather than positional counts alone. Tests exercise the nine quadratic RH fixtures, sonic boundaries, repeated eigenvalues and near-boundary values. This remains a numerical endpoint classification, not a continuous entropy certificate.

`solution/rarefactionPairCandidates.js` adds sampled slow-forward / fast-backward RR intersections, oriented fan prefixes, tangent and speed checks, physical evaluation and candidate provenance. State and physical views share these candidates. Existing RS, SR and SS construction remains available. RR intersections have no joint ODE corrector yet; the search is explicitly limited to supplied traces. See ../STATE_SPACE_STATUS.md for pending contacts and general composite blocks.

## State-space implementation — constant-direction contact chains

`solution/contactChainCandidates.js` checks the common nullspace of the two state derivatives of the quadratic Jacobian, then the constant eigenpair of its linear part. It constructs RC/SC/CR/CS/CC only in this constant-direction contact model and keeps endpoint hyperbolicity, RH and speed-ordering checks. An affine RH determinant on the contact line supplies isolated SC/CS intermediate states without chart projections. RC/CR still rely on sampled characteristic intersections. The general curved linearly degenerate case is not claimed.

Physical geometry now distinguishes shock and contact interfaces, and profiles preserve both sets of one-sided traces. State-space geometry accepts explicit state anchors without a wave-manifold projection; no surrogate projection is fabricated. Tests include rendering a linear CC chain when the current wave-manifold point is degenerate. See traditional/CONTATOS_DIRECAO_CONSTANTE.md (under docs) for the coefficient-level deduction and limitations.

## State-space implementation — composite blocks and reciprocal correction

`solution/sonicPartners.js` solves the finite-amplitude quadratic RH equation at a prescribed characteristic speed through a homogeneous cubic direction equation and an independently checked amplitude. `compositeBlockChainCandidates.js` traces sampled slow R-S / fast S-R blocks and searches the seven pairs containing K. Candidate blocks retain every elementary segment, sonic junction and numerical scope. Positive quadratic cases cover RK/KR/SK/KS; CK/KC/KK remain without positive validated fixtures. Ordinary shocks use strict Lax endpoint checks and internal sonic shocks use qualified weak inequalities, without entropy certification.

`sonic/reciprocalSonic.js` evaluates the canonical nontrivial reciprocal factor directly. `compositeTrace.js` no longer uses the vanishing extra Z factor or symmetric continuation; bracket width alone no longer accepts a root. Regression tests reject the historical b20=0.3 boundary counterexample and verify PhiHat=Z Phi on overlap. This supersedes the historical reciprocal residual finding above.
