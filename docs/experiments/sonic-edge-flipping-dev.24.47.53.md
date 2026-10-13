# Sonic edge flipping — dev.24.47.53

Experimental-only diagonal swaps between adjacent triangles. The production surface extractor, Worker and cache are unchanged.

Run `npm run audit:sonics:edge-flips` for the `a20=1.9` case, both sonic sheets and two grid resolutions.

Acceptance criteria: strict increase in minimum pair triangle quality; no insertion or relocation of vertices; common-edge orientations compatible; alternative diagonal absent in original adjacency; triangle normals within 35° of both original normals; new centroid implicit-distance estimate not more than 1.05× old maximum (with numerical floor). Only interior edges with exactly two incident triangles are candidates.

The experiment measures skinny triangle counts, boundary and nonmanifold edge counts, and centroid relative residual estimates. It does not certify global absence of self-intersections, nor prove that rendering stripes are fixed. Production integration requires visual comparison and broader parameter testing.

**Caution:** The centroid relative error reported here uses one sample per triangle. It must not be compared directly to the four-samples-per-triangle audit in dev.24.47.52.
