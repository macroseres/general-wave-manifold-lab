# Roadmap

## Direção científica e leitura do histórico

A fase tradicional encontra-se na **auditoria final GWML-T08** do plano fechado T01–T08; consultar a matriz de 16 entradas em [STATE_SPACE_STATUS.md](STATE_SPACE_STATUS.md). A passagem à investigação geométrica/topológica ocorrerá após a validação e o encerramento formal da T08. O catálogo das [16 combinações](traditional/IMPLEMENTACAO_16_CADEIAS.md) não implica existência de solução para todos os dados. A [classificação dos nove saltos](traditional/CLASSIFICACAO_DOS_SALTOS.md) deve ser independente da seleção e tratar fronteiras explicitamente. A disponibilidade dos construtores e a cobertura científica devem ser registradas por padrão; o catálogo não implica 16 soluções para cada dado inicial.

Prioridade de documentação atualizada: desenvolver e revisar primeiro a [construção tradicional](traditional/README.md), com suas teorias clássica e não clássica, nos espaços de estados e físico. A camada topológica será consolidada depois, objeto por objeto. A referência tradicional autônoma já foi escrita como base de revisão; os teoremas locais citáveis e a seleção cinética específica permanecem pendentes. O material topológico existente foi preservado.

O objetivo central é construir e visualizar na Variedade de Ondas as soluções do problema de Riemann, em correspondência com os espaços de estados e físico, e estudar suas classificações por parâmetros. O escopo e os critérios de cobertura estão em [OBJETIVOS_E_ESCOPO.md](OBJETIVOS_E_ESCOPO.md).

As versões abaixo registram etapas históricas e planos; não são um inventário completo do estado atual. Já existem construções numéricas de compostas e cadeias candidatas em `src/math/solution/`, além da vista de estados e de realizações físicas. Isso não significa encerramento da validação científica ou cobertura global das soluções.

Prioridade atual: consolidar a documentação e sua rastreabilidade; registrar referências e hipóteses das construções no espaço de estados; desenvolver e validar seus levantamentos à variedade e a correspondência física; ampliar a classificação por parâmetros. A migração dos textos exibidos está concluída nas 26 seções; permanecem a revisão bibliográfica, a inspeção visual e as validações científicas indicadas na rastreabilidade.

## Integração interativa tradicional — quatro entregas (27/10/2026)

Conjunto fechado solicitado pelo responsável, posterior ao ciclo histórico T01–T08. A prioridade é escolher estados no gráfico, construir candidatos, selecionar e inspecionar a cadeia completa, independentemente da visualização da Variedade de Ondas.

- **Entrega 1 — auditoria:** concluída e aprovada; constatadas lacunas na construção explícita, seleção, relatórios e representação completa dos segmentos.
- **Entrega 2 — integração:** ação Construir/reconstruir, posicionamento gráfico explícito, invalidação por dados do problema, inspeção e comparação por ondas, relatórios disponíveis sem candidatos, enquadramento de todos os segmentos e camada independente de arcos de choque. Reutiliza os construtores e a continuação RH existentes. Hugoniot da variedade permanecem associadas às projeções π e têm visibilidade separada.
- **Entrega 3 — validação funcional e matemática:** preserva os casos positivos e negativos existentes; a verificação de integração passou com lint, 837 testes e build. Não equivale a certificação matemática global nem validação positiva de CK/KC/KK.
- **Entrega 4 — documentação e encerramento:** instruções de uso, arquitetura da integração, evidências e limites registrados em `STATE_SPACE_STATUS.md`. O encerramento deve refletir o alcance efetivamente verificado; nenhuma nova tarefa ou funcionalidade da variedade foi aberta.

Consulte [o registro da integração](STATE_SPACE_STATUS.md) para uso, evidências e limitações.

**Correção após retorno do responsável (28/10/2026):** a exploração agora mostra os ramos de choque de U_L e U_R antes da construção de candidatos, com controles próprios em Choques. O desenho continua independente das Hugoniot projetadas e usa RH e Lax de extremos, sem certificação entrópica. A regressão reproduz os estados e coeficientes da captura que revelou a lacuna.

## Plano finito de encerramento da construção tradicional — GWML-T01 a T08 (27/10/2026)

**Finalidade:** encerrar a fase de construção tradicional das soluções de Riemann para o fluxo quadrático geral de dois estados, nos espaços de estados e físico, em **escopo numérico e matemático explicitamente delimitado**. A investigação topológica na Variedade de Ondas constitui uma fase posterior, não uma condição para fechar este plano. Esta seção prevalece como controle das tarefas GWML; não substitui as especificações matemáticas de `traditional/`.

