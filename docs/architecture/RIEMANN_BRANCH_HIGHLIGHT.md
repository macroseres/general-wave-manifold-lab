# Inspeção visual do trecho de Hugoniot

O trecho amarelo é extraído da poligonal amostrada da Hugoniot com estado fixo, desde o vértice mais próximo do estado fixo até o vértice mais próximo do estado intermediário U_M. Ambas as aproximações devem satisfazer uma tolerância proporcional à janela do gráfico. A rotina não interpola uma nova curva nem extrapola os dados; se não encontrar ambos os extremos, não apresenta destaque.

Na projeção π₊, somente choques originados em U_L usam a Hugoniot forward; na projeção π₋, somente choques terminando em U_R usam a Hugoniot backward. As rarefações permanecem destacadas pelo leque já amostrado. A aproximação não certifica a orientação global do ramo, Liu ou admissibilidade entrópica.
