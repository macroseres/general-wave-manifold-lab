# Auditoria de erro geométrico — dev.24.47.51

Caso: `a20=1.9`, `a11=0`, `a02=0.5`, `a10=0`, `a01=0`, `b20=0`, `b11=1`, `b02=-0.1`, `b10=1`, `b01=0`. Janela: τ∈[-5,5], Y∈[-6,6], zc∈[-0.999,0.999].

Execute `npm run audit:sonics:local-error`. O script mede separadamente resíduos nos vértices e em quatro amostras interiores por triângulo (centroide e pontos médios). Calcula uma **estimativa diferencial local**, `|Phi|/||grad Phi||`, com gradiente numérico nas coordenadas `(tau,Y,zc)`; **não** é uma distância geométrica certificada. Perto de singularidades e de gradientes quase nulos essa aproximação pode falhar. A razão pelo comprimento máximo da aresta é apenas um indicador local.

Conclusão preliminar: resíduos nos vértices são muito pequenos; o erro concentra-se na interpolação planar entre vértices e diminui em percentis altos com refinamento global. Não projetar simplesmente pontos médios, nem eliminar triângulos estreitos sem critério topológico. Próximo experimento recomendado: comparar projeção de amostras interiores e curvatura por célula, antes de alterar o extrator.

Esta versão **não modifica a geometria de produção**, o Worker, nem o cache.
