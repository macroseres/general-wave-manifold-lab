# Sensibilidade implícita do estado intermediário — duas ondas de choque

Para estados extremos fixos, defina D(A,B;p)=det(B-A,F(B;p)-F(A;p)). Um estado intermediário de uma cadeia de dois choques deve satisfazer G(M,p)=(D(L,M;p),D(M,R;p))=0.

Se a matriz 2×2 G_M for inversível, o teorema da função implícita dá dM/dp_j=−G_M^{-1}G_{p_j}. O módulo calcula G_M por diferenças centrais e G_{p_j} exatamente a partir da dependência linear do fluxo quadrático em cada coeficiente. Rejeita estados fora de ambos os loci e matrizes numericamente singulares. Retorna derivadas em (u,v), não no parâmetro local do segmento.

**Escopo:** trata-se da derivada local da interseção de duas equações RH. Não recalcula numericamente as curvas completas, não acompanha mudança de ramo, não verifica admissibilidade de Lax/Liu e não escolhe uma solução entrópica. Para cadeias mistas a função não é aplicada: uma equação de rarefação adicional seria necessária.
