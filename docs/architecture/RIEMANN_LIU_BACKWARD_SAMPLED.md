# Liu backward — diagnóstico amostrado

Com o estado direito fixo `U_R`, a Hugoniot backward é o conjunto de estados esquerdos `V` que satisfazem Rankine–Hugoniot com `U_R`. Para um choque candidato `U_- -> U_R`, a desigualdade de Liu backward, ao longo do arco conectado orientado a partir do estado trivial `U_R`, é `s(U_-, U_R) >= s(V, U_R)` para todos os estados intermediários `V` desse arco.

`liuSpeedAlongBackwardFibre` verifica esta condição apenas em pontos amostrados e exige resíduos RH pequenos. `seededLiuAtBackwardContact` usa a continuação por sementes já existente e o fechamento numérico do contato sônico. O diagnóstico é preliminar: não certifica o arco inteiro, a condição de Liu global, a seleção de família, nem a admissibilidade por perfil viscoso. Falhas na continuação ou na geometria permanecem inconclusivas.

A condição forward usa a desigualdade oposta com o estado esquerdo fixo; não se deve reutilizá-la com orientação invertida.
