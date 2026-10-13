# Erro angular da corda na cadeia mista

Para a raiz reconstruída U_M, seja d=B-A a corda do segmento da rarefação amostrada que contém a interseção com o locus de Hugoniot. Seja r_i(U_M) a direção característica local real e simples da família selecionada. O indicador é

    theta = arccos(|d . r_i| / (||d|| ||r_i||)),  0 <= theta <= pi/2.

O valor é independente da orientação dos vetores. Um ângulo pequeno indica concordância direcional local entre a corda amostrada e o autovetor; não é limite superior do erro geométrico da curva integral, não garante convergência da integração e não constitui teste de admissibilidade entrópica. O diagnóstico é indisponível quando a corda é degenerada ou a direção característica não está definida (incluindo autovalores coincidentes ou região elíptica).

A avaliação usa a raiz reconstruída pelo procedimento de sensibilidade das cadeias mistas, e não necessariamente o estado intermediário original antes do refinamento. O limiar visual de alinhamento é de 3 graus; é uma convenção numérica ajustável na função.
