# dev.24.47.46 — Sonic area filter comparison

Run `npm run audit:sonics:area-filter` to compare the default absolute cross-product threshold `1e-10`, experimental `1e-14`, and exact-zero-only filtering. The audit reports global edge incidence, boundary loops and branches, connected triangle components, and the local completeness counts for the four cells adjacent to P. It also evaluates implicit residuals and first-order Newton distance estimates at triangle centroids.

The production path remains identical because `minCrossNorm` defaults to `1e-10`. This comparison does not change the Worker, rendering, or implicit equations. A lower threshold may preserve sliver triangles; it is not by itself a safe production fix. The distance estimate is not a certified geometric error bound.
