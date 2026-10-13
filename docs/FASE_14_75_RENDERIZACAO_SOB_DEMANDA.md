# Fase 14.75 — Geometria sob demanda

- Não monta `SonicSurfaces` quando a visualização está isolada em Hopf, característica ou traço de Hopf. Isso evita iniciar o Worker das sônicas e o processamento espectral correspondente.
- Particiona cada lado da sônica somente quando o lado está visível.
- Executa a suavização numérica das curvas BT somente quando BT e o lado correspondente estão visíveis.
- Não altera fórmulas matemáticas, malhas ou resolução das superfícies Hopf.

## Limitação

As superfícies Hopf ainda são calculadas na thread principal. Portanto, esta alteração reduz trabalho desnecessário, mas não garante eliminar toda a latência de Hopf. Recomenda-se medir `hopfImplicitSurfaceMesh` e `reciprocalWindowHopfMesh` com o profiler antes de alterar seus algoritmos.
