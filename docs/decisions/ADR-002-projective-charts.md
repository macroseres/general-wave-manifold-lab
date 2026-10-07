# ADR-002 — Projective/local charts

- Status: Accepted
- Date: 2026-10-07

## Context

The wave manifold requires more than one chart to represent directions that become singular in a single affine coordinate. The current implementation already uses the finite `z` chart and a complementary `Z = 1/z` chart.

## Decision

Treat chart definitions and transitions as mathematical objects in `src/math/charts`, independent of rendering. Document every rescaling used to desingularize a vector field and test chart agreement on overlap regions.

## Consequences

- Infinity is not handled by arbitrary renderer clipping.
- Local portraits can be validated independently of Three.js.
- Future blow-up/compactification work has an explicit mathematical home.
