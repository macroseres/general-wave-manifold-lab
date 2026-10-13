# Ordenação necessária das rarefações de Riemann

Para uma rarefação centrada da família `i`, a velocidade característica `lambda_i(U)` deve aumentar da esquerda para a direita no espaço autossimilar `xi=x/t`. Ao continuar a partir de `U_L` rumo a um estado intermediário, conservamos o trecho de cada ramo em que `lambda_i` não diminui. Ao continuar de `U_R` para trás, rumo ao estado intermediário, conservamos o trecho em que `lambda_i` não aumenta. O critério é necessário, não suficiente, para construir uma solução de Riemann admissível.

Os campos e a integração permanecem os de `stateIntegralCurves.js`. `monotoneBranches.js` filtra o prefixo de cada ramo e registra as velocidades e a razão de interrupção. O filtro usa tolerância relativa e interrompe na primeira inversão resolvida; não trata automaticamente regiões não genuinamente não lineares, ondas compostas, transições sônicas, entropia de choque ou continuação através de pontos degenerados.

A notação canônica do sistema permanece `mathcal F = X mathcal G`, com `mathcal G=(DF(bar U)-sI)r` na carta finita.
