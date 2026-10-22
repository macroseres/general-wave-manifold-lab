## Correção do atlas e rastreabilidade — 21/10/2026

- Corrigida a classificação dos quocientes lineares excepcionais: coordenadas pequenas não nulas não são mais tratadas como eixos exatos por um limiar absoluto. Decisões ambíguas retornam `ill-conditioned` sem classe residual; regressões cobrem reescala positiva, eixos resolvidos e os setores de posto um. A avaliação do produto residual evita perda de sinal por subfluxo do produto direto.
- Registrados estratificação escalar, par traço/cúbico, carta genérica e atlas global na matriz canônica, com definições, módulos, testes, verificações simbólicas, UI planejada e limites de validação. Inclusão no LaTeX compilado e classificação das ondas permanecem pendentes.

## Documentação matemática — 20/10/2026

- Fechamento algébrico do atlas relativo ao grupo afim de estados com escala positiva de velocidade e referencial: representação por traço e cúbico binário, nove famílias quadráticas, estabilizadores completos e quocientes lineares, incluindo as exceções de posto um. Acrescentados normalizador global, diagnósticos racionais e testes de cobertura, reconstrução e equivalência. Classificação de ondas e certificação numérica nas fronteiras permanecem separadas desse resultado.

- Atlas dos dez parâmetros: classificador racional dos lugares escalares e homogeneização; dedução de uma forma normal residual no setor quadrático genérico por base e centro intrínsecos. Novos módulos puros e testes de transporte, invariância, reconstrução e setores excepcionais. As formas dos setores excepcionais e a classificação global das folheações permanecem abertas.

- Concluído o mapa editorial dos 26 capítulos. Acrescentados estudos de composta degenerada, perfil viscoso B=I, separatriz recíproca, classificações exatas e transporte afim, com fixtures, figuras, fontes localizadas e testes. O mapa distingue fechamento editorial de validação científica global e reúne as pendências de implementação.

- Acrescentados estudos exatos de rarefação rápida e cadeia de dois choques aos capítulos 17 e 20, com fontes localizadas, figuras nos três espaços, fixtures e testes de campo, conservação, famílias e perfil. Explicitada uma conexão regular que exige outra parametrização local; cálculos de produção preservados.

- Desenvolvido o capítulo-modelo de fibras de Hugoniot: referências primárias com seção e limites de aplicação, exemplo exato nos três espaços, fixture, gerador de dados, figura científica e dois testes matemáticos. O renderizador passa a exibir links bibliográficos e figuras locais; cálculos de produção preservados.

- Registrados os objetivos científicos com a Variedade de Ondas como eixo da pesquisa e correspondência entre os três espaços.
- Migradas todas as 26 seções da referência exibida para Markdown compartilhado entre Documentação e Ajuda; o registro JSX mantém apenas títulos e ordem.
- Concluídos diagnósticos, critérios de auditoria, ambientes e guia de leitura. O teste de renderização carrega o registro completo; convenções, procedimentos e critérios usam agrupamento semântico. A inspeção visual e a revisão bibliográfica permanecem pendentes.
- Detalhados cadeias e traço inicial, limites da interpolação física e de junções sônicas implementadas, transporte afim de dados e entropias, e distinção entre espectro local, cônicas e cortes de parâmetros.
- Ampliado o bloco de rarefação, separatrizes e compostas: projeção regular, fator exato de orientação entre cartas e limitações da seleção de ramos e do resíduo recíproco na fronteira.
- Revisados coincidência e lugares sônicos: notação uniforme para o discriminante, distinção entre determinantes completos e folhas reduzidas, relação exata entre K e perda de genuína não linearidade, e convenções numéricas de dupla sônica na característica.
- Consolidado o bloco da variedade: distinção da diagonal prolongada, domínios regulares, velocidade, amplitude de fibras e dedução da mudança recíproca preservando estados e velocidade. Explicitados limites de cobertura das projeções numéricas.
- Ampliadas as deduções de velocidade/resíduo de salto e produção entrópica; explicitadas as desigualdades completas de Lax, a orientação das fibras e os limites dos diagnósticos numéricos.
- Explicitada a hipótese de derivada positiva para a construção do leque suave de rarefação, distinguindo-a da monotonicidade numérica amostrada.
- Adicionado guia das fontes matemáticas, limites do renderizador e sequência de consolidação. Incluídos testes de interpretação, agrupamento e renderização matemática; nenhuma equação de produção foi alterada.

## Diagnóstico infinitesimal de contato sônico (etapa de pesquisa)

- Derivada analítica de velocidade de choque na coincidência, usando Hessiana quadrática e autovetores esquerdo/direito.
- Tooltip nos candidatos a perda de não linearidade genuína; quatro testes adicionais.
- Não certifica contato sônico finito nem admissibilidade de ondas compostas.

## Auditoria numérica incremental — v0.7.0-dev.24.47.58

- Centralizados os defaults de integração adaptativa e localização de eventos em `NUMERICAL_POLICY.integration`, sem mudar os valores.
- Adicionados testes de regressão da política, RK4 adaptativo, orientação temporal, eventos e normalização.
- Registradas limitações e pendências em `docs/NUMERICAL_LAYER_AUDIT.md`.

## Certificação adicional (08/10/2026)
- Derivado o fator temporal exato `D Psi V_z = -z V_Z` entre cartas de rarefação.
- Adicionados testes de sobreposição regular para três fluxos quadráticos.
- Atualizados LaTeX canônico e matriz de rastreabilidade; nenhuma alteração no renderer ou nas equações de produção.

## v0.7.0-dev.24.47.22 — Canonical sonic-intersection audit

- Adds the exact algebraic classification `S^- ∩ S^+ = J ∪ DS`, derived from the two canonical implicit sonic equations.
- Adds an independent numerical audit using separately extracted minus/plus meshes; mesh samples are checked against both original implicit equations and only then classified by the mathematical layer.
- Verifies canonical `J` and `DS` coverage without redefining either locus from mesh intersections.
- No change to `Phi_±`, sonic tolerances, or the renderer geometry.

## v0.7.0-dev.24.47.21 — Canonical zero-vertex / zero-edge resolution

- Starts from dev.24.47.20 and preserves its canonical shared-edge roots and exact regular Marching-Tetrahedra cases.
- Treats a tetrahedron with exactly one `Phi=0` grid vertex as its own affine topological case instead of silently classifying that vertex as negative.
- For mixed signs at the remaining three vertices, emits the unique affine triangle through the exact zero vertex and the two canonical sign-change roots.
- For equal signs at the remaining vertices, retains the exact zero vertex but emits no artificial surface face.
- Keeps the exact two-zero-vertex (zero-edge) rule: opposite signs produce the unique triangle containing the zero edge; equal signs retain only the zero edge.
- Adds `zeroVertexTetCount` diagnostics; no patch, triangle deletion, hole filling, or solution as `Y(tau,z)` is introduced.

## v0.7.0-dev.24.47.20 — Canonical shared-edge intersections

