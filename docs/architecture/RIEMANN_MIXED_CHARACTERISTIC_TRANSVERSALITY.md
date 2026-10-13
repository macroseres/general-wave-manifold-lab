# Transversalidade característica nas cadeias mistas

Para o estado intermediário U_M, com um estado fixo U_f no lado do choque, define-se
D(U_f,U;p)=det(U-U_f,F(U;p)-F(U_f;p)).

O indicador local é |grad_U D(U_f,U_M;p)·r_i(U_M;p)|/(||grad_U D|| ||r_i||),
onde r_i é o autovetor característico real da família do ramo de rarefação.
A orientação do autovetor não altera o valor absoluto.

A derivada de D é aproximada por diferenças centrais; o autovetor é calculado
no estado intermediário, e não estimado pela corda de um segmento amostrado.
A classificação é numérica; sem hiperbolicidade estrita ou com gradiente
ou direção degenerados, o resultado é indisponível.

Este indicador não prova tangência exata, bifurcação nem admissibilidade entrópica.
