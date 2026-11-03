# Fase 14.52 — Avaliação de Hopf no atlas projetivo

## Objetivo

Usar a carta recíproca para avaliar a condição espectral nas extremidades da malha de Hopf, sem criar superfícies fictícias em \(\hat z=\pm1\).

## Matemática

Na carta \(z\), \(U_+-U_-=Y(z,1)\). Na carta recíproca, \(U_+-U_-=X(1,Z)\), com \(Z=1/z\), \(X=zY\). A coordenada livre da carta recíproca é obtida do estado médio reconstruído, não é identificada com \(\tau\). Em ambas, \(M^\pm=DF(U_\pm)-sI\), e \(\mathcal{Hopf}^\pm\) exige \(\operatorname{tr}M^\pm=0\) e \(\det M^\pm>0\).

## Implementação

- `src/math/sonic/hopfAtlas.js`: avalia pela carta original quando \(|\hat z|<0,92\) e pela recíproca nas extremidades, verificando a reconstrução de \(\bar U\).
- `src/geometry/hopf/surface.js`: usa o avaliador do atlas nos vértices e nas sondagens de resíduo das faces.
- `tests/hopfAtlas.test.js`: compara os invariantes nas regiões de sobreposição e impede vértices artificiais nos extremos.

## Limitações

Esta fase melhora a **avaliação espectral** da malha existente, mas **não** constrói uma segunda malha em coordenadas \((X,Z)\). Portanto, não garante que todos os ramos que cruzam \(Z=0\) estejam representados. A colagem topológica das malhas e o recorte geométrico de fronteiras permanecem trabalhos futuros. A condição de Hopf não autoriza prolongamento artificial onde o determinante é negativo.
