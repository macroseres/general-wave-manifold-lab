# Sensibilidade de U_M para cadeias mistas

Para as cadeias rarefação–choque e choque–rarefação, a curva integral característica é reconstruída por integração RK4 adaptativa sob perturbações individuais dos dez coeficientes do fluxo. Mantêm-se fixos U_L, U_R, a família e o sentido inicial do ramo.

Para cada fluxo perturbado, procura-se uma raiz do determinante de Rankine–Hugoniot sobre os segmentos da curva reintegrada. A raiz só é acompanhada se houver uma única candidata dentro da vizinhança prescrita do U_M original. As derivadas de U_M são diferenças centrais entre as raízes reconstruídas nas perturbações positiva e negativa. O procedimento rejeita ambiguidades e raízes ausentes, sem atribuir derivada zero.

## Limitações

- O acompanhamento é **local e amostrado**. A reintegração e a busca de raízes por mudança de sinal podem perder raízes tangenciais.
- O teste de proximidade não estabelece a identidade global dos ramos; mudanças topológicas ou de família não são acompanhadas.
- As derivadas são estimativas por diferenças finitas, não derivadas analíticas certificadas.
- Não há certificação de Lax, Liu, entropia ou unicidade da solução de Riemann nesta rotina.
- Em casos quase degenerados, refinar o passo de integração e de perturbação e confrontar com a geometria da variedade de ondas.
