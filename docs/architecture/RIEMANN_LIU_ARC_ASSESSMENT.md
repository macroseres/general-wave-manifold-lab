# Consolidação numérica dos testes de Liu no arco forward

Para um estado esquerdo fixo `U_L`, a condição forward de Liu exige
`s(U_L,U_target) <= s(U_L,U)` em **todo** estado intermediário `U` do
arco de Hugoniot orientado. Uma desigualdade estrita em sentido contrário
em qualquer ponto do arco é suficiente para detectar uma violação.

O módulo `liuArcAssessment.js` reúne três verificações necessárias:

1. amostras originais do arco orientado (`liuSpeedAlongFibre`);
2. amostras intermediárias corrigidas por Rankine–Hugoniot (`refinedLiuInterior`);
3. extremos tangenciais refinados (`liuStationaryOrdering`).

Uma violação detectada tem precedência sobre qualquer teste inconclusivo.
A classificação `no-liu-violation-detected` significa apenas que os três
diagnósticos finitos não encontraram violação e que não há colchetes
estacionários não resolvidos. Não é uma certificação contínua, global,
de Liu, de Lax ou de perfil viscoso.

O painel de Espaço de estados exibe essa classificação separadamente para
os contatos forward com continuação direta por sementes características.
O diagnóstico não classifica os contatos backward nem substitui a análise
de admissibilidade de ondas compostas.
