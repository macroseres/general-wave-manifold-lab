# Correção conjunta de U_M nas cadeias mistas

O estado intermediário é parametrizado localmente por uma curva integral da família característica, `U(t)`, integrada com um passo RK4 a partir do primeiro vértice do segmento amostrado. O algoritmo resolve simultaneamente as duas equações

`F(U(t)) - F(U_fix) - s (U(t)-U_fix) = 0`,

com incógnitas `t` e `s`, por Newton amortecido e diferenças centrais na derivada em `t`. O domínio `0 <= t <= 1` impede extrapolação para outros ramos. Para choque–rarefação, `U_fix=U_L`; para rarefação–choque, `U_fix=U_R`.

O refinamento é aceito somente após verificar o resíduo vetorial de Rankine–Hugoniot e a proximidade à poligonal que originou o candidato. A parametrização RK4 local ainda aproxima a curva integral exata e pode perder raízes tangenciais ou não convergir; nesses casos, o método antigo é usado como alternativa. Não há certificação de admissibilidade entrópica nem prova de completude.

Implementação: `src/math/solution/mixedJointCorrector.js`. Testes: `tests/mixedJointCorrector.test.js`.