### Três objetivos e entregas finais

1. **Construção no espaço de estados:** representar os blocos R (rarefação), S (choque), C (contato) e K (composta), seus ramos, estados intermediários e equações de fechamento; manter o catálogo formal das 16 combinações, com disponibilidade e limitações por regime.
2. **Classificação e admissibilidade:** separar conservação/RH, espectro, nove tipos de salto e fronteiras sônicas, Lax, Liu, pares de entropia, perfis regularizados, cinética e ordenação física. Cada critério só poderá ser declarado verificado sob hipóteses, domínio e evidência próprios. A ausência de uma relação cinética definida para o fluxo quadrático geral deve ser apresentada como **modelo não especificado**, não como aprovação ou reprovação.
3. **Realização no espaço físico:** reconstruir o perfil autossimilar `U(x,t)` a partir da **mesma cadeia validada** nos estados, com choques, contatos, leques, patamares, compostas desdobradas e tratamento de velocidades coincidentes; não fabricar trechos físicos quando a construção for inconclusiva.

### Tarefas numeradas — conjunto fechado

| Tarefa | Objetivo | Entregas delimitadas | Critério de encerramento |
|---|---|---|---|
| **GWML-T01** | Preparação | Auditoria da construção tradicional e identificação de lacunas | **Encerrada** conforme histórico do projeto |
| **GWML-T02** | 1 e 3 | Cadeia RR: corretor conjunto, leques reintegrados, realização física e testes | **Encerrada** em escopo numérico delimitado |
| **GWML-T03** | 1 e 3 | Cadeias RS, SR, SS: correção, reconstrução, diagnósticos e CI | **Encerrada**; registro em `STATE_SPACE_STATUS.md` |
| **GWML-T04** | 1 | Consolidar e validar RC, SC, CR, CS, CC **apenas para contatos de direção e velocidade constantes**, já implementados; conferir fechamento, orientação, degenerescência linear, casos negativos e integração nos estados | Cinco padrões com evidência reproduzível e limites explícitos; contatos de direção variável ficam fora deste marco |
| **GWML-T05** | 1 | Consolidar RK, KR, SK, KS e revisar CK, KC, KK, sem pressupor casos positivos inexistentes; verificar definição interna de K, junções sônicas, RH, ramos e ordenação; registrar cobertura por padrão | Sete entradas K com disponibilidade e diagnósticos verificáveis; casos sem exemplo quadrático positivo permanecem **não validados**, sem bloquear o fechamento |
| **GWML-T06** | 2 | Integrar a classificação dos nove saltos e fronteiras com os registros separados de RH, Lax, Liu, entropia, perfis e cinética, preservando `não avaliado`, `inconclusivo` e `não aplicável`; testar violações e não inferir admissibilidade de amostragem | Diagnósticos coerentes e testados nos casos suportados; nenhuma alegação de certificação geral; modelos físicos não parametrizados identificados explicitamente |
| **GWML-T07** | 3 | Revisar a realização física das 16 entradas do catálogo **quando construtíveis**, incluindo desdobramento de K, contatos, bordas coincidentes, amplitude nula, ordenação, seleção compartilhada entre vistas e exemplos negativos | Perfis reprodutíveis para casos suportados, sem perfis fictícios para entradas inconclusivas; testes de consistência estados–físico |
| **GWML-T08** | 1, 2 e 3 | Validação integrada e encerramento: matriz final das 16 entradas, rastreabilidade definição→código→teste→vista, execução de lint/test/build e registro das exclusões científicas | Relatório único de cobertura delimitada, verificações automatizadas aprovadas e decisão explícita de encerramento da fase tradicional |

**Regra de execução:** T04–T08 são tarefas **planejadas, não autorizadas nem iniciadas** por este registro. Uma tarefa por vez; nenhuma implementação sem autorização específica. Testes, correções e documentação necessários à entrega permanecem dentro da tarefa correspondente; não recebem novos números GWML-T. Não subdividir automaticamente em T09, T10 etc.

**Regra de parada:** após a decisão de fechamento da **T08**, a fase tradicional termina. Não há T09 prevista. Defeitos que impeçam critérios aprovados devem ser corrigidos **dentro da tarefa aberta**; problemas fora do escopo ficam no relatório final como limitações ou futuras pesquisas, sem reabrir automaticamente a fase. Qualquer mudança do conjunto fechado exige decisão explícita do responsável, com justificativa e revisão deste plano **antes** de executar.

