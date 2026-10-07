# ADR-003 — Portable module filenames

## Status
Accepted — 2026-10-07.

## Context
The project uses two related coordinate charts, conventionally denoted by `z` and `Z=1/z`. An early refactor represented them as `zChart.js` and `ZChart.js`. This works on case-sensitive filesystems but collides on common case-insensitive Windows filesystems.

## Decision
Repository paths and module filenames must never differ only by letter case.

The finite chart remains `src/math/charts/zChart.js`. The complementary `Z=1/z` chart is named `src/math/charts/reciprocalChart.js`.

Mathematical notation may continue to use `z` and `Z`; only filesystem/module naming is constrained by this decision.

## Consequences
- The repository behaves consistently across Windows, Linux, and macOS configurations.
- Future chart modules must use semantically distinct filenames rather than case-only distinctions.
