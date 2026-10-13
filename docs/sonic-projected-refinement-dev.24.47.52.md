# dev.24.47.52 — Experimental projected refinement

This release adds a **standalone experimental audit**, not a production rendering change.

Run `npm run audit:sonics:projected-refinement` to compare the original extractor and conforming projected-midpoint subdivision at `a20=1.9`, on 34×28×50 and 48×40×72 grids, for both sonic sheets.

Selection uses relative centroid implicit-distance estimate >0.01 OR triangle quality <0.01. Shared edge midpoints are projected by safeguarded damped Newton steps. Failed projections are rejected consistently across adjacent triangles. Projection displacement is capped at 20% of the original edge length, and the chart is constrained to |zc|<0.999.

**Limitations:** This is not an injectivity or topology-preservation certificate. The local estimate |Phi|/|grad Phi| is not a certified distance. No surface render path uses the experimental output. The algorithm does not guarantee improved triangle angles, and the audit shows it produces more skinny triangles.

## Findings

For the 34×28×50 minus sheet, relative interior max error decreased from 0.11087 to 0.07226, but skinny triangles increased from 323 to 1323. For 48×40×72 minus, relative interior max error decreased from 0.06980 to 0.05596 while skinny triangles increased from 588 to 2405. No non-manifold edges were detected on the tested meshes. These findings do not justify production activation.

Next investigate a curvature-aware remeshing / edge-flip strategy and verify element orientation, topology, and appearance before changing the renderer.
