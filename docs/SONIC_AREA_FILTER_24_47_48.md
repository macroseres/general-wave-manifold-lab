# Sonic area filter — dev.24.47.48

Minimal correction: the default `minCrossNorm` of `sonicSurfaceTriangles` is changed from `1e-10` to `1e-14` for both sonic surfaces. The explicit override parameter remains available for audits. No changes to Worker, cache, or extraction algorithm.

The triangle nondegeneracy assertion in `tests/math.test.js` is updated to the same new default. This is a threshold change, not proof of geometric completeness or correctness for arbitrary flux parameters.

Validation: `npm run test` and `npm run audit:sonics:area-stability`. For full local validation also run `npm run check` (requires npm dependencies).