**Limites científicos:** a matriz de 16 entradas é um catálogo formal, não um teorema de existência ou completude. A classificação dos nove saltos não equivale a admissibilidade. Fluxos degenerados, regiões não hiperbólicas, contatos de direção variável, completude global, unicidade geral e seleção cinética ainda não definida não serão declarados resolvidos. O fechamento significa **implementação e validação no domínio documentado**, não solução de todos os problemas matemáticos.

**Referências operacionais:** [contrato das 16 cadeias](traditional/IMPLEMENTACAO_16_CADEIAS.md), [cadeias e admissibilidade](traditional/CADEIAS_E_ADMISSIBILIDADE.md), [classificação dos saltos](traditional/CLASSIFICACAO_DOS_SALTOS.md), [estado da implementação](STATE_SPACE_STATUS.md) e [objetivos científicos](OBJETIVOS_E_ESCOPO.md).

## v0.6.0 — Foundation

- Repository hygiene and GitHub CI.
- Scientific architecture and numerical conventions.
- Decomposition of the original mathematical core into domain modules.
- Compatibility facade for the pre-refactor API.
- LaTeX reference structure and ADR workflow.
- Scientific design tokens without changing current behavior.
- Preserve the existing mathematical regression suite.

## v0.6.x — Foundation maintenance

- Fix regressions only; avoid adding new mathematical scope.
- Complete formula-by-formula verification of the legacy mathematical notes before declaring the LaTeX reference authoritative.
- Consolidate named numerical tolerances where this can be done without changing results.

## v0.7.x — Mathematical core

- Formalize the public flux/model interface beyond the current quadratic preset.
- Expand invariant/residual tests for the general quadratic flux.
- Make chart-transition conventions and the meaning of the current `tau` coordinate explicit in the mathematical reference.
- Retire compatibility-facade imports from new code; keep the facade only for migration until removal is explicitly versioned.

### v0.7.0-dev.9 — State space

- [x] Implement canonical `pi_-` and `pi_+` projection functions.
- [x] Add a dedicated `(u,v)` view for the selected point `P` of the wave manifold.
- [x] Keep state-space rendering downstream of math and geometry adapters.
- [x] Document that complete wave curves will be projected from validated wave objects, not recomputed by the view.
- [ ] Add complete rarefaction/Hugoniot/composite curves when their reusable mathematical representations are available.

### v0.7.0-dev.8 — Rarefaction visualization

- Close the rarefaction block visually without changing its validated mathematics.
- Show all four infinity half-separatrices in the reciprocal local chart with physical-time orientation and branch identity.
- Keep projective-boundary branches out of the finite chart when no finite representative exists.
- Keep visualization components downstream of math and geometry adapters.

### v0.7.0-dev.7 — Documentation continuity and solution spaces
- [x] Distinguish wave manifold `W`, state space `(u,v)`, and physical space `(x,t)`.
- [x] Document `pi_-`, `pi_+`, and the future solution map `U(x,t)`.
- [x] Start an incremental user-manual source alongside the mathematical and technical documentation.
- [x] Implement the dedicated state-space view after its mathematical/geometry interface is specified and tested (implemented in dev.9).
- [ ] Implement physical-space Riemann solutions only after the required wave constructions are validated.

## v0.8.x — Geometry and local analysis

- Introduce `src/geometry` and separate sampling/meshing from equations.
- Strengthen local-chart inspection, singularity classification and separatrix validation.
- Prepare compactification/blow-up infrastructure.
- Add reproducible experiment/state export.

## v0.9.x — Wave constructions

- Hugoniot families and projections.
  - [x] Fixed-state forward/backward fibres and global chart continuation.
  - [x] Spectral regions, signatures and strict Lax classification.
  - [x] Lax-class geometry in the wave-manifold view.
  - [x] Project the same classified Hugoniot segments to state space with explicit `pi_-` / `pi_+` choice.
  - [x] Close the Hugoniot block before starting composite-wave saturation (dev.24.19).
- Composite-wave constructions.
  - [x] Fix canonical forward/backward saturation definitions and the constructions `K_- = sat_forw(R) ∩ S^-`, `K_+ = sat_back(R) ∩ S^+` (dev.24.20).
  - [ ] Build numerical saturation leaves independently of rendering.
  - [ ] Continue the sonic intersections as composite curves and validate branch selection.
  - [ ] Project validated composite curves to state/physical views only after mathematical closure.
