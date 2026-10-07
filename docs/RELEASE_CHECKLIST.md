# Release checklist

Use this checklist before every tagged release.

## Scientific integrity
- [ ] Mathematical definitions changed by the release are documented.
- [ ] New/changed objects have an invariant, residual, benchmark, or regression test whenever feasible.
- [ ] Coordinate transitions and rescalings affected by the release are tested on their overlap/domain.
- [ ] No renderer/UI change is being used to compensate for a mathematical regression.

## Code quality
- [ ] `npm run check` passes locally.
- [ ] No temporary/debug files are tracked.
- [ ] New module filenames are portable across case-sensitive and case-insensitive filesystems.
- [ ] `src/math` remains independent of React and Three.js.

## Documentation
- [ ] `docs/CHANGELOG.md` is updated.
- [ ] `docs/ROADMAP.md` reflects completed work.
- [ ] Relevant ADRs are added/updated when a durable architectural or mathematical decision was made.
- [ ] LaTeX documentation is updated for verified mathematical changes.

## Git/GitHub
- [ ] Work is committed on an appropriate branch or reviewed before merging to `main`.
- [ ] GitHub Actions CI is green on `main`.
- [ ] Version in `package.json` matches the intended release.
- [ ] Release tag uses the form `vX.Y.Z`.
- [ ] GitHub Release notes summarize scientific, architectural, and user-visible changes.
