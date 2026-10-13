# Auditoria das faces compartilhadas — dev.24.47.39

A análise é **somente diagnóstica**. A extração rápida (`diagnostics: false`) e a geometria do aplicativo não foram modificadas.

Execute `npm run audit:sonics:faces` para imprimir as faces discordantes, separadas por superfície e classe. O relatório contém coordenadas, valores de Phi, padrões de segmentos (quantos foram detectados em cada tetraedro) e exemplos.

## Resultados no domínio e parâmetros padrão

| Superfície | Faces comparadas | Divergências | Aresta nula | Regular |
|---|---:|---:|---:|---:|
| S- | 620320 | 228 | 224 | 4 |
| S+ | 620320 | 228 | 224 | 4 |

As 224 divergências de `zero-edge-degeneracy` são classificadas por duas ou mais avaliações de Phi próximas de zero nos vértices de uma face. Essas situações são degeneradas; o contador não é uma contagem demonstrada de buracos na superfície. Os 4 casos `regular-mismatch` concentram-se perto de `zc = 0.95904` e da borda `zc = 0.999`, onde os valores de Phi têm grande amplitude. Em todos os 228 casos, o padrão de segmentos é `0:1` ou `1:0`: o diagnóstico detectou um segmento em um lado da face e nenhum no outro.

A comparação usa `pointOnFace` com tolerância absoluta `2e-9` e quantização `1e9`, o que merece uma auditoria separada de falsos positivos e falsos negativos perto de singularidades e do bordo compactificado. Não se conclui ainda que os 4 casos sejam lacunas geométricas reais.

**Próxima investigação recomendada:** comparar a interseção geométrica real dos triângulos de cada lado com as faces em questão, usando tolerâncias relativas à escala local e verificando a incidência de triângulos na malha. Não modificar a triangulação com base apenas nesses contadores.
