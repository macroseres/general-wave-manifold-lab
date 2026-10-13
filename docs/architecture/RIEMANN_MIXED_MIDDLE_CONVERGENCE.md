# Convergência amostrada de U_M em cadeias mistas

O experimento refina o passo de integração do ramo característico (h, h/2, h/4, ...), reconstruindo em cada nível a interseção entre a poligonal de rarefação e o locus de Hugoniot. Para cada segmento, são pesquisadas as raízes da equação de incidência D(U_fixo,U)=0, com teste de resíduo. O salto trivial é excluído.

O acompanhamento só é considerado identificável quando há exatamente uma raiz na vizinhança prescrita do estado intermediário de referência. São registrados o ponto, resíduo, distância à referência, índice do segmento e distâncias entre pontos de níveis consecutivos.

A classificação `decreasing-observed` significa apenas que a última distância entre níveis foi menor que a primeira. Não é uma demonstração de convergência, não fornece ordem de erro e não verifica admissibilidade entrópica. A tolerância de identificação, a amostragem da rarefação e as degenerescências podem afetar o resultado.
