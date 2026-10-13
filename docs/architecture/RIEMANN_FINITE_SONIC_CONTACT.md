# Contato sônico de amplitude finita — diagnóstico preliminar

Para um salto real com Rankine–Hugoniot satisfeito, `finiteSonicContacts` procura, sobre polilinhas amostradas, zeros de `s - lambda_i(U_+)` na Hugoniot forward de `U_L` (condição de `S+`) e zeros de `s - lambda_i(U_-)` na Hugoniot backward de `U_R` (condição de `S-`). A distinção entre extremos é essencial. O módulo não extrapola autovalores complexos nem avalia saltos triviais. O detector considera amostras próximas de zero e mudanças de sinal entre amostras consecutivas. A interpolação linear não é uma solução certificada da equação sônica: a próxima etapa deve resolver simultaneamente as condições RH e sônica na fibra, com refinamento adaptativo e controle de resíduo.

A interface mostra um contador e círculos roxos vazados para candidatos, conforme a projeção selecionada. Nenhuma onda composta é classificada como admissível por este módulo.
