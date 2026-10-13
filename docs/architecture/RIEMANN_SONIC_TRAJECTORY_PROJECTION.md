# Projeção de contato sônico em curvas integrais numéricas

A busca anterior projetava o contato refinado sobre segmentos retilíneos da polilinha de rarefação. Agora, para cada segmento, parte-se da amostra inicial, segue-se o autovetor característico normalizado da família correspondente usando RK4 e minimiza-se a distância ao contato no intervalo de comprimento igual à corda amostrada.

O refinamento é local: cada arco é reiniciado na amostra já disponível. O procedimento não constitui solução de um problema de valor de contorno nem garante que o contato sônico pertença exatamente à curva integral. A distância reportada é a distância a uma aproximação numérica da curva; não há certificação de erro global.

Mantêm-se as condições necessárias de correspondência de família, lado sônico, resíduos numéricos do contato e ordenação de velocidades ao longo do trecho utilizado. A admissibilidade do choque e da onda composta permanece aberta.

Implementação: `src/math/solution/trajectoryContactProjection.js` e `src/math/solution/sonicRarefactionConnections.js`. Testes: `tests/trajectoryContactProjection.test.js` e `tests/sonicRarefactionConnections.test.js`.
