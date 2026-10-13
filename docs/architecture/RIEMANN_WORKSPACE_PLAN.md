# Riemann workspace — scientific scope and staged implementation

The scientific target is a general quadratic flux F, initial states U_L and U_R, and an explicitly chosen admissibility criterion. Four synchronized views are required: wave manifold in 3D, state plane (u,v), space-time (x,t), and physical profiles u(x,t), v(x,t).

## Existing implementation and current boundary

The 3D Scene is the primary viewport. StateSpaceDialog provides a separate state-plane view. PhysicalSpaceDialog constructs a *candidate* physical rarefaction fan from one selected monotone orbit. This delivery adds a time slider and profiles using the same `rarefactionSolutionCandidate` and `rarefactionStateAtXi` functions. These plots are **not** a general Riemann solver: the constant end extensions are visual conventions, not a proof that a selected orbit connects prescribed Riemann data admissibly.

## Next stages

1. Build a shared, pure Riemann experiment model containing F, U_L, U_R, admissibility policy, numerical tolerances and wave sequence, with explicit `unresolved` status.
2. Add a dedicated state-plane spectral partition using Delta(U)=tr(DF)^2-4det(DF); Delta=0 is a repeated-eigenvalue boundary, not automatically a parabolic normal form.
3. Investigate parameter equivalence under admissible changes of state and flux, rather than transferring the special b1,b2 reduction from the older application without proof.
4. Add a pure wave-sequence solver, certify Rankine–Hugoniot and admissibility for shocks, monotonicity for rarefactions, and matching at intermediate states.
5. Render synchronized 3D/state/space-time/profiles from **one certified solution object**; use linked selection and a shared time control. Keep unsolved and candidate cases visibly distinct.
6. Extend experiment export/import to preserve initial states, numerical policy, view settings, and solution provenance.

No classification of a general quadratic flux or general Riemann solution is claimed by this delivery.
