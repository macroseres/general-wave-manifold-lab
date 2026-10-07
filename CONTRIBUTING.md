# Contributing

## Branches

- `main`: stable and releasable.
- `feat/<short-name>`: new functionality.
- `fix/<short-name>`: corrections.
- `docs/<short-name>`: documentation-only work.
- `refactor/<short-name>`: behavior-preserving structural work.

## Before a commit

Run:

```bash
npm run check
```

Do not merge when lint, mathematical tests or build fail.

## Scientific changes

For a new mathematical object or a change in a formula:

1. update the mathematical documentation;
2. implement it outside the renderer;
3. add/adjust mathematical tests;
4. implement geometry/rendering;
5. update the changelog when user-visible or scientifically relevant.

## Commits

Prefer focused Conventional Commit messages, for example:

- `feat(sonic): add implicit S+ residual`
- `fix(charts): correct Z-chart transition`
- `docs(math): derive rarefaction field`
- `refactor(math): split quadratic flux module`
