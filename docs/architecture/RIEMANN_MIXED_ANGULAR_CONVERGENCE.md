# Experimento de refinamento angular nas cadeias mistas

A direção característica local em um ponto da rarefação é o autovetor real de `DF(U)` correspondente à família escolhida. O erro angular entre a direção característica e a corda de uma poligonal é não orientado e pertence a `[0°,90°]`.

O diagnóstico reintegra a mesma curva característica a partir do estado âncora, com passos máximos `h`, `h/2` e `h/4`. Em cada malha, escolhe a corda cuja projeção é mais próxima do estado intermediário de referência e avalia o ângulo no ponto projetado. A distância até esse estado é informada; quando o ramo não passa suficientemente perto, o resultado é inconclusivo.

A classificação `decreasing-observed` compara somente os extremos dos níveis calculados, não certifica monotonicidade entre todos os níveis, taxa de convergência ou erro da curva exata. Os ramos não são reintersectados com Hugoniot em cada nível: esta é uma avaliação local da discretização, não da sensibilidade da solução de Riemann. Nenhum diagnóstico certifica admissibilidade entrópica.
