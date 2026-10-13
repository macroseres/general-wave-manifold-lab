# Sensibilidade local das raízes de Hugoniot aos coeficientes

Para um segmento fixo `q(t)=a+t(b-a)` e estado de referência `fixed`, o algoritmo localiza a raiz do determinante de Rankine–Hugoniot. Em seguida perturba, individualmente, os dez coeficientes quadráticos por `±1e-5 max(1,|p_j|)` e procura uma raiz próxima à selecionada, no mesmo segmento.

O resultado `coefficientSensitivity` contém `trials` com deslocamentos do parâmetro `t` e derivadas centrais quando ambos os lados são identificáveis; `maximumParameterShift`; `missingPerturbedRoots`; e `status` (`locally-tracked` ou `unresolved-perturbation`). A análise pode ser desativada com `analyzeSensitivity:false`.

**Limitações:** o experimento não recompõe a curva de Hugoniot inteira após perturbar os coeficientes, nem prova continuidade, bifurcação ou admissibilidade entrópica. Raízes próximas podem ser indistinguíveis sob a tolerância local; casos não rastreados são declarados inconclusivos. Os deslocamentos são relativos ao parâmetro do segmento e dependem da parametrização.
