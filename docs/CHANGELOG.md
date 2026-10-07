# Changelog

All notable changes to this project are documented here.

The project follows Semantic Versioning while recognizing that versions below 1.0.0 may evolve their public scientific/API conventions.

## [0.6.0] - 2026-10-07

### Added
- GitHub Actions CI running `npm run check`.
- Repository `.gitignore`.
- Architecture and numerical-conventions documentation.
- Architecture Decision Records (ADRs).
- LaTeX mathematical-reference skeleton for formula-by-formula migration and verification.
- Project roadmap and contribution workflow.
- Initial scientific design tokens.
- Independent regression tests for the extracted mathematical modules.

### Changed
- Established an explicit scientific dependency direction: mathematics → numerics → geometry → visualization → UI.
- Extracted the general quadratic flux, presets, and Jacobian to `src/math/flux/quadraticFlux.js`.
- Extracted the finite projective chart to `src/math/charts/zChart.js`.
- Extracted the complementary `Z=1/z` chart to the Windows-portable module `src/math/charts/reciprocalChart.js`.
- Extracted wave-manifold state construction and Rankine–Hugoniot/eigenvector residuals to `src/math/manifold/waveState.js`.
- Extracted the coincidence locus to `src/math/manifold/coincidence.js`.
- Extracted sonic geometry to `src/math/sonic/sonic.js`.
- Extracted rarefaction field, singularity analysis, and separatrix integration to dedicated `src/math/rarefaction/` modules.
- Extracted polynomial-root helpers to `src/math/numerics/polynomialRoots.js`.
- Reduced `src/math/quadraticFlux.js` to a pure compatibility facade; existing application imports remain valid.

### Fixed
- Removed temporary `HelpDialog.jsx.tmp`.
- Avoided filenames distinguished only by letter case, preventing chart-module collisions on case-insensitive filesystems such as standard Windows installations.
