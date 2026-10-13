# Sonic performance stages (dev.24.47.37)

Run `npm run profile:sonics` to measure the baseline and `npm run profile:sonics -- --no-audit` to measure the same extraction without recording/comparing shared tetrahedral faces.

`timings` are instrumentation, not separate non-overlapping totals: `meshMs` includes `rootMs` and `faceRecordingMs`. `meshOtherMs` subtracts these from `meshMs`. `faceComparisonMs` measures final comparison; `residualMs` includes vertex residual checks and DS vertex insertion. `baseMs` measures the initial sonic scalar grid. All durations are approximate wall-clock measurements.

The `diagnostics` option defaults to `true` to preserve previous behavior and return fields. `--no-audit` only changes the standalone benchmark invocation; it does not change the app's normal geometry generation. Compare triangle/vertex/index counts and residuals before changing the production default.
