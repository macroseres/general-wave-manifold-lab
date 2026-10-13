# Sonic extraction performance — dev.24.47.38

The shared-face consistency audit is diagnostic only and now defaults to disabled in the regular extraction path. The renderer and worker explicitly request `diagnostics:false`. For research diagnostics use `diagnostics:true` in `sonicSurfaceTriangles` or `npm run profile:sonics` (the profile command continues to enable the audit by default).

Run `npm run audit:sonics:equivalence` to compare the complete position and index arrays with the audit enabled and disabled for both sonic sides at the standard resolution and default coefficients. The script asserts exact equality before reporting success. A match does not resolve the face mismatches identified by the optional audit.

This change does not modify the implicit sonic equations, root refinement, marching tetrahedra, or mesh resolution. Browser timing still depends on Worker startup and rendering.
