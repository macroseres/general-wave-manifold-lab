# Seleção preliminar de ondas compostas pelo diagnóstico de Liu

A comparação é realizada somente para candidatos choque–rarefação da Hugoniot forward de U_L, com contato em S^+ e condições fracas de Lax verificadas. O relatório de Liu deve corresponder ao mesmo contato refinado e à mesma família. Se houver múltiplas correspondências, não se escolhe uma arbitrariamente.

Um relatório `liu-violation-detected` é apresentado como violação numérica; `no-liu-violation-detected` significa apenas que os testes finitos não detectaram violação. Relatórios ausentes ou inconclusivos permanecem inconclusivos. A direção rarefação–choque requer continuação backward e um diagnóstico próprio: não se transfere o resultado forward para esse caso.

Esta etapa não prova admissibilidade entrópica, não verifica o perfil viscoso e não produz ainda uma solução global do problema de Riemann.