- Starts directly from dev.24.47.12; diagnostic rendering from dev.24.47.13–19 is not retained.
- Caches every implicit root on an undirected grid edge and reuses the exact same point in every incident tetrahedron.
- Makes edge-root solving orientation independent by imposing a canonical endpoint order before bisection.
- Replaces angular polygon ordering in regular tetrahedra by the exact Marching-Tetrahedra sign cases; the 2+/2- quadrilateral has a fixed combinatorial boundary order.
- Keeps exact DS zero edges unchanged; no patch, hole filling, or solution of the sonic surface as Y(tau,z) is introduced.
- Separates remaining shared-face diagnostics into regular mismatches and exact zero-edge degeneracies.

## v0.7.0-dev.24.47.12 — Double-sonic zero-edge topology

- Keeps the dev.24.47.11 canonical implicit Marching Tetrahedra baseline.
- Treats tetrahedra containing an exact `Phi=0` edge as a distinct topological case instead of feeding duplicated zero-edge endpoints to generic polygon sorting.
- When the two opposite tetrahedron vertices have opposite signs, emits exactly the triangle formed by the zero edge and the certified root on the opposite edge.
- When the opposite vertices have the same sign, retains the exact zero edge but invents no surface face.
- Handles exact zero faces explicitly and refuses to invent a unique surface inside an identically-zero tetrahedron.
- Adds diagnostics for zero-edge, zero-face, and zero-volume tetrahedra and a regression test for the canonical DS fibres.

## v0.7.0-dev.24.47.11 — Constrained implicit Marching Tetrahedra

- Discards the explicit regular-chart experiment from dev.24.47.10.
- Restores canonical implicit extraction of `Phi_- = 0` and `Phi_+ = 0`; no coordinate is solved as `Y(tau,z)`.
- Replaces third-party Marching Cubes with a native conforming Freudenthal Marching Tetrahedra mesh.
- Inserts certified double-sonic base coordinates as grid planes before tetrahedralization, so DS is a constrained grid fibre rather than an overlay or post-processing seam.
- Uses edge-local root refinement, global vertex welding, and consistent face orientation.
- Removes the `isosurface` dependency.

## v0.7.0-dev.24.47.9 — DS-conforming sonic seam

- Starts from dev.24.47.7; dev.24.47.8 is discarded.
- Keeps the canonical DS calculation K=det(M)=0 and the edge-certified implicit Marching Cubes mesh.
- Replaces only a narrow neighborhood of each certified DS fibre by a conforming implicit seam.
- The seam is solved directly from Phi_±=0 without dividing by det(M); its central column is exactly the canonical DS fibre.
- Removes overlapping global triangles in the replaced neighborhood instead of drawing a second surface on top.

## v0.7.0-dev.24.47.7 — Canonical double-sonic base points

- Restores dev.24.47.5 as the sonic-mesh baseline; the dev.24.47.6 DS-anchored sampling experiment is not retained.
- Moves the double-sonic base-point calculation into the mathematical sonic-intersection layer.
- Solves `det(M)(z)=0` algebraically and then `K(tau,z)=0` on each finite projective direction; DS is no longer obtained by intersecting two polygonised contour families.
- Certifies every rendered DS fibre against both canonical implicit sonic equations `Phi_-=0` and `Phi_+=0` at nonzero Y.
- Does not alter the dev.24.47.5 Marching Cubes mesh, edge certification, or sampling grid.

## v0.7.0-dev.24.47.5 — Edge-certified sonic mesh

- Replaces unconstrained/local 3-D Newton correction of Marching-Cubes vertices with certification restricted to the original grid edge.
- Preserves Marching-Cubes connectivity while refining vertices directly against the canonical implicit equations `Phi_±=0`.
- Adds mesh diagnostics: maximum implicit residual, edge refinements, uncertified vertices, degenerate triangles and maximum edge ratio.
- Keeps the synchronous renderer while sonic topology is being validated; Worker/cache optimization remains deferred.

## v0.7.0-dev.24.47.4 — Topology-preserving sonic certification

- Keeps direct synchronous Marching Cubes while geometry is validated.
- Constrains implicit vertex certification to the local Marching-Cubes cell neighbourhood.
- Adds backtracking so certification cannot jump to a remote branch of `Phi_±=0`, eliminating the giant spurious faces introduced by unconstrained Newton projection.
- Preserves the canonical implicit equations; no explicit `Y=2K/detM` parametrization is used.

## v0.7.0-dev.24.47.3 — Direct sonic render validation

- Removes the asynchronous Worker from the sonic rendering path temporarily so a valid Marching-Cubes mesh cannot be lost by Worker lifecycle/state handling.
- Keeps the implicit certified Marching-Cubes extractor and canonical `Phi_±=0` mathematics unchanged.
- Disables frustum culling for the diagnostic sonic meshes and logs vertex/triangle counts and extraction time.
- `S+` remains the exact `Y` reflection of the extracted `S-` sheet.

## v0.7.0-dev.24.47.2 — Sonic worker recovery and diagnostics

- Keeps certified implicit Marching Cubes as the sonic mesher.
- Detects module-worker errors, empty worker meshes, and stalled extraction instead of silently hiding `S^-`/`S^+`.
- Adds a certified main-thread recovery path only when the worker fails; the worker remains the default path.
- Carries mesh diagnostics (vertex/triangle counts, elapsed time and base evaluations) with worker results.
- Does not alter `Phi_±`, `DS`, `J`, tolerances, or the scientific definitions.

## v0.7.0-dev.24.47.1 — Certified Marching Cubes vertices

- Projects every Marching Cubes vertex back onto the original implicit sonic equation `Phi_±=0` by Newton correction along the numerical gradient.
- Does not solve `Y=2K/det(M)` and remains defined at the double-sonic degeneracy.
- Restores the mesh diagnostic contract `rejectedDegenerate: 0` expected by the scientific tests; triangle non-degeneracy remains independently asserted.
- Keeps the Web Worker and LRU cache introduced in dev.24.47.

## v0.7.0-dev.24.47 — Marching Cubes sonic extraction (worker + LRU)

- Replaces the native marching-tetrahedra extractor with `isosurface` Marching Cubes, adapted from the working `wave-manifold-app` implementation.
- Evaluates the canonical implicit `Phi_minus(tau,Y,z)` directly, without solving `Y(tau,z)`; `S^+` is the exact mirrored display sheet.
- Moves extraction into a dedicated Web Worker and adds a six-entry / 24 MiB LRU cache with transferable geometry buffers.
- Preserves the yellow double-sonic and magenta inflection loci as independent mathematical curves.
- This is a new extraction strategy requiring visual verification and the complete local `npm run check`; no claim of verified mesh residuals is made before those tests.

## v0.7.0-dev.24.46 — Stable sonic baseline + DS styling

- Restores the validated dev.24.44 implicit sonic mesher after the dev.24.45 closure heuristic fragmented the sheets.
- Keeps `S^-` and `S^+` extracted directly from `Phi_±=0`; no explicit `Y(tau,z)` parametrization is introduced.
- Styles the double-sonic locus `DS` in yellow, thicker and above the translucent sonic sheets.
- Leaves the remaining local mesh holes isolated for a later mesher replacement rather than adding destructive cell-rejection heuristics.

## v0.7.0-dev.24.43.1 — Architecture guardrail fix

- Removes the obsolete unused `sonicImplicit` import from the optimized sonic geometry.
- Updates the architecture guardrail to verify native implicit evaluation through `sonicData`, `K`, and `detM`, while continuing to forbid solving the sonic surface as `Y(tau,z)`.
- No mathematical or meshing algorithm change.

