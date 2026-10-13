# Reproducible experiments

`v0.7.0-dev.16` introduces schema `general-wave-manifold-lab/experiment`, version 1.

The JSON document deliberately separates two kinds of state.

## Scientific state

- the ten coefficients of the general quadratic flux;
- the `(tau,Y)` sampling window (not the mathematical domain of `W`);
- the selected `(tau,Y,zc)` point, with the chart convention recorded explicitly;
- a snapshot of the canonical numerical policy;
- producer application and version metadata.

These fields determine the mathematical/numerical experiment. A saved numerical-policy snapshot is compared with the current application policy on import. A mismatch is reported explicitly; it is never silently presented as exact numerical reproduction.

## Presentation state

- visibility of sonic and rarefaction objects;
- visual axis scales.

Presentation state is saved because it is needed to reconstruct a scientific figure, but it is not part of the mathematical definition.

Camera pose is not yet persisted: the current Three.js camera remains renderer-owned. Persisting it later must not move camera state into the mathematical layer.

## Compatibility

Schema versions are independent from application versions. Unknown schema versions are rejected rather than guessed. Future changes must add an explicit migration before older files are accepted under a new structure.


Schema v2 names this field `scientific.samplingDomain`. Schema v1 files with `scientific.domain` are migrated on import so the terminology correction does not discard dev.16 experiments.
