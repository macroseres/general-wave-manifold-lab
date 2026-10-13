# Famílias características nas cadeias de dois choques

Para uma cadeia `U_L -> U_M -> U_R`, os dois saltos precisam satisfazer Rankine–Hugoniot e suas velocidades devem ser estritamente ordenadas `s_1 < s_2`.

Em regiões estritamente hiperbólicas, o diagnóstico adicional exige um choque estrito de Lax da família lenta no primeiro salto e um choque estrito de Lax da família rápida no segundo. Para a família lenta, `lambda_s(U_-) > s > lambda_s(U_+)` e `s < lambda_f(U_-), lambda_f(U_+)`. Para a família rápida, `lambda_f(U_-) > s > lambda_f(U_+)` e `s > lambda_s(U_-), lambda_s(U_+)`.

A classificação usa apenas autovalores nos extremos e um resíduo numérico de Rankine–Hugoniot. Não verifica Liu, perfis viscosos, ondas compostas, transições sônicas ou admissibilidade global. A classificação `ordered-lax-endpoint-candidate` não deve ser interpretada como solução certificada do problema de Riemann.