## v0.7.0-dev.24.43 — Fast Implicit Sonic Meshing

- Keeps `Phi_-=0` and `Phi_+=0` as the sole authority for sonic surface extraction; no solved `Y(tau,z)` graph is introduced.
- Caches canonical sonic data `K` and `det(M)` once per `(tau,zc)` lattice node instead of recomputing it for every `Y` sample.
- Preserves the certified 48-step crossing-edge refinement, but removes the expensive finite-difference `grad(Phi)` orientation pass; sonic meshes are rendered double-sided.
- Uses the exact identity `Phi_+(tau,Y,z)=-Phi_-(tau,-Y,z)` to extract the implicit mesh once and obtain the second renderer sheet by the exact reflection `Y -> -Y`.
- Adds extraction timing and base-evaluation metadata for performance auditing.
- `DS` remains independently represented by `K=det(M)=0`, so the optimization does not divide by `det(M)` or erase double-sonic fibres.

## v0.7.0-dev.24.42 — Sonic Intersection Geometry

- Formaliza a dupla sônica como a interseção implícita fora de C: `K=0`, `det M=0`, equivalently `Phi_-=Phi_+=0` for `Y != 0`.
- Formaliza a inflexão em C como `Y=0`, `K=0`.
- Adiciona resíduos canônicos independentes do renderer e testes que certificam DS simultaneamente nas duas equações sônicas.
- Mantém a extração das superfícies sônicas inteiramente implícita; não reintroduz `Y(tau,z)`.

## v0.7.0-dev.24.41 — Fully Implicit Sonic Geometry

- Audits the sonic pipeline and removes the solved graph coordinates `yMinus` / `yPlus` from the mathematical API.
- `S^-` and `S^+` are rendered exclusively as zero sets of the canonical implicit equations `Phi_-=Y det(M)-2K=0` and `Phi_+=Y det(M)+2K=0` in the full `(tau,Y,zc)` sampling box.
- Restores full 3-D implicit extraction so the mesh never assumes `Y=Y(tau,z)`, including near `det(M)=0`.
- Double sonic `DS` remains the simultaneous degeneracy `K=det(M)=0`; its Y-fibres are not produced by division.
- The point inspector now reports `Phi_-(P)`, `Phi_+(P)`, `det(M)` and `K` instead of solved Y-values.
- Tests no longer construct sonic points from `Y=±2K/det(M)`.

## v0.7.0-dev.24.40 — Fast Implicit Sonic Extraction

- Preserves the canonical sonic equations `Phi_-=0` and `Phi_+=0` as the authority for geometry.
- Replaces volumetric `(tau,Y,zc)` marching tetrahedra by column-wise implicit root extraction, exploiting only the exact fact that `Phi` is affine in `Y`.
- Evaluates and certifies every emitted vertex against the original `sonicImplicit` function.
- Treats `det(M)=0` columns as degenerate/empty and leaves `DS` to its exact `K=det(M)=0` geometry; no arbitrary `0/0` point is emitted.
- Prevents mesh connectivity across opposite signs of `det(M)` and clips whole cells at the finite `Y` sampling boundary.
- Reduces the default sampling work from a 3-D volume to a 2-D `(tau,zc)` grid while increasing the latter to 72×108.
- Reports `maxResidual` and rejection counts on the generated geometry for numerical auditing.

## v0.7.0-dev.24.39 — Native Implicit Sonic Extraction

- Restores the sonic renderer to the canonical implicit level sets `Phi_-=0` and `Phi_+=0` in the full `(tau,Y,zc)` box.
- Removes `Y=±2K/det(M)` from sonic surface generation entirely.
- Uses root-refined marching tetrahedra on the actual implicit function; interpolation is refined against `Phi`, including the nonlinear visual `zc` coordinate.
- Treats edges lying wholly on the zero set as degenerate instead of inventing midpoint vertices.
- Keeps `DS` as exact separately certified fibres where `K=det(M)=0`.
- Welds vertices, removes degenerate faces and orients faces by `grad(Phi)`.
- Adds regression coverage that every emitted sonic vertex satisfies the original implicit equation.

## v0.7.0-dev.24.38.1 — Regular-sheet topology fix

- Keeps the sonic definition implicit: `Phi_-=0` and `Phi_+=0`.
- Forbids regular-sheet connectivity across `det(M)=0`.
- Removes three-corner clipped triangles, which created artificial spikes at asymptotes and the Y sampling boundary.
- Preserves `DS` separately as the exact degenerate fibres `K=det(M)=0`.
- Adds regression coverage requiring each emitted regular triangle to stay on one sign component of `det(M)`.

## v0.7.0-dev.24.38 — Structured Implicit Sonic Geometry

- Replaces generic 3D marching tetrahedra as the primary sonic renderer with a structured mesh over the `(tau,zc)` base.
- Keeps the canonical equations `Phi_-=Y det(M)-2K=0` and `Phi_+=Y det(M)+2K=0` as the mathematical definition.
- Divides by `det(M)` only on certified regular fibres separated from `det(M)=0`; degenerate fibres are never evaluated as `0/0`.
- Represents `DS` independently from the simultaneous conditions `K=0` and `det(M)=0`, so the double-sonic fibres are preserved rather than deleted or bridged.
- Clips the regular graph to the configured Y window without generating artificial caps across asymptotes or double-sonic fibres.
- Every emitted regular mesh vertex is regression-tested against the original implicit sonic equation.

## v0.7.0-dev.24.37 — Implicit Sonic Mesh Refinement

- Keeps `S^-` and `S^+` defined exclusively by the implicit level sets `Phi_-=0` and `Phi_+=0`; no division by `det(M)` was reintroduced.
- Welds shared marching-tetrahedra vertices into an indexed mesh and removes degenerate faces.
- Orients every sonic face consistently using the numerical gradient of the corresponding implicit function before smooth vertex normals are computed.
- Adds independent visibility controls for the double-sonic locus `DS` and inflection locus `J`.
- Preserves `DS` and `J` as mathematical geometry generated outside the renderer.
- Adds regression coverage for indexed, welded, finite implicit sonic meshes.


### v0.7.0-dev.24.27 — Composite inspection
- Adds certified composite branch/point diagnostics to the scientific UI without moving mathematical evaluation into the renderer.
## v0.7.0-dev.24.20 — Composite Definition

- Opens the composite-wave block only at the definition/pure-kernel stage.
- Fixes `sat_forw(Gamma)` through `pi_-^{-1}(U_-(P))` and `sat_back(Gamma)` through `pi_+^{-1}(U_+(P))`.
- Defines `K_- = sat_forw(R) ∩ S^-` and `K_+ = sat_back(R) ∩ S^+`, using the non-trivial sonic factors.
- Adds pure construction metadata and sonic-membership residuals; no saturation meshing, branch continuation, or renderer logic is introduced.


## v0.7.0-dev.24.19 — Hugoniot Closure

