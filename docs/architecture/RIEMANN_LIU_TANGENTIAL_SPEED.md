# Derivada tangencial da velocidade de choque

Para `U_L` fixo e `U` sobre a Hugoniot forward, seja `d=U-U_L` e `s=(d·(F(U)-F(U_L)))/(d·d)`. A incidência escalar é `H(U)=det(d,F(U)-F(U_L))=0`. Em um ponto regular, `t=(-H_v,H_u)/||∇H||` é tangente unitária.

Diferenciando a identidade Rankine–Hugoniot ao longo da curva, obtemos

`ds/dℓ = d·(DF(U)-sI)t / ||d||²`.

O módulo `liuTangentialSpeed.js` calcula esta derivada analiticamente; `liuTangentialExtrema` procura mudanças de sinal e valores pequenos sobre um arco orientado. A orientação do vetor tangente é alinhada com a progressão das amostras.

Os zeros identificados são **candidatos**, não extremos certificados: podem faltar pontos entre amostras, a tangente pode ser singular, e um arco amostrado não prova conectividade global. O diagnóstico é acrescentado ao resultado de `refinedLiuInterior` no campo `tangential`, sem alterar os critérios anteriores de aprovação/rejeição amostrada.
