# Transversalidade numérica das cadeias mistas

Para a interseção de um ramo de rarefação com o locus de Hugoniot de um estado fixo, define-se a incidência `D(U)=det(U-Ufix,F(U)-F(Ufix))`. O módulo `riemannMixedTransversality.js` estima `grad D` por diferenças centrais e a tangente pela direção do segmento amostrado que contém a raiz acompanhada.

O indicador `|grad D · T|/(||grad D|| ||T||)` fica entre 0 e 1. Zero indica tangência de primeira ordem; valores positivos indicam cruzamento regular na aproximação amostrada. Um limiar numérico de 0,04 identifica casos quase tangenciais, sem pretensão de classificação exata.

A avaliação exige resíduo pequeno e normas não degeneradas. Caso contrário retorna estado inconclusivo. O resultado é diagnóstico local e não comprova admissibilidade entrópica, existência de bifurcação ou suavidade da dependência de `U_M` nos parâmetros.