- Consolidates the canonical fixed-state Hugoniot mathematics in `docs/mathematics/11-hugoniot.tex`.
- Adds the formal `HUGONIOT_VERIFICATION.md` PASS/DEFERRED closure audit and extends scientific traceability.
- Records explicit `pi_-` / `pi_+` state-space projection, spectral signatures, strict Lax classification, state-role distinctions and the saturation boundary.
- Closes the Hugoniot roadmap item without claiming Liu admissibility, composite waves, or a general Riemann solver.
## v0.7.0-dev.24.18 — Explicit State Projection
- Adds an explicit `pi_-` / `pi_+` selector to the state-space view.
- Under `pi_-`, `H^{forw}(U*)=pi_-^{-1}(U*)` projects to the single point `U*`, while the backward fibre projects to the variable `U_-` curve.
- Under `pi_+`, the backward fibre projects to `U*`, while the forward fibre projects to the variable `U_+` curve.
- Keeps strict-Lax metadata attached to the non-constant image; no spectral classification is recomputed in state space.
- Expands Help through the current scientific state: local states/projections, fixed-state Hugoniot fibres, explicit projections, spectral/Lax diagnostics, Riemann-data roles, saturation foundation, and current physical-space scope.

## v0.7.0-dev.24.16 — Lax Geometry
- Transfers the already validated strict-Lax classification from the mathematical layer to Hugoniot display geometry; Three.js does not define or recompute the criterion.
- Uses family appearance independently of projection orientation: Lax 1 / Lax 2 / non-Lax / undefined are visually distinct.
- Keeps `pi_-^{-1}(U*) = H^{forw}(U*)` solid and `pi_+^{-1}(U*) = H^{back}(U*)` dashed.
- Preserves `U*` as a generic state; no identification with global Riemann data `U_L,U_R` is introduced.

## v0.7.0-dev.24.8 — Canonical Characteristic Lifts

- Names the finite slow and fast characteristic intersections of a fixed state fibre as `P_s` and `P_f`, using spectral classification rather than geometric position.
- Keeps coincidence and projective-infinity lifts explicit; they are never forced into slow/fast labels.
- Reports the coordinates of `P_s` and `P_f` in the fibre-analysis panel without adding permanent scene markers.
- Adds regression tests for the classification contract.

## v0.7.0-dev.24.7 — Global Hugoniot Continuation
- Continue fixed-state projection fibres in the reciprocal chart `(eta,Upsilon,Z)` near projective infinity.
- Validate reciprocal/finite chart agreement and avoid fake display chords across `Z=0`.
- Preserve exact characteristic intersections as non-rendered invariants.

## v0.7.0-dev.24.6 — Hugoniot/Characteristic Intersections

- Clips rarefaction polylines to the visible `(u,v)` window instead of discarding useful visible pieces.
- Adds exact, display-independent validation of the common characteristic intersections of the forward/backward state fibres.
- Keeps the validated default windows and 3D scales unchanged.

## v0.7.0-dev.24.5 — Hugoniot fibre visibility and scale

- Names the fixed-state fibres as future Hugoniot curves: `H^{forw}(U*) = pi_-^{-1}(U*)` and `H^{back}(U*) = pi_+^{-1}(U*)`.
- Renders both fibres as thicker independent 3D curves; their intersections with `C` are represented by the curves themselves, without permanent point markers.
- Adjusts the default visual scale and `Ajustar vista 3D` so free fibres remain visible without allowing their far tails to flatten the sampled sonic geometry.
- Keeps the mathematical sampling windows unchanged (`tau,Y` default to `[-5,5]`).

## v0.7.0-dev.24.4 — Fixed state-space default window

- Default state-space viewport is now `u,v ∈ [-5,5]`.
- Manual bounds and “Ajustar à geometria” remain available and affect visualization only.

## v0.7.0-dev.24.2 — Decoupled state fibres

- Restores the global sampling window as an independent control, with defaults τ,Y ∈ [-5,5].
- Fixed-state fibres are no longer clipped by the sonic-surface sampling window.
- Selecting U* no longer changes τ min/max or Y min/max.
- Keeps independent visual scales for τ, Y and z-hat; these never alter the mathematics.
- Splits fibre polylines across projective poles to avoid artificial chords.

## v0.7.0-dev.23.1 — State Fibre UX

## v0.7.0-dev.24 — State Fibre Analysis

- Algebraic singular-direction analysis for fixed-state fibres.
- Connected regular branch count over the real projective direction line.
- Reciprocal-chart treatment of the infinity direction.
- Characteristic-lift classification as slow, fast, coincidence, or infinity.
- Explicit verification that pi-minus/pi-plus share the same (tau,z) trace and have opposite Y.


## v0.7.0-dev.23.3 — State-selection separation

- Makes `U*` the primary state-space selection; the projection of the currently inspected `W` is hidden by default.
- Adds an explicit optional control to show `U_-`, `\bar U`, and `U_+` from the 3D inspection as secondary context.
- Decouples **Ajustar à geometria** from the inspected `W`: when rarefaction curves are available, the fitted `(u,v)` window uses those curves only.
- Keeps selection of `U*`, 3D inspection of `W`, and the state-space viewport as independent operations.

- State-space viewport controls with 1:1 scaling and “Ajustar à geometria”.
- U* no longer expands the state-space viewport automatically.
- Independent visibility controls for π₋⁻¹(U*) and π₊⁻¹(U*).
- Preserves the distinction between state selection in 𝒰 and point inspection in 𝒲.

## v0.7.0-dev.19 — Adaptive Numerics
- Added adaptive RK4 step-doubling with explicit local error control, rejection/retry, minimum step and suggested next step.
- Migrated generic rarefaction orbits and finite/infinity separatrices from fixed-step RK4 to the shared adaptive integrator while preserving their previous step as a maximum sampling step.
- Added a shared bracketed scalar-event refiner and routed coincidence-crossing refinement through it.
- Added convergence and forced-rejection tests; existing rarefaction/separatrix regression tests remain active.
- Extended the reproducible numerical policy with adaptive tolerances and controller parameters.

## v0.7.0-dev.18 — Canonical Mathematics Closure
- Closed the pre-Hugoniot canonical LaTeX reference without introducing a new wave object.
- Added an explicit canonical-status chapter fixing notation, chart conventions, rarefaction continuity, projective-boundary interpretation, and the distinction among `W`, state space and physical space.
- Updated scientific traceability through dev.17 and removed stale debt markers already resolved in dev.15.
- Added documentation regression guards so the canonical reference includes the closure chapter and the traceability matrix cannot silently revert to the old renderer-debt state.
- Recorded adaptive integration and the three-space solution framework as the remaining pre-Hugoniot foundation increments.

## v0.7.0-dev.14 — Numerical Policy & Integration Ownership
- Added a canonical, semantically grouped numerical policy; the project deliberately has no universal epsilon.
- Centralized rarefaction orbit/separatrix RK4 stepping in `src/math/numerics/integration.js` without changing the validated fixed-step algorithms.
- Centralized defaults for algebraic roots, chart regularity, spectral coincidence, sonic degeneracy, singularity classification, event refinement and rarefaction integration.
- Exposed a serializable numerical-policy snapshot in preparation for reproducible experiment files.
- Added tests that distinguish tolerances by numerical meaning and protect the canonical policy from accidental mutation.
- Renderer-side finite-separatrix integration remains intentionally recorded for removal in dev.15.

