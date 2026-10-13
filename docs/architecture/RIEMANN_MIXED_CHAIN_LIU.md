# Diagnóstico de Liu para cadeias mistas

Para `rarefaction-shock`, o choque liga `U_M` a `U_R`, com `U_R` fixo na fibra backward; para `shock-rarefaction`, liga `U_L` a `U_M`, com `U_L` fixo na fibra forward.

O estado `U_M` não é necessariamente sônico. Portanto, os relatórios de Liu de contatos sônicos não devem ser reaproveitados. O módulo `mixedChainLiu.js` inicia uma continuação numérica da fibra a partir do extremo fixo, verifica a ligação local ao estado intermediário refinado e testa a desigualdade amostrada correta em cada orientação.

O cálculo é limitado aos primeiros candidatos que passaram pelos testes de RH, ordenação e Lax, para conter custo na interface. Estados intermediários ainda não refinados, ramos ambíguos, corretores que falham e limites de avaliação são classificados como inconclusivos. A ausência de violação nas amostras **não certifica** a condição global de Liu nem a entropia da cadeia.
