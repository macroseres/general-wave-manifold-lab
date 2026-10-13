# Sonic upper-boundary investigation (dev.24.47.41)

Run `npm run audit:sonics:upper-boundary`. This **offline** script builds meshes with nZ=50 and nZ=100, holding nTau=34 and nY=28 fixed. The production Worker and sonic extraction algorithm are unchanged.

At default coefficients, each sonic surface has exactly two mesh boundary edges with one endpoint within 1e-8 of the computational box and the other interior. Both converge toward (tau,Y)=(0,0), with zc of the interior endpoint ~0.997973177. The boundary-edge length is ~0.00102682 and **does not shrink** when nZ doubles from 50 to 100. This means the two mixed edges are not explained by insufficient z sampling alone. Their classification also depends on the 1e-8 boundary tolerance: near-upper endpoints are 6.7e-9 (nZ=50) or 3.37e-9 (nZ=100) from zc=0.999.

Absolute residuals of endpoints are small (~1e-11 to ~3.5e-8) despite the ill-conditioning of the implicit function near zc=0.999. The diagnostic does not prove these edges are genuine holes, nor that the four shared-face disagreements correspond exactly to them. Further geometric certification should focus on their local adjacency and compare face intersections in actual coordinates, not only counts.

Do not silently 'repair' these edges: retain the current production mesh and fast extraction pending mathematical confirmation.
