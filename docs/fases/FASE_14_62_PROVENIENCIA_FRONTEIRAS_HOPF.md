# Fase 14.62 — Associação espacial entre fronteiras e candidatos rejeitados

O gerador pode opcionalmente guardar os três vértices de **todos** os triângulos candidatos rejeitados, com a primeira razão de rejeição (`recordRejectedTriangles`). Essa opção é desligada por padrão para evitar custo de memória na cena.

O auditor extrai as arestas expostas da malha final, calcula seus pontos médios, normaliza as três coordenadas pelo intervalo da janela e mede a distância até os triângulos candidatos rejeitados. Um candidato é considerado próximo quando a distância é menor ou igual a `nearDistance` (padrão 0,015 em coordenadas normalizadas). O filtro por esfera circunscrita acelera a consulta.

**Limitação essencial:** proximidade não demonstra causalidade. Uma aresta próxima de um candidato rejeitado por `determinantClip` não é necessariamente a fronteira exata do conjunto `det=0`. As arestas classificadas como `noNearbyRejectedTriangle` tampouco demonstram falha de amostragem. A classificação depende da distância escolhida; não é uma identificação topológica de vizinhança de células.

Execute `npm run audit:hopf:provenance` para reproduzir os resultados. Para investigar a origem exata de cada aresta, o passo seguinte é registrar identificadores das células da grade e a linhagem dos segmentos recortados, sem recorrer apenas à distância.

A geometria renderizada e a tolerância do traço não foram modificadas nesta fase.
