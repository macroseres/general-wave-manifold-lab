# Visualização física de cadeias candidatas

A janela Espaço físico (x,t) conserva a visualização da órbita de rarefação da variedade de ondas e acrescenta a seleção de cadeias candidatas calculadas no Espaço de estados. As cadeias são transferidas ao componente superior apenas após o cálculo no painel de estados; se U_L, U_R ou o fluxo forem modificados, reabra o Espaço de estados para atualizar as cadeias.

Para cada choque de velocidade s, o diagrama mostra a semirreta x=st (t>=0). Para cada rarefação amostrada, mostra o setor λ_inicial t <= x <= λ_final t e raios intermediários. Os perfis u(x,t),v(x,t) são avaliações de U(x/t), conforme `evaluateSelfSimilarCandidate`, e descontinuidades não são conectadas artificialmente por segmentos de gráfico.

Essas representações são aproximações de candidatos e não implicam admissibilidade de Liu, existência, unicidade ou regularidade da solução do problema de Riemann. A visualização de rarefação isolada continua independente dos estados U_L,U_R.