## v0.7.0-dev.13 — Scientific Traceability
- Added a canonical traceability matrix linking mathematical definitions to implementation, tests, geometry and UI.
- Added an explicit Foundation Completion audit before Hugoniot development.
- Identified numerical-policy debt and renderer-side scientific work without hiding it behind refactoring.
- Added executable architecture tests protecting `math` and `geometry` from React/Three.js dependencies.
- Recorded `Scene.jsx` finite-separatrix integration and sonic meshing as targets for the next Foundation increments.

## v0.7.0-dev.12 — Math Rendering & State View Polish
- KaTeX real para `MathLabel`/`MathBlock`; fórmulas da Ajuda usam LaTeX.
- Espaço de estados mantém escala 1:1 com auto-fit mais justo e melhor overflow/legenda.
- Cabeçalho distingue carta finita `z`, carta recíproca `Z=1/z` e coordenada visual compactificada `z-hat`.

## 0.7.0-dev.8 — Rarefaction Visualization

- Closed the visual inspection loop for the reciprocal rarefaction chart `(eta,Z)`.
- Added physical-time arrows to the four infinity half-separatrices: stable branches point toward the saddle and unstable branches away from it.
- Added explicit branch labels `Ws-/Ws+` and `Wu-/Wu+`, saddle label `p∞`, and a labelled projective boundary `Z=0`.
- Preserved the rule that branches on `Z=0` are never fabricated at `zc=+/-1` in the finite chart.
- Added Escape-key dismissal and responsive adjustments to the local-chart dialog.
- Added a regression test for orientation metadata at the math-to-geometry boundary.
- Corrected the application version shown in the header.

## 0.7.0-dev.7 — Documentation Continuity and Solution Spaces

- Distinguished the wave manifold, state space `(u,v)`, and physical space `(x,t)` in the canonical mathematical reference.
- Documented the projections `pi_-` and `pi_+`, the solution map `U(x,t)`, shock trajectories, and the self-similar variable used by future Riemann-solution work.
- Added an incremental user-manual source so validated procedures and interpretation rules are captured during development rather than reconstructed at the end.
- Documented planned ownership for state-space and physical-space modules without claiming those views are already implemented.

# Changelog

## v0.7.0-dev.23.4 — Point notation and inspection marker

- Uses `P ∈ 𝒲` for the currently inspected point of the wave manifold; `𝒲` remains the manifold itself.
- Removes the extra 3D sphere drawn at the selected point after clicking the characteristic surface; clicking still updates the inspected point `P`.
- Updates projection notation to `π₋(P)=U₋` and `π₊(P)=U₊` in UI/help/canonical documentation.

## 0.7.0-dev.5 — Rarefaction Separatrices

- Audited all four local half-separatrices of the reciprocal-chart saddle at projective infinity.
- Preserved reciprocal-chart points as the canonical separatrix representation and made finite-chart projection explicit.
- Fixed the false finite projection of `Z = 0`: boundary branches are no longer collapsed to `zc = ±1`.
- Verified that the two stable branches of the regression preset lie on the projective boundary, while the unstable branches enter opposite `Z` sides.
- Added exact chart-transition tests for the unstable branches.

## 0.7.0-dev.4 — Rarefaction Singularities

- Derived the reciprocal-chart singularity condition at projective infinity.
- Added analytic `infinityRarefactionLinearData` for existence, location, and eigenvalues at `Z = 0`.
- Verified the regression preset has `(eta,Z)=(-1/40,0)` with eigenvalues `(-8,7)`, hence a saddle.
- Added tests separating mathematical classification from compactified rendering.


All notable changes to this project are documented here.

The project follows Semantic Versioning while recognizing that versions below 1.0.0 may evolve their public scientific/API conventions.

## [Unreleased]

## [0.7.0-dev.22] — State Fibres and Characteristic Lifts

- Formalized fixed states `U_*` as points of state space whose inverse images under `pi_-` and `pi_+` are generally curves in the wave manifold.
- Derived pure finite- and reciprocal-chart projection-fibre formulas without introducing Hugoniot or Riemann-solver semantics.
- Completed the full reciprocal wave-coordinate transition with `Upsilon=Y/Z`; the earlier unchanged-`Y` notation is valid only on the characteristic where the jump vanishes.
- Added projective characteristic lifts of a state, including the genuine `Z=0` direction without fake finite `z`.
- Added regression tests for endpoint recovery, chart overlap, characteristic intersections and the projective infinity lift.


## [0.7.0-dev.21] — Foundation Verification

- Audited the seven original pre-Hugoniot foundation commitments with explicit PASS/DEFERRED/FAIL evidence.
- Closed stale documentation after the dev.20 three-space implementation and corrected the LaTeX inclusion of `09-three-spaces.tex`.
- Updated README, roadmap, traceability, architecture and user manual to the actual dev.21 state.
- Recorded only two non-blocking presentation deferrals: camera-pose persistence and exhaustive object-specific tooltips.
- Declared no blocking Foundation FAIL, conditional on the complete local `npm run check`.

## [0.7.0-dev.11] — State Space, Math Typography & Coincidence Continuity

- Preserved a single rarefaction orbit across the coincidence locus: slow/fast labels now apply to segments, not to the whole orbit.
- Added bisection refinement of slow-fast crossings and shares the same refined `E` point between adjacent rendered segments.
- Preserved an `orbitId` across branch changes and marked coincidence transitions in the state-space view.
- Made the state-space plotting area square so equal `(u,v)` spans have true 1:1 screen scale; slow/fast segments also differ by line style.
- Added reusable `MathLabel` and `MathBlock` UI primitives and reorganized mathematical Help with a navigable index.
- Corrected Help notation so `C` is the characteristic surface and `E` is coincidence, and removed the old app as a mathematical justification.
- Updated canonical LaTeX and the incremental user manual with orbit continuity through `E`.


## [0.7.0-dev.9] — State Space

- Added pure canonical projections `pi_-` and `pi_+` from the wave manifold to `(u,v)`.
- Added a geometry-only state-plane adapter and a dedicated state-space inspection dialog.
- The selected `U_-`, `U_+`, and `Ubar` are shown without recomputing wave mathematics in React.
- Added regression tests for the projections, their coincidence on `C`, and the geometry adapter.
- Updated the mathematical reference, roadmap, and incremental user manual.

 — v0.7.0 Mathematical Core

### Added
- Derived the lifted rarefaction field on `\mathcal C` directly from the eigenvector equation and the finite-chart map.
- Added `characteristicSpectrum` to classify regular characteristic points spectrally as slow (`\mathcal C_s`), fast (`\mathcal C_f`) or coincidence (`\mathcal E`).
- Documented the exact cubic equation controlling finite rarefaction singular directions.

### Changed
- Formalized the complete left/right sonic loci by the endpoint determinant conditions and separated their common characteristic component from the nontrivial sonic sheets `\mathcal S^-` and `\mathcal S^+`.
- Added exact determinant-factorization helpers so the code mirrors the documented sonic equations.
- Opened the v0.7.0 development cycle.
- Fixed the canonical notation: `\mathcal C` denotes the characteristic surface and `\mathcal E` the coincidence locus, with `\mathcal E\subset\mathcal C`.
- Added `src/math/characteristic/`; moved the coincidence locus there and moved the characteristic discriminant out of `manifold/waveState.js` into `characteristic/spectrum.js`.
- Added a dedicated LaTeX section deriving `\mathcal C` and `\mathcal E`.
- Formalized the ten-parameter general quadratic flux and its Jacobian in the LaTeX reference.
- Formalized the finite-chart wave-manifold coordinates and the exact meaning of `tau`.
- Derived the reciprocal-chart transition `eta = tau/Z^2 = tau z^2` from the general quadratic fiber equation.

