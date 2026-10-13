# Auditoria topológica das superfícies sônicas — dev.24.47.40

Executar `npm run audit:sonics:topology` para calcular, **fora da renderização**, a incidência das arestas da malha triangular indexada e as componentes conexas da fronteira.

## Método

- Cada aresta não orientada é identificada pelos índices de seus dois vértices.
- Incidência 1: aresta de fronteira; incidência 2: aresta interior usual; incidência superior a 2: aresta não-manifold.
- O grafo das arestas de fronteira é percorrido para identificar componentes, graus, pontas e ciclos.
- A classificação `bothEndpointsOnDomain` usa proximidade de `1e-8` aos planos do domínio. Uma aresta com apenas um extremo no limite não prova descontinuidade.
- Compara-se exatamente o conteúdo dos arrays `positions` e `indices` com a auditoria anterior ligada/desligada.
- O relatório também inclui as quatro faces classificadas como `regular-mismatch` por superfície para localizar a investigação seguinte.

## Resultado para parâmetros e domínio padrão

| Indicador | S− | S+ |
| --- | ---: | ---: |
| Triângulos | 19.542 | 19.354 |
| Arestas com incidência 1 | 570 | 570 |
| Arestas com incidência 2 | 29.028 | 28.746 |
| Arestas com incidência >2 | 0 | 0 |
| Componentes da fronteira | 1 | 1 |
| Contornos fechados | 1 | 1 |
| Arestas de fronteira com ambos os extremos no domínio | 0 | 0 |
| Arestas de fronteira com um extremo no limite | 2 | 2 |
| Arestas de fronteira com ambos os extremos no limite | 568 | 568 |
| Arrays idênticos com/sem diagnóstico | Sim | Sim |

**Interpretação:** a malha apresenta uma única fronteira fechada e nenhuma aresta com mais de duas faces incidentes. Não há arestas de fronteira com ambos os extremos afastados do limite do domínio. Isso é evidência favorável à ausência de buracos topológicos internos na malha padrão, mas não constitui prova de regularidade geométrica nem cobre outros parâmetros. As duas arestas mistas em cada superfície devem ser verificadas com mais precisão; a proximidade da compactificação pode afetar o critério geométrico de classificação.

O gerador, a triangulação, o Web Worker e a renderização normal não foram modificados.
