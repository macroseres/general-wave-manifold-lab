# Fase 14.93 — auditoria de correlação entre a sônica e BT

Esta fase é **exclusivamente diagnóstica**. Não altera a extração das superfícies, as curvas, os controles ou a reflexão †.

Execute `npm run audit:bt:sonic-correlation` para analisar o conjunto de coeficientes mostrado na captura de tela de 10/10/2026 (`a20=-4.5`, `a02=.5`, `b11=1`, `b02=-.1`, `b10=1`, demais zero), no domínio de auditoria `tau∈[-5,5]`, `Y∈[-6,6]`, `zc∈[-.999,.999]`.

O diagnóstico constrói **somente S⁻**, calcula o erro implícito aproximado em centroides e pontos médios dos triângulos, normalizado pelo maior lado do triângulo, e registra os maiores ângulos de virada das polilinhas de BT⁻ extraídas da mesma malha. A distância estimada é `|Phi|/||grad Phi||`, e não um limite matemático rigoroso de distância à superfície. Os ângulos são medidos nas coordenadas `(tau,Y,zc)` e dependem da escala escolhida para os eixos. O resíduo `btGap` é o valor do critério espectral no ponto interpolado.

## Resultado da execução de referência

- 16.008 vértices e 31.044 triângulos.
- Erro relativo estimado: mediana `0.0001262`, percentil 95 `0.007017`, máximo `0.462565`.
- 297 segmentos de BT⁻, uma polilinha.
- Viradas máximas observadas superiores a 150° em alguns pontos, com resíduos implícitos e espectrais não nulos.

## Interpretação e limites

A sônica é extraída de uma equação implícita por tetraedrização, mas os triângulos representam uma aproximação linear por partes. Os vértices podem satisfazer a equação com alta precisão enquanto seus interiores apresentam erros maiores. BT é posteriormente extraída por interpolação sobre esses triângulos; portanto, a imprecisão da malha pode afetar BT. A auditoria não prova causalidade ponto a ponto, nem estabelece que uma curva matemática tenha singularidades.

**Próximo experimento controlado:** comparar a mesma região com duas resoluções locais e verificar a convergência simultânea dos erros da sônica e das viradas de BT, sem suavização gráfica ou mudança das equações.
