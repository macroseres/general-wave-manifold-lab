# Numerical conventions

This document records numerical algorithms, tolerances and failure criteria used by the lab.

## Rules

- Numerical tolerances must be named constants or explicit parameters, not unexplained literals.
- Root finding and integration routines must report failure instead of silently returning misleading geometry.
- Sampling density is a visualization concern unless it changes the mathematical algorithm itself.
- Coordinate-chart transitions should be tested on overlap regions.
- Whenever an analytic residual is available, use it to validate computed points.

## Reproducibility

A future experiment/state export should record at least:

- flux model and parameters;
- coordinate chart;
- computational domain;
- numerical tolerances;
- visible mathematical objects;
- selected state/point;
- application version.
