# Posto diferencial de Rankine–Hugoniot

Para o fluxo quadrático geral, na carta finita com `r=(1,Z)`, definimos `U_±=Ubar±Xr/2` e

`H(Ubar,X,Z,s)=F(U_+)-F(U_-)-s(U_+-U_-)=X(DF(Ubar)-sI)r`.

O módulo `src/math/manifold/rankRegularity.js` calcula a matriz diferencial 2×5 de `H` em `(ubar_u,ubar_v,X,Z,s)` e os postos das matrizes aumentadas com `D U_-` e `D U_+`. Em pontos de `H=0`, posto 2 é a condição de valor regular para o sistema ambiente, e os postos aumentados permitem avaliar a dimensão local esperada das fibras de projeção, quando as hipóteses de posto constante se verificam.

**Limites:** o sistema ambiente inclui toda a componente trivial `X=0`. Ali `H=0` identicamente e `rank(DH)≤1`, mas isso **não** demonstra singularidade da variedade de ondas não trivial obtida por divisão de `X` e fecho geométrico. A carta recíproca e a equação desingularizada exigem uma análise independente. Os valores numéricos de posto são condicionados pela tolerância; não são certificados simbólicos de transversalidade. A classificação espectral de `DF` é distinta da regularidade de `H`.
