# Ordem observada de convergência do estado intermediário

Para aproximações de U_M em passos h, h/2 e h/4, sejam d_h = ||U_h-U_{h/2}|| e d_{h/2}=||U_{h/2}-U_{h/4}||. Quando ambas são positivas e resolvidas numericamente, calcula-se p_obs=log(d_h/d_{h/2})/log(2). O procedimento é aplicado às diferenças sucessivas de cada trio de malhas.

Se alguma interseção é ambígua ou ausente, a ordem não é inferida. Diferenças inferiores à tolerância também não recebem ordem artificial. Um deslocamento grande entre a primeira e última aproximação é sinalizado, sem concluir que ocorreu troca de ramo ou bifurcação.

A seleção da raiz continua baseada em proximidade ao U_M de referência; a continuidade topológica do ramo, a ordem assintótica e a admissibilidade entrópica **não estão certificadas**.
