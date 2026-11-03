# Fase 14.66 — gráfico coerente de Hopf

A superfície é o locus `trace(DF(U_±)-sI)=0` com recorte `det(DF(U_±)-sI)>=0` na malha (o interior matemático é `det>0`).

## Alteração

O algoritmo anterior selecionava, faixa a faixa, entre resolver a equação do traço para `tau` e para `Y`. Isso gerava mudanças de parametrização em faixas adjacentes e possíveis costuras. Agora verifica se um dos coeficientes da equação afim do traço é uniformemente não nulo em todas as seções. Se sim, usa a mesma parametrização em toda a malha. Caso contrário, preserva o mecanismo local anterior, que exige trabalho adicional para garantir compatibilidade de cartas.

A resolução transversal mínima passa de 42 para 96 subdivisões. Os vértices de recorte continuam sendo reprojetados para o locus de traço zero.

## Referência numérica

Para o conjunto de coeficientes padrão, janela `tau=[-1,1]`, `Y=[-6,6]`, `nZ=100`, foram obtidos 867 triângulos em Hopf menos e 869 em Hopf mais. O número de triângulos, isoladamente, não prova ausência de lacunas.

## Limitações

A correção não demonstra continuidade global no infinito projetivo, não implementa colagem entre cartas e não garante uma triangulação conforme da curva `det=0`. É necessário verificar visualmente a nova superfície e as fronteiras matemáticas.