### Tests
- Strengthened chart-transition tests to verify coefficient homogenization and the exact `tau`/`eta` transition.

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

## 0.7.0-dev.6 — Local Chart & Geometry
- Added a geometry adapter between rarefaction mathematics and rendering.
- Added an interactive local `(eta,Z)` chart for the projective saddle at infinity.
- The local chart renders all four half-separatrices directly in reciprocal coordinates.
- Stable branches on `Z=0` remain on the projective boundary and are never collapsed to `zc=±1`.
- Added tests that enforce the math → geometry boundary.

## [0.7.0-dev.10] — Rarefaction in State Space

- Extracted reusable generic rarefaction-orbit integration from the Three.js scene into the mathematical rarefaction layer.
- Projected the same characteristic-surface orbits to `(u,v)` without integrating a second state-space ODE.
- Added slow/fast state-space segments inherited from `C_s` and `C_f`, split at coincidence/undefined points.
- Extended state-space geometry bounds to include projected rarefaction curves.
- Added regression tests for exact projection, characteristic tangency, and branch consistency.
- Updated the mathematical reference and incremental user manual.

## v0.7.0-dev.15 — Geometry/Renderer Boundary
- Move finite-saddle separatrix integration out of `Scene.jsx` into `math/rarefaction/finiteSeparatrices.js`.
- Move sonic-sheet sampling, pole guards, clipping and triangulation out of React into `geometry/sonic/surface.js`.
- Keep Three.js responsible for converting prepared geometry into buffers/materials and rendering it.
- Add regression and architecture tests for the new boundary.

## v0.7.0-dev.16 — Reproducible Experiments
- Add versioned experiment schema `general-wave-manifold-lab/experiment` v1.
- Export/import flux coefficients, domain, selected point, numerical-policy snapshot, visible objects and visual scales as JSON.
- Separate scientific state from presentation state in the serialized format.
- Validate imported experiments and reject unknown schema versions or invalid domains.
- Detect and report numerical-policy mismatches instead of silently claiming exact reproduction.
- Add regression tests for round-trip serialization, validation and numerical-policy compatibility.


## v0.7.0-dev.17 — Scientific UI / Foundation Audit
- Rename experiment `scientific.domain` to the precise `scientific.samplingDomain`; schema v2 migrates dev.16 schema-v1 files on import.
- Rename the UI section from “Domínio” to “Janela de amostragem” and state explicitly that it is not the mathematical domain of `W`.
- Activate semantic UI tokens and provide coherent dark/light presentation themes with persisted local preference.
- Add keyboard focus visibility, reduced-motion handling and final responsive guards.
- Document the scientific UI boundary and close the pre-Hugoniot Foundation completion sequence.

## v0.7.0-dev.20 — Three-Space Solution Framework
- Add the physical solution space `X ≃ R²_(x,t)` as an executable view, not only documentation.
- Connect one already-computed rarefaction orbit across `W -> U -> X` without reintegrating it in downstream views.
- Realize a rarefaction physically only when its characteristic speed is monotone; generic/nonmonotone orbits are explicitly rejected as physical fans.
- Use the self-similar coordinate `xi=x/t=s(U)` for the rarefaction fan, with no claim of a general Riemann solver.
- Allow a physical-space ray to drive the shared wave-manifold selection back to `(tau,0,zc)`.
- Add pure solution and physical-geometry layers plus regression tests.

## 0.7.0-dev.23 — State Fibre Visualization
- Visualiza em `𝒲` as duas pré-imagens `π₋⁻¹(U*)` e `π₊⁻¹(U*)` de um estado fixado em `𝒰`.
- Permite fixar `U*` a partir de `U₋`, `Ū` ou `U₊` do ponto atualmente inspecionado.
- Marca os lifts característicos finitos e os classifica como slow, fast ou coincidence.
- A amostragem e segmentação das fibras pertence à camada de geometria; `Scene.jsx` apenas renderiza os dados preparados.

## v0.7.0-dev.24.3 — View fitting
- Make “Ajustar à geometria” in state space use a robust square 1:1 viewport and include the selected `U*` without letting distant rarefaction outliers dominate the fit.
- Add “Ajustar vista 3D”, which changes only the visual scales `(s_tau,s_Y,s_zc)` using the sampled surfaces plus the robust state-fibre extent.
- Keep the mathematical sampling window and free state fibres unchanged by 3D fitting.


## v0.7.0-dev.24.9 — Hugoniot Branch Decomposition
- Decomposes fixed-state projection fibres into connected regular branches over RP^1.
- Preserves continuation through Z=0 when projective infinity is regular.
- Associates canonical Ps/Pf characteristic lifts to their regular branches without asserting shock admissibility.

## v0.7.0-dev.24.10 — Hugoniot spectral diagnostics
- Adds a pure mathematical diagnostic for the ordered endpoint spectra at `U_-` and `U_+` along a Rankine–Hugoniot state.
- Reports the signed gaps `s-lambda_i(U_-)` and `s-lambda_i(U_+)` without imposing any shock admissibility criterion.
- Exposes the diagnostic in the point-inspection panel as groundwork for a later, explicitly chosen admissibility model.
- Adds regression tests for eigenvalue ordering, speed gaps, and characteristic-limit consistency.

## v0.7.0-dev.24.11 — Hugoniot Spectral Regions
- Partitions each regular fixed-state Hugoniot branch by the spectral signature of the Rankine–Hugoniot speed at both endpoint states.
- Refines transition events to equalities `s = lambda_i(U_-)` or `s = lambda_i(U_+)`.
- Keeps the construction diagnostic: no Lax/Liu or other shock-admissibility criterion is imposed.
- Samples projective direction by angle, independently of the 3-D visualization window.


## v0.7.0-dev.24.12 — Spectral Region Inspection
- Adds an on-demand scientific inspector for the spectral regions of the forward and backward fixed-state Hugoniot fibres.
- Reports each regular branch, its spectral signature at `U_-` and `U_+`, sampled `z` interval, and refined characteristic boundaries `s=lambda_i(U_±)`.
- Keeps spectral classification strictly diagnostic; no Lax, Liu, or other shock-admissibility criterion is inferred.
- Leaves the approved sampling windows and visual scales unchanged.

## v0.7.0-dev.24.15 — State roles and saturation foundation
- Formaliza U* como estado genérico, sem papel esquerdo/direito intrínseco.
- Formaliza (UL,UR) como dados globais orientados do problema de Riemann.
- Formaliza U-(P), U+(P) como estados locais móveis.
- Introduz sementes puras para sat_forw(Gamma) via pi_- e sat_back(Gamma) via pi_+; o meshing da saturada fica para a camada numérica/geométrica posterior.

