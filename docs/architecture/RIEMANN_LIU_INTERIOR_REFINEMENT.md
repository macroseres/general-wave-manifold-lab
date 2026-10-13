# Refinamento interior do teste amostrado de Liu

Para o estado esquerdo fixo `U_L` e um arco forward orientado até `U_c`, a condição necessária de Liu é `s(U_L,U_c) <= s(U_L,U)` para todos os estados intermediários `U` do mesmo arco. O teste anterior só comparava as velocidades nos vértices disponíveis.

O módulo `src/math/solution/liuInteriorExtrema.js` subdivide cada segmento do arco, corrige o ponto médio com Newton normal à equação escalar de incidência de Rankine–Hugoniot e rejeita correções que se afastem demasiadamente do segmento. Verifica Rankine–Hugoniot para cada ponto, compara as velocidades com a velocidade final e detecta candidatos a extremos interiores pela mudança de sinal das diferenças sucessivas.

`refined-liu-violation` identifica uma violação numérica da desigualdade. `refined-liu-compatible` significa apenas que as amostras refinadas não revelaram violação. `interior-refinement-inconclusive` significa que a subdivisão não pôde ser realizada de modo confiável. Nenhum desses estados certifica continuidade, unicidade de ramo, admissibilidade de Liu global ou existência de um perfil viscoso.

A função `seededLiuAtForwardContact` expõe `interiorStatus`, `interiorChecked`, `interiorViolations` e `interiorExtrema` sem modificar o status preliminar nem promover `passes` a verdadeiro.
