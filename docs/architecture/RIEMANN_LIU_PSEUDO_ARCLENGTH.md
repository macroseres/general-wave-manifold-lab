# Continuação orientada por pseudo-comprimento de arco

Para `U_L` fixo, a curva de Hugoniot forward é representada pela incidência escalar
`H(U)=det(U-U_L,F(U)-F(U_L))=0`. Longe do ponto trivial `U_L`, o preditor
avança na direção tangente `t` perpendicular a `∇H`; o corretor de Newton
resolve simultaneamente `H(U)=0` e `(U-U_pred)·t=0`.

A orientação e a seleção de ramo são restringidas pela polilinha amostrada
existente. A primeira amostra não trivial é corrigida, e o trecho entre
`U_L` e essa amostra **não** é certificado pela continuação. Uma falha do
preditor-corretor devolve resultado inconclusivo, com fallback conservador
para o corretor local anterior. O método não demonstra ausência de ramos
adicionais nem verifica Liu continuamente: o teste de velocidades segue
sendo amostrado e necessário, não suficiente para admissibilidade global.