## v0.7.0-dev.24.21 — Numerical Composite Trace
- Added pure finite-chart intersection of each rarefaction-generated Hugoniot leaf with the canonical non-trivial sonic sheet.
- Added continuation preserving the correspondence `P(sigma) -> Q(sigma)`, rather than treating composite points as an unordered cloud.
- Projective-infinity intersections are deliberately deferred to reciprocal-chart continuation; no fake finite point is introduced.


### v0.7.0-dev.24.22 — Projective Composite Continuation
- Composite leaf intersections now use both the finite z chart and the reciprocal (eta,Upsilon,Z) chart.
- Sonic membership is evaluated directly in reciprocal coordinates at Z=0; no fake finite z/tau/Y point is created at projective infinity.
- Finite and reciprocal roots are deduplicated by projective direction, preserving the source-rarefaction to composite correspondence.

### v0.7.0-dev.24.23 — Composite branch decomposition
- Decomposes the discrete composite trace into continuous projective branches.
- Uses one-to-one matching only between consecutive rarefaction samples; roots that disappear terminate a branch rather than creating artificial bridges.
- Supports finite and reciprocal-chart intersection records.

### v0.7.0-dev.24.24 — Composite numerical certification
- Certifies each traced composite point independently against the target sonic sheet and the generating Hugoniot fibre.
- Records separate sonic and fixed-state residuals without changing branch topology.

## v0.7.0-dev.24.36 — Implicit Sonic Geometry
- Replaced explicit sonic rendering `Y=±2K/det M` by direct level-set extraction of `Phi_-=Y det M-2K=0` and `Phi_+=Y det M+2K=0` using marching tetrahedra.
- The renderer no longer divides by `det M`; therefore the `K=det M=0` degeneracy is retained instead of cut out.
- Added the inflection locus `J: Y=0, K=0` and double-sonic locus `DS: K=0, det M=0, Y!=0` to sonic geometry.
- For the Wave Manifold preset, two double-sonic vertical lines are recovered and Newton-refined to residuals near machine precision.
- Composite endpoint diagnostics now test proximity to `DS`; in the current preset none of the 12 remaining root-disappearance endpoints is close to the recovered double-sonic lines, so those endpoints remain an independent issue.

## 0.7.0-dev.24.47.41
- Added offline `audit:sonics:upper-boundary` comparing the upper compactified boundary at nZ=50 and nZ=100, including mixed boundary-edge endpoints, geometric lengths, distances to domain boundary, and implicit residuals.
- Kept production sonic triangulation and Worker unchanged.

### Certificação matemática adicional (dev.24.47.58, sem mudança de versão)
- Acrescentados 12 testes em `tests/canonicalCertification.test.js`, cobrindo fluxo, jacobiano, RH, cartas, sônicas e rarefação para três conjuntos de parâmetros.
- Expandida a matriz `docs/MATH_CODE_TRACEABILITY.md` com escopo, testes e pendências explícitas.
- Nenhuma alteração de geometria, renderização ou equações de produção.

### Etapa 4 — diagnósticos do integrador (dev.24.47.58, versão mantida)
- RK4 adaptativo informa explicitamente aceitação forçada no passo mínimo.
- Opção estrita `minimumStepPolicy: 'reject'` sem alteração do padrão de produção.
- Quatro testes adicionais de política de parada.

### Certificação numérica complementar (desenvolvimento v0.7.0)
- Oito testes novos para raízes múltiplas, degenerescências de equilíbrios no infinito e critérios de continuidade de ramos.
- Documentadas as limitações de multiplicidade, discretização e ausência de certificação global de bifurcações.
- Sem mudanças nas rotinas geométricas ou de produção.

### Numerical root diagnostics (development)
- Added opt-in polynomial multiplicity/tangency diagnostics for degree <= 3.
- Added conservative root-count event diagnostics for continuation samples.
- Added six tests; no production geometry or rendering changes.

### Auditoria adicional de raízes próximas (dev.24.47.58)
- Diagnósticos opt-in de sensibilidade a perturbações do termo constante e amostras de continuação.
- Testes para tangências, raízes próximas e eventos não classificados.
- Sem mudanças nos resolvedores e renderizadores de produção.

- v0.7.0-dev.24.47.58 (auditoria de continuação): função opcional
  `auditCompositeContinuation` para rastrear mudanças de contagem e
  correspondências potencialmente ambíguas nas curvas compostas, sem
  alterar o matching de produção; quatro testes novos.

- Integração opcional da auditoria de continuação ao pipeline das curvas compostas, sem alterar a geometria.

- Painel científico compacto para auditoria de continuação de 𝒦₋ e 𝒦₊, com contagem de eventos não classificados e certificação detalhada expansível. Três testes adicionais; nenhuma alteração na geração geométrica.

- Etapa 5 (parcial): isolado adaptador Three.js da malha sônica em `src/rendering/sonicBufferGeometry.js`; ver `docs/architecture/GEOMETRY_RENDERER_AUDIT.md`.

- Etapa 5 (curvas): adaptador puro `src/rendering/curvePoints.js` para coordenadas das curvas e substituição das alocações manuais de `BufferGeometry` por `<Line>`; quatro testes de regressão arquitetural.

- Etapa 5 (Worker): limpeza explícita de handlers e timers no ciclo de vida do Worker sônico; validação de respostas por identificador/chave extraída para adaptador testável. Sem mudanças de geometria ou aparência.

## v0.7.0-dev.24.47.58 — Graphic resource lifecycle audit

- Memoize and dispose characteristic boundary and coordinate axes GPU resources.
- Dispose the temporary source plane after generating the characteristic border edges.
- Centralize cleanup of geometry and axes helper; add three focused lifecycle tests.
- Preserve scientific geometry and existing sonic worker behavior.

### Etapa 5 — Estresse do ciclo de vida (dev.24.47.58)
- Adicionados testes para 500 atualizações consecutivas de parâmetros sônicos e 500 ciclos de descarte de geometrias, materiais e Workers.
- Nenhuma alteração nas equações, na triangulação ou na renderização de produção.
- Testes Node: 223/223; validação GPU/navegador ainda pendente.

### Etapa 5/6 — protocolo de navegador e tokens de inspeção
- Adicionado `docs/architecture/BROWSER_VALIDATION_PROTOCOL.md` com critérios de aceite de GPU e mudanças rápidas de parâmetros.
- Diagramas locais e overlays passam a consumir tokens semânticos de tema; nenhuma mudança matemática ou de geometria.

## Etapa 6 — controles e responsividade (08/10/2026)
- Introduzido `src/styles/scientific-ui.css` para controles, foco acessível, painel de auditoria, diálogos e layout móvel.
- Adicionados três testes de regressão estrutural da camada de estilos.
- Nenhuma alteração nos cálculos, na triangulação ou nas cores científicas.

- Etapa 6: harmonização temática e responsiva das janelas de ajuda, carta local e regiões espectrais; títulos acessíveis e testes de regressão. Sem mudanças na geometria científica.

### Etapa 6 — tipografia matemática e estados (revisão incremental)
- Padronizada a legibilidade dos blocos KaTeX e sua rolagem horizontal em telas estreitas.
- Harmonizados estados de controles expandidos, inválidos e desabilitados; alinhadas as opções de visibilidade.
- Sem alterações em dados científicos, geometria, materiais Three.js ou cores de trajetórias.

