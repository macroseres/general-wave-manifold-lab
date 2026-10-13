# Extremo interpolado no trecho de Hugoniot

A curva de Hugoniot é representada por uma poligonal numérica no Espaço de estados.
O destaque associado a uma cadeia candidata usa o identificador do ramo e o índice
original do segmento, quando disponíveis. O extremo visual é a projeção ortogonal
de U_M sobre o segmento, com parâmetro limitado ao intervalo [0,1].

Se a distância de U_M ao segmento, ou a distância do estado fixo ao vértice inicial,
exceder a tolerância de visualização, o destaque é omitido. Sem índice de segmento,
procura-se o segmento mais próximo dentro da tolerância. A poligonal é orientada
partindo do estado fixo em direção ao extremo interpolado.

A interpolação não resolve novamente Rankine–Hugoniot e não certifica
admissibilidade entrópica. O desvio informado é um erro geométrico de visualização.
