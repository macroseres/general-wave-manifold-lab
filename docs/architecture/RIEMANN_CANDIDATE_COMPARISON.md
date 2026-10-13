# Comparação descritiva de cadeias candidatas

A comparação exibe o estado intermediário U_M, as velocidades de choque, a margem entre velocidades adjacentes, o máximo dos resíduos relativos de Rankine–Hugoniot e os diagnósticos prévios de Lax e Liu.

O resíduo relativo de cada salto é recalculado diretamente pela função de fluxo quadrática vigente, não é herdado da classificação anterior. Para cadeias mistas, a margem é a diferença entre a velocidade do choque e a velocidade da borda adjacente do leque. Para dois choques, é s₂−s₁.

A ordem de entrada dos candidatos é preservada; nenhuma heurística escolhe uma solução entrópica. Uma violação de Liu detectada prevalece na indicação. Ausência de violação nas amostras não é certificação global. Os leques são interpolações de trajetórias amostradas.
