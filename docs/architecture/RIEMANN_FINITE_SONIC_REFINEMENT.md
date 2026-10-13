# Refinamento de contato sônico de amplitude finita

Para um estado fixo e um estado variável, resolvemos duas equações escalares em (u,v):

1. Rankine–Hugoniot: det(U_+−U_−, F(U_+)−F(U_−)) = 0.
2. Condição sônica: s−λ_i(U_+) = 0 para forward (S⁺); s−λ_i(U_−) = 0 para backward (S⁻).

O método usa Newton com diferenças centrais e busca linear amortecida, iniciando nos candidatos obtidos da fibra amostrada. A velocidade s é a projeção do salto de fluxo sobre o salto de estados. A convergência requer ambos os resíduos pequenos, espectro estritamente hiperbólico e salto não trivial. Resultados não convergentes permanecem explicitamente candidatos.

**Limitações:** convergência numérica não prova unicidade, permanência na componente geométrica original, admissibilidade entrópica, nem conexão composta. Raízes com Jacobiana singular podem não ser encontradas. O teste de condição sônica é feito no extremo correto, conforme a orientação da fibra.
