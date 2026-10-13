# Sonic local differential audit — dev.24.47.43

This diagnostic computes the implicit gradients in display coordinates `(tau,Y,zc)` at the **exact** mesh vertex nearest `(0,0,0.9979731775)` on each sheet. It evaluates `Phi_minus=Y detM-2K` and `Phi_plus=Y detM+2K` from the existing mathematical kernel, using central differences. It reports a three-step sensitivity check, normalized normals, and a sample along the axis `tau=Y=0`.

Run `npm run audit:sonics:local-differential`.

A nonzero gradient, if stable and the implicit function is differentiable, implies a locally regular level surface. It does **not** prove that the mesh boundary is geometrically correct. The axis sample tests whether the entire axis belongs to the sonic level set (it need not); it is not a full analytic factorization. Large gradients near the compactified limit must be interpreted cautiously. No production geometry, triangulation, Worker, or cache is changed.
