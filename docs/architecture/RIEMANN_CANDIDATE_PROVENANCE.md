# Origem geométrica de uma cadeia candidata

O módulo `riemannCandidateProvenance.js` associa a cada perfil amostrado os metadados geométricos utilizados em sua construção. A origem é registrada separadamente para as ondas lenta e rápida:

- Dois choques: o primeiro conecta `U_L` a `U_M` a partir da Hugoniot forward fixada em `U_L`; o segundo conecta `U_M` a `U_R` a partir da Hugoniot backward fixada em `U_R`.
- Rarefação–choque: o leque parte de `U_L` em um ramo característico amostrado; o choque é associado à Hugoniot backward de `U_R`.
- Choque–rarefação: o choque é associado à Hugoniot forward de `U_L`; o leque termina em `U_R` em um ramo característico amostrado.

O identificador de trecho refere-se à amostragem interna, não a um ramo global canonicamente identificado. A origem geométrica, o refinamento numérico, Rankine–Hugoniot e os diagnósticos de Lax/Liu são evidências distintas. O módulo não certifica admissibilidade entrópica, não remove candidatos e não altera o solucionador.
