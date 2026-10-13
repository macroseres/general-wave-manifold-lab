# Comparação local de sensibilidades de Hugoniot

A interface compara duas cadeias candidatas, preservando seus metadados de ramo e a projeção escolhida. A rotina `compareHugoniotSensitivity` usa somente derivadas centrais identificadas em ambas as cadeias e não substitui resultados inconclusivos por zero.

**Limitação:** `dt/dp` é a derivada do parâmetro local do segmento amostrado em relação a um coeficiente do fluxo. Segmentos diferentes podem ter escalas e orientações distintas. Portanto, a diferença dessas derivadas não é uma quantidade geométrica invariante e não mede diretamente a sensibilidade do estado intermediário `U_M`. A comparação não certifica admissibilidade entrópica.

Os cálculos de sensibilidade do segundo candidato são executados somente quando ele é escolhido explicitamente, evitando avaliar todos os candidatos de uma vez.
