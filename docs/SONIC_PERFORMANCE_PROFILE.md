# Sonic surface performance profile

Run `npm run profile:sonics` for the default scene resolution (34×28×50), twice.

For a lower-cost comparison run `npm run profile:sonics -- --ntau 16 --ny 12 --nz 20 --repeats 2`.

The script measures complete marching-tetrahedra extraction, including face conformity checks and residual validation, and separately measures typed-array conversion. It never executes during normal app use. It does not isolate individual algorithm stages or measure browser GPU upload, Worker startup or transfer. Interpret results as baseline measurements, not proof of a specific bottleneck.

No changes to sonic equations, triangulation, React scene, or Worker lifecycle are made in this package.
