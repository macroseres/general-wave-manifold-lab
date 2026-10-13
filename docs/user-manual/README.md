# User Manual — working source

This directory is the incremental source of the future user manual. It is maintained during development rather than reconstructed at the end.

## Documentation rule

A feature is documented at three levels when applicable:

1. **Mathematical reference** — definition, hypotheses, formulas and derived identities in `docs/mathematics/`.
2. **Technical documentation** — implementation boundaries, algorithms and source ownership in `docs/architecture/` and ADRs.
3. **User manual** — what the control/object means, how to use it, and how to interpret the visualization.

The user manual must not claim an unimplemented feature is available. Planned features are explicitly marked as planned.

## Current chapters

- [01 — Spaces and views](01-spaces-and-views.md)
- [02 — Rarefaction and local chart](02-rarefaction-local-chart.md)

## Planned chapters

- Flux model and parameter presets.
- Wave manifold and global 3D view.
- Characteristic surface and coincidence locus.
- Sonic surfaces.
- State-space view `(u,v)`.
- Hugoniot curves.
- Composite waves.
- Riemann solutions and physical-space view `(x,t)`.
- Reproducible experiments and export.


### Tipografia matemática
A interface usa `MathLabel` e `MathBlock` com KaTeX para renderizar LaTeX. A carta `Z=1/z` não deve ser confundida com a coordenada visual compactificada `z-hat=(2/pi) arctan(z)`.
