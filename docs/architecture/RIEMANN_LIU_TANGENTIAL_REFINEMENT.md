# Refinamento dos extremos tangenciais da velocidade de choque

Para uma fibra forward com estado esquerdo fixo, o diagnóstico localiza mudanças de sinal da derivada tangencial de velocidade de choque. Cada intervalo candidato é subdividido com projeção corretiva na equação de Rankine–Hugoniot, com controle de deslocamento e de avanço sobre o segmento orientado. A bisseção é interrompida por tolerância na derivada ou no comprimento do intervalo.

Uma amostra com derivada próxima de zero é preservada como `near-zero-sample`, não promovida automaticamente a raiz refinada. Uma falha de projeção, regularidade ou orientação torna o intervalo inconclusivo. Os resultados ficam em `refinedLiuInterior(...).tangentialRefinement` e **não** substituem a verificação amostrada de Liu nem constituem certificação de admissibilidade global.
