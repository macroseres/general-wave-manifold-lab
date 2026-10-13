# Continuação local da Hugoniot forward para o diagnóstico de Liu

Para o estado esquerdo fixo U_L, definimos

H(U)=det(U-U_L,F(U)-F(U_L)).

O corretor aplica Newton na direção normal ao nível H=0, com amortecimento e
limite de deslocamento. Os vértices de um arco previamente selecionado são
corrigidos, e arestas longas recebem pontos intermediários corrigidos.

**Limites:** H=0 inclui a raiz trivial U=U_L e pode ter múltiplos ramos. O
algoritmo não atravessa esse ponto por continuação automática, não comprova
a topologia global do arco e não certifica a condição de Liu entre amostras.
Falhas na correção são reportadas como inconclusivas, nunca como aprovação.

A verificação amostrada continua usando s(U_L,U_fim) <= s(U_L,U) nos pontos
intermediários. O critério não substitui admissibilidade entrópica global ou
perfis viscosos.
