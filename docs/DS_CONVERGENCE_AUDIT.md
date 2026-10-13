# Auditoria de convergência de DS e J

Executar apenas sob demanda: `npm run audit:ds:convergence`.

O script chama `scripts/audit-ds.js` com três resoluções crescentes e imprime JSON comparativo. Não é importado pelo aplicativo nem altera as malhas renderizadas.

Resultados iniciais (parâmetros padrão):

| nTau/nY/nZ | J canônica→malha máx. | J malha→canônica máx. | DS canônica→malha máx. |
|---|---:|---:|---:|
| 12/10/16 | 0.017186 | 0.043687 | 2.22e-16 |
| 16/12/20 | 0.009041 | 0.008356 | 2.78e-17 |
| 24/16/28 | 0.003675 | 0.056943 | 6.21e-17 |

A distância de J canônica→malha diminui com o refinamento, mas a distância inversa não é monótona. Não se deve concluir convergência bilateral nem cobertura completa. A classificação de segmentos por proximidade e a ausência de tratamento de interseções coplanares continuam sendo limitações. A DS permanece numericamente coincidente **nos segmentos detectados**.
