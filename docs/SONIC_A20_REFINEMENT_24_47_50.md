# Experimental refinement, a20=1.9 (dev.24.47.50)

This is an **audit-only negative experiment**, not a production correction.

The experimental algorithm marks all three edges of every triangle with dimensionless quality below 0.01, shares the midpoint across all incident triangles, and applies conforming one-/two-/three-edge subdivision templates. It intentionally does not project midpoints onto the nonlinear sonic implicit equation: naive projection near the compactification boundary could fold the mesh.

Run `npm run audit:sonics:refinement` to compare both sonic sides and two grids. The experiment preserved zero nonmanifold edges but **increased** the number of skinny triangles and the maximum absolute centroid residual; thus it must **not** replace the production extractor.

For grid 34x28x50, skinny counts: minus 323 -> 1324; plus 326 -> 1335. For grid 48x40x72: minus 588 -> 2401; plus 592 -> 2411. Absolute implicit residuals alone are not normalized geometric distances, especially near zc=±0.999.

Next technical investigation: identify whether distortion is caused by long chords in compactified coordinates, by root placement, or by the nonlinear implicit surface. Compare local gradient-normalized residual and signed orientation before attempting projection or adaptive extraction. Preserve canonical shared-edge roots and DS constraints.
