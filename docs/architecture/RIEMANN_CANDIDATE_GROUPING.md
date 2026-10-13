# Agrupamento conservador de candidatos de Riemann

`groupRiemannCandidates` organiza candidatos de perfis autossimilares numericamente semelhantes sem excluir nenhuma cadeia ou selecionar soluções entrópicas.

Critérios necessários para agrupamento: mesmo tipo de cadeia, mesmos estados extremos, estado intermediário próximo, velocidades de choque próximas e mesmas evidências geométricas, de Lax, do leque e de Liu. Para cadeias mistas, cinco amostras normalizadas da trajetória de rarefação e das velocidades características também precisam concordar. Tolerâncias relativas configuráveis: `stateTolerance=1e-5`, `speedTolerance=1e-6`.

O procedimento é uma heurística de equivalência com representante do primeiro candidato, **não** uma classificação topológica de ramos. Grupos próximos da tolerância podem depender da ordem de entrada. Não há garantia de identidade geométrica ou admissibilidade entrópica. A interface mostra `G1`, `G2`, etc. e a quantidade de possíveis duplicações, preservando a seleção individual por índice.
