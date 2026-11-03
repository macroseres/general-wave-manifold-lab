# Fase 14.60 — Classificação das fronteiras de Hopf

A auditoria identifica arestas incidentes a um único triângulo, reconstruindo a conectividade a partir das coordenadas da malha. Classifica-as por evidência: limites de τ, limites de Y, cortes amostrais em ẑ, aproximação numérica de det=0 e fronteiras interiores não resolvidas.

**Cautela:** `interiorUnresolved` não prova rejeição numérica, pois a malha final não registra a causa de descarte de cada face. Uma atribuição causal rigorosa exigirá instrumentar o gerador `hopfSurfaceMesh` com códigos de rejeição e proveniência das faces. A classificação `detZero` depende de tolerância absoluta e exige cautela em diferentes escalas de parâmetros. A classificação de limites exige que os dois extremos da aresta pertençam à mesma face do recorte.

Execute `npm run audit:hopf:mesh` para ver as contagens e exemplos de coordenadas (τ,Y,ẑ) de cada classe. Não há alteração na geometria 3D.
