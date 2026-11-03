# Fase 14.42 — Recorte geométrico das superfícies de Hopf

## Motivação

A fase 14.41 descartava os vértices da folha `tr(DF(U±)-sI)=0` que estivessem fora da janela `YMin ≤ Y ≤ YMax` **antes** de triangular. Assim, qualquer triângulo com um único vértice exterior era eliminado integralmente, criando buracos artificiais próximos das bordas do gráfico.

## Mudança

`src/geometry/hopf/surface.js` agora conserva os vértices regulares mesmo fora da janela, constrói cada triângulo da malha paramétrica `(τ, ẑ)` e aplica recortes sucessivos, interpolando as arestas:

1. `det(DF(U±)-sI) ≥ 0` (região de Hopf e fronteira BT);
2. `Y ≥ YMin`;
3. `Y ≤ YMax`.

Triângulos degenerados são removidos. A geometria continua compartilhando a mesma equação matemática e o mesmo componente `HopfSurfaces` da fase anterior. Nenhum novo cálculo de Hugoniot é introduzido.

## Limitações matemáticas e numéricas

- A fronteira `det=0` é uma aproximação linear por triângulo de `BT±`; pontos interpolados não são raízes exatas da equação não linear.
- Quando `tr(directionalJacobian(z))=0`, a representação `Y=Y(τ,ẑ)` é singular; **não** se conecta a malha através dessa singularidade. Uma carta alternativa ou extração implícita é necessária para resolver essa região.
- A malha é uma aproximação poligonal: recortes de triângulos podem afastar-se ligeiramente da folha exata `tr=0`.
- A tangência de `Δ±=0` e `det M±=0` em BT segue da identidade `dΔ±=2tr(M±)dtr(M±)-4d(det M±)`; para falar em planos tangentes regulares é necessário que o gradiente do determinante não se anule.
- Esta fase **não** demonstra cobertura completa da superfície Hopf, nem a continuidade nas cartas projetivas de infinito.

## Verificação

`node --test tests/hopfGeometry.test.js`

Verificar localmente também `npm run check` e a visualização interativa nas bordas Y da janela, principalmente onde a folha de Hopf entra e sai da região visível.

## Referência

Plohr et al., *Wave Manifold for Quadratic Models*, seções 3.5–3.6 e 4.8 (documento fornecido pelo pesquisador).
