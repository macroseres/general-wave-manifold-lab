# Hugoniot block verification — dev.24.19

This audit closes the fixed-state Hugoniot block before composite-wave saturation begins.

| Requirement | Evidence | Status |
|---|---|---|
| Generic fixed state has two inverse images | `state/fibers.js`, `state/stateRoles.js`; fixed-endpoint tests | **PASS** |
| Forward means `pi_-^{-1}`; backward means `pi_+^{-1}` | pure state-role helpers + regression tests | **PASS** |
| Full reciprocal transition includes jump coordinate `Upsilon=Y/Z` | `state/fibers.js`; overlap tests | **PASS** |
| Global fibre continuation does not fake a finite segment through infinity | `GLOBAL_HUGONIOT_CONTINUATION.md`, fibre geometry tests | **PASS** |
| Common characteristic intersections and finite `P_s`,`P_f` are verified | `fibreAnalysis.js`; characteristic-intersection tests | **PASS** |
| Regular branches are decomposed projectively | fibre-analysis branch tests | **PASS** |
| Spectra at `U_-`,`U_+` and characteristic boundaries are computed in math | `hugoniotSpectrum.js`, `hugoniotSpectralRegions.js` | **PASS** |
| Spectral signature `(n_-,n_+)` is explicit | `hugoniotSpectralRegions.js`; signature tests | **PASS** |
| Strict Lax 1/2 follows from signatures `(0,1)` / `(1,2)` | `laxClass2x2`; Lax tests | **PASS** |
| Renderer consumes classification; it does not define Lax | `geometry/state/hugoniotLaxGeometry.js`, architecture boundary | **PASS** |
| State-space view exposes `pi_-` / `pi_+` explicitly | `StateSpaceDialog.jsx`; projection regression | **PASS** |
| `U_*`, global `U_L,U_R`, and moving local `U_±(P)` have distinct roles | `stateRoles.js`, Help, canonical mathematics | **PASS** |
| Saturation formulas are seeded but composite geometry is not claimed | `saturation.js`; seed tests | **PASS / NEXT BLOCK** |
| Liu/general shock admissibility | intentionally not implemented | **DEFERRED** |
| General Riemann solver | intentionally not claimed | **DEFERRED** |

## Closure

The fixed-state Hugoniot block has no blocking FAIL.  Composite-wave development may start only through the established pipeline: definition → pure implementation → tests → numerics → geometry → visualization.  Liu admissibility and a general Riemann solver remain outside this closure.
