# ADR-001 — Scientific layering

- Status: Accepted
- Date: 2026-10-07

## Context

The project combines symbolic/analytic definitions, numerical algorithms, geometric sampling, Three.js rendering and interactive UI. Mixing these concerns makes mathematical errors difficult to distinguish from visualization errors.

## Decision

Use the dependency direction:

`mathematics → numerics → geometry → visualization → UI`.

The mathematical core remains framework-independent and testable with Node.js.

## Consequences

- React and Three.js cannot be imported by the mathematical core.
- New mathematical objects are documented and tested before their renderer becomes authoritative.
- Existing `quadraticFlux.js` will be decomposed incrementally, not rewritten in one large change.