### Etapa 6 — auditoria de notação matemática
- Rótulos matemáticos da inspeção principal convertidos para o componente KaTeX existente `MathLabel`.
- Adicionada auditoria em `docs/ui/MATH_NOTATION_AUDIT.md` e testes de regressão; sem alterações matemáticas ou geométricas.

### Espaço de estados: seleção interativa de dados de Riemann
- Introduz U_L e U_R independentes de U* com clique, arraste, teclado e campos numéricos.
- Mantém a geometria científica e as rotinas de solução existentes inalteradas.

- Diagnóstico de multiplicidade projetiva de direções características, inclusive carta recíproca; não equivale à tangência geométrica da fibra.

- Análise diferencial desingularizada de Rankine–Hugoniot nas cartas finita e recíproca, com cinco testes de regressão.

## Fundamentação antes da construção geométrica — 20/10/2026

A direção editorial passa a exigir definição na teoria de origem, seleção clássica ou não clássica quando aplicável, construção intrínseca, demonstração da correspondência, degenerações e realização física antes do algoritmo. O contrato e o mapa dos objetos dos 26 capítulos estão em docs/FUNDAMENTACAO_E_CONSTRUCAO.md. Foram acrescentadas definições de pré-imagem, levantamento, saturação por fibras e interseção ao capítulo da variedade; a admissibilidade foi separada de extensões geométricas nos capítulos de entropia e compostas. LeFloch foi incorporado como referência de trabalho com alcance da consulta explícito. A leitura detalhada do livro e a revisão por resultado continuam pendentes.

## Terminologia: construção tradicional e construção topológica — 20/10/2026

Uniformizados os capítulos, títulos do aplicativo e guia de notação: a construção tradicional em leis de conservação abrange as teorias clássica e não clássica de LeFloch; a construção sobre a Variedade de Ondas é denominada topológica. Preservado o significado técnico de solução clássica para regularidade da EDP. A admissibilidade escolhida deve ser preservada ao passar entre as construções.

## Camada tradicional antes da construção topológica — 20/10/2026

Criada uma referência autônoma em docs/traditional/, com formulação fraca, espectro, rarefações, contatos, Hugoniot, Lax, Liu, entropia, sonicidade, compostas, perfis regularizados, relação cinética e montagem física do problema de Riemann. Inclui deduções explícitas e uma proposição condicional para a resolução local do estado intermediário. A ordem de revisão foi atualizada: base tradicional primeiro, camada topológica depois. Preservados os capítulos existentes. A revisão por teorema e a seleção cinética específica permanecem abertas; não se declara solver global para os dez parâmetros.

## Consolidação das cadeias tradicionais — 20/10/2026

Criado docs/traditional/CADEIAS_E_ADMISSIBILIDADE.md com registro de ondas, condições de fechamento, ordenação, tratamento de interfaces coincidentes, catálogo de padrões e matriz de critérios. Inclui quatro cadeias exatas do fluxo triangular, prova de Liu para os ramos especificados, contato e junção sônica, proposição de colagem e rastreabilidade dos limites do aplicativo. A consolidação é documental; não implementa busca geral nem determina uma relação cinética para o fluxo geral.

## Ampliação do catálogo de blocos — 20/10/2026

A lista inicial de cadeias era restrita: acrescentada a matriz formal dos 16 pares R, S, C e K, regras para cadeias maiores e distinção entre decomposição em blocos e perfil físico. Incluídos exemplos exatos C–C para um fluxo linear pertencente à família implementada e K–K/R–K para um fluxo cúbico didático explicitamente fora do escopo quadrático do aplicativo. Conferidos RH e produções entrópicas dos novos choques; os exemplos não implicam cobertura do solver.

## Revisão de resultados e regimes tradicionais — 20/10/2026

Localizada a referência CW-01, §6.1, para as curvas de ondas e o teorema clássico local. Acrescentadas deduções dos ramos de pequenos choques e da produção entrópica, tabela de padrões locais por famílias e limites dos regimes degenerados. A classe não clássica escolhida pelo usuário é difusão–dispersão com coeficientes a definir. Documentada a equação geral de perfil e um ramo cúbico escalar explícito com RH, perfil e produção entrópica verificados. O estudo não determina uma cinética universal para os dez coeficientes. Novos script e testes reproduzem as identidades de três escolhas de parâmetros.

## Nove tipos de salto e contrato das 16 cadeias — 20/10/2026

Consolidada a classificação dos nove interiores espectrais da imagem fornecida, com desigualdades, orientação, número de características incidentes, exclusões sônicas e separação de admissibilidade. A origem bibliográfica da imagem não foi identificada e não é atribuída a LeFloch. Criados nove exemplos quadráticos exatos de RH, com script e testes. O contrato IMPLEMENTACAO_16_CADEIAS.md define dados, construtores, equações de fechamento, disponibilidade por regime, resultados dos critérios e sequência de implementação nos estados. Nenhuma busca geral ou correção de classificador de produção foi implementada nesta etapa documental.

## Espaço de estados: configurações estritas e RR — 20/10/2026

Implementado o classificador dos nove interiores espectrais, separado das fronteiras sônicas e da admissibilidade. Corrigido laxClass2x2 para exigir espectros completos e rejeitar coincidências e igualdades dentro da tolerância. O diagnóstico direto e as regiões espectrais apresentam a configuração. Acrescentados candidatos RR por interseções de curvas integrais amostradas, com dois leques, avaliação física, proveniência e seleção compartilhada entre os ambientes. Comparação e agrupamento não inventam choques para RR. Contatos e composição geral de K permanecem pendentes; esta etapa não implementa os 16 padrões nem certifica entropia.

## Espaço de estados: contatos de direção constante — 20/10/2026

Acrescentados RC, SC, CR, CS e CC para modelos de contato com direção própria e velocidade constantes. O critério verifica o núcleo comum dos coeficientes quadráticos e a equação própria da parte linear, com tolerâncias explícitas. SC/CS podem ser resolvidos diretamente pela equação afim de RH na reta de contato. Os candidatos são compartilhados entre estados e físico, com contatos roxos, traços separados e nenhuma interpolação através das interfaces. A janela de estados agora pode ser criada dos dados de Riemann sem um ponto regular da variedade. Contatos de direção variável, amplitudes nulas, incidências não isoladas e composição geral de K permanecem fora desta ampliação.

## Compostas nos estados e correção recíproca — 20/10/2026

Acrescentada busca local de pares com K, usando parceiros sônicos de amplitude finita calculados diretamente nas equações quadráticas de RH. K lento usa R–S e K rápido usa S–R; as interseções de blocos são refinadas em parâmetros locais e todos os segmentos são reavaliados. Casos quadráticos RK/KR/SK/KS possuem testes positivos; CK/KC/KK continuam sem fixture positiva validada. A representação física preserva os segmentos internos e o traço direito nas junções sônicas. No plano, segmentos de referência entre extremos de choques não são apresentados como curvas de Hugoniot.

Corrigido o resíduo de compositeTrace: avaliação direta de PhiHat, inclusive em Z=0 regular, em vez de Z²Phi e continuação simétrica. Bisseções não aceitam apenas largura pequena. A regressão do falso certificado da fronteira foi reproduzida e passou a ser rejeitada. Não há certificação entrópica, cinética ou de completude global.