- Additional sonic/hysteresis/Hopf objects only after their definitions are documented and tested.

## v1.0.0

Stable mathematical conventions, reproducible experiments, documented architecture, validated core objects and a stable research workflow.

### v0.7.0-dev.6 — Local chart and geometry
- [x] Introduce a geometry layer independent of React/Three.js.
- [x] Inspect the infinity saddle directly in `(eta,Z)`.
- [x] Preserve all four local half-separatrices without fake finite-chart projection.

### v0.7.0-dev.10 — Rarefaction in state space
- [x] Reuse one mathematical representation of generic rarefaction orbits in both global and state-space views.
- [x] Project rarefaction orbits from `C` to `(u,v)` rather than reintegrating them.
- [x] Preserve the spectral slow/fast classification as `R_s` and `R_f` segments.
- [x] Test projected tangency to the selected characteristic eigendirection.

### v0.7.0-dev.11 — State-space and notation polish
- [x] Preserve a single rarefaction orbit through `E` while changing slow/fast segment classification.
- [x] Refine coincidence crossings numerically and share the event point between adjacent segments.
- [x] Enforce a square 1:1 `(u,v)` plotting region and distinguish slow/fast by line style as well as color.
- [x] Introduce reusable mathematical-label/block UI primitives.
- [x] Synchronize Help with canonical `C`/`E` notation and current general-flux derivations.

- [x] Renderização matemática real via KaTeX e polimento final da vista de estados (dev.12).

### v0.7.0-dev.13 — Scientific traceability
- [x] Map canonical definitions to implementation, tests, geometry and UI.
- [x] Protect math/geometry dependency boundaries with executable architecture tests.
- [x] Audit numerical constants/integrators and renderer-side scientific work.
- [x] Record remaining Foundation work explicitly before Hugoniot.

### Foundation completion sequence
- [x] dev.14 — numerical policy and integration ownership.
- [x] dev.15 — geometry/renderer boundary, including sonic meshes and finite separatrices.
- [x] dev.16 — reproducible experiment serialization/import.
- [x] dev.17 — final scientific UI/Foundation audit.
- [x] dev.18 — canonical mathematics closure and traceability refresh.
- [x] dev.19 — adaptive numerics with error control, events and convergence tests.
- [x] dev.20 — synchronized three-space solution framework `W <-> U <-> X`.
- [x] dev.21 — final Foundation Verification with explicit PASS/DEFERRED/FAIL audit.
- [x] dev.22 — state fibres and characteristic lifts, including the full reciprocal jump-coordinate transition.
- [ ] dev.23 — multi-space solution model as unions of validated wave segments; no general Riemann solver claim.
- [x] Hugoniot block subsequently implemented and formally closed in dev.24.19; see `HUGONIOT_VERIFICATION.md`.

### Foundation Completion — dev.15
- [x] Move finite-saddle separatrix integration out of `Scene.jsx`.
- [x] Move sonic-sheet sampling/clipping/triangulation to `geometry/`.
- [x] Add renderer-boundary regression guard.
- [x] dev.16: reproducible experiment schema and import/export.

### v0.7.0-dev.20 — Three-space solution framework
- [x] Make `W`, state space `U`, and physical space `X=(x,t)` executable views of shared mathematical data.
- [x] Build physical rarefaction fans from already-computed characteristic orbits; do not integrate a second physical-space ODE.
- [x] Require monotone characteristic speed before admitting a rarefaction orbit as a self-similar physical fan.
- [x] Add reverse selection from a physical ray to its wave-manifold coordinate.
- [x] Keep a general Riemann solver explicitly out of scope until Hugoniot/composite waves are validated.

### v0.7.0-dev.23 — State Fibre Visualization
Status: implemented; local user validation pending.

- Render `pi_-^{-1}(U*)` and `pi_+^{-1}(U*)` in the wave-manifold view from a state `U*` fixed in state space.
- Mark finite characteristic lifts and their slow/fast/coincidence classification.
- Keep fibre mathematics in `src/math/state/fibers.js`, sampling/display geometry in `src/geometry/state/fibreGeometry.js`, and Three.js restricted to rendering.
- This increment does not introduce Hugoniot loci or a Riemann solver.

### dev.24.21 — Numerical composite trace
Finite-chart leaf/sonic intersections and branch continuation are implemented in the mathematical layer. Reciprocal-chart continuation, exceptional sonic cases, geometry and rendering remain subsequent steps.


- [x] dev.24.22: projective continuation of composite traces through the reciprocal chart, without fake finite infinity points.
