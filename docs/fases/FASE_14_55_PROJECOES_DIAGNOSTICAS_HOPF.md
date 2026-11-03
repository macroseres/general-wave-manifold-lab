# Fase 14.55 — Projeções diagnósticas da malha recíproca

A imersão da fase 14.54 fornece `(ubar_u, ubar_v, X, Z)` em R4. Esta fase acrescenta duas projeções lineares de diagnóstico:

- **state-amplitude**: `(ubar_u, ubar_v, X)`, guardando `Z` em `omitted`.
- **state-direction**: `(ubar_u, ubar_v, Z)`, guardando `X` em `omitted`.

Ambas estão definidas em `Z=0`. A saída conserva `positions4` e `indices` originais, para inspeção de eventual autointerseção na projeção. Não se deve confundir nenhuma delas com as coordenadas visuais `(tau,Y,zc)`. A projeção de uma variedade de dimensão 3 ou de uma superfície imersa em R4 para R3 pode identificar pontos distintos; portanto, preservar índices não demonstra que o atlas possa ser costurado sem singularidades ou sobreposições. Não houve alteração da cena 3D.

## Próximo passo

Estabelecer um atlas de visualização com transição explícita, limites de validade das cartas e política de representação de `Z=0`, e só então adicionar a opção de inspeção à cena, sem substituir o retrato existente.
