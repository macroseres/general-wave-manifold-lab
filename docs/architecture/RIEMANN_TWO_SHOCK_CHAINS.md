# Cadeias de duas ondas de choque — diagnóstico necessário

Dado um candidato intermediário `U_M` proveniente da interseção das projeções das fibras de Hugoniot forward de `U_L` e backward de `U_R`, verificamos independentemente os saltos `U_L -> U_M` e `U_M -> U_R` pela equação de Rankine–Hugoniot.

Para que dois choques separados apareçam na solução autossimilar com o primeiro à esquerda do segundo, suas velocidades devem satisfazer `s_1 < s_2`. O módulo `riemannWaveChains.js` verifica essas condições com tolerâncias e classifica o candidato como `ordered-rh-candidate`, `speed-ordering-unverified`, `rankine-hugoniot-unverified`, `degenerate-jump` ou `missing-states`.

Essa verificação é **necessária, mas não suficiente**: não identifica as famílias características dos choques, não verifica Liu ou perfis viscosos e não constrói a solução completa. Os estados intermediários continuam provenientes de interseções de polilinhas amostradas, portanto podem conter erros de projeção.
