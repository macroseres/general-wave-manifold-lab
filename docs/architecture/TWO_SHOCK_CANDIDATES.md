# Candidatos de dois choques

As interseções entre a projeção em U_+ da fibra forward de U_L e a projeção em U_- da fibra backward de U_R fornecem candidatos geométricos U_M. O módulo `src/math/solution/twoShockCandidates.js` intersecta segmentos das poligonais já amostradas e avalia Rankine–Hugoniot para U_L → U_M e U_M → U_R. A ordem necessária das velocidades s1 < s2 é informada separadamente.

Não são certificados: exaustividade das interseções, admissibilidade de Lax/Liu, perfil viscoso, família característica ou rarefações. Não apresentar estes candidatos como solução do problema de Riemann. A precisão depende da amostragem das fibras e da projeção.
