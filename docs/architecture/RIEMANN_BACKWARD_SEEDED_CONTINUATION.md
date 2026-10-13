# Continuação direta da Hugoniot backward

Para U_R fixo, a curva de Hugoniot backward consiste nos estados variáveis U_- que satisfazem F(U_R)-F(U_-)=s(U_R-U_-). A equação de incidência escalar é simétrica sob troca dos extremos; portanto o corretor geométrico forward pode ser reutilizado com o estado fixo U_R, mantendo a ordem física U_- → U_R ao calcular a velocidade de choque.

O módulo `seededBackwardHugoniot.js` seleciona sementes características, acompanha o ramo por pseudo-comprimento de arco, valida o ponto de contato em S^- e verifica RH com os extremos na ordem física. Contatos sem raiz refinada ou ramos sem fechamento confiável são inconclusivos.

**Não** reutilizar o teste forward de Liu para classificar choques backward. A orientação da comparação ao longo do arco precisa ser derivada e implementada separadamente. A continuação geométrica, mesmo com RH, não demonstra admissibilidade entrópica.
