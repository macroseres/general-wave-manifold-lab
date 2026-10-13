# Rarefaction candidates seeded by Riemann states

`src/math/rarefaction/stateIntegralCurves.js` computes local integral curves of the real eigenvector fields of `DF(U)` for the slow and fast characteristic families. The module is pure and independent of the renderer. It traces both orientations from each defined Riemann state, using RK4 with step doubling, and stops if strict hyperbolicity is lost.

The curves are **not** certified admissible Riemann waves. No monotonicity or genuine nonlinearity test, wave-family ordering, shock/rarefaction connection, entropy selection, or complete physical-space solution is implemented in this step. In particular, backward curves from `U_R` are geometric candidate paths, not a solved right-going fan.

The rendering uses orange for curves from `U_L`, green for those from `U_R`, and distinct dash patterns for slow and fast families. The characteristic locus and the generic inspection state remain independent of these Riemann seeds.
