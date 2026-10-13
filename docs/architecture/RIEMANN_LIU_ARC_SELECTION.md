# Seleção amostrada do arco de Liu forward

A fibra forward fixa U_L e varia U_+. O teste de Liu exige a velocidade s(U_L,U_+) em **todo** o arco conectado, orientado desde U_L até o contato sônico. `orientedForwardLiuArc` procura apenas um segmento de polilinha cuja extremidade amostrada esteja próxima de U_L e contenha uma amostra próxima ao contato refinado. O segmento pode ser invertido para obter a orientação correta.

O algoritmo não costura componentes desconexas nem inventa trajetórias ausentes. Se a amostragem não contém um arco ancorado, retorna `arc-not-resolved`; ambiguidades entre segmentos retornam `ambiguous-arc`. A aproximação usa o contato refinado como ponto final, mas os pontos internos não são reprojetados na equação exata de Rankine–Hugoniot. O teste `liuSpeedAlongFibre` exige que cada ponto intermediário satisfaça RH dentro da tolerância; caso contrário rejeita o arco.

A desigualdade forward amostrada é s(U_L,U_c) <= s(U_L,U) para os estados intermediários. Sua satisfação não é certificação de Liu: podem existir oscilações entre amostras, outra conexão ou falha na orientação topológica. O diagnóstico não classifica automaticamente uma onda composta como admissível.
