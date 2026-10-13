# Refinamento interior de Liu backward

Com estado direito fixo $U_R$, o arco parte de $U_R$ e termina em $U_-$. A desigualdade necessária é $s(U_-,U_R)\ge s(V,U_R)$ para estados intermediários $V$. O refinamento subdivide arcos amostrados, corrige pontos na incidência de Rankine–Hugoniot, e compara extremos tangenciais refinados com a velocidade do choque final.

Os cálculos são numéricos e não certificam admissibilidade global. Pontos próximos de zero sem mudança de sinal não são considerados extremos refinados. Falhas de correção e ambiguidades produzem resultados inconclusivos.
