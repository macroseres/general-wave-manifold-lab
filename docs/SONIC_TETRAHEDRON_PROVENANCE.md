# Rastreamento dos tetraedros próximos de P

A opção `traceTarget` é exclusivamente diagnóstica. Não altera o algoritmo de extração nem é utilizada pelo Web Worker em produção.

Execute `npm run audit:sonics:tetrahedra` para listar, por superfície, cada triângulo incidente ao ponto P=(0,0,0.9979731774678219), seus índices de vértice, a célula da grade, os quatro índices locais do tetraedro, as coordenadas de seus vértices e os valores de Phi.

Nos coeficientes e na resolução padrão, foram rastreados os 7 triângulos incidentes em S- e os 5 em S+, provenientes de quatro células em cada superfície. Nenhum triângulo incidente ficou sem origem. Isto **não** prova que todos os tetraedros vizinhos que deveriam emitir triângulos os emitiram; requer uma auditoria independente da classificação e da interseção implícita em cada tetraedro, sobretudo em arestas degeneradas.
