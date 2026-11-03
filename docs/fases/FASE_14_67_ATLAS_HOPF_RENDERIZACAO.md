# Fase 14.67 — duas cartas na renderização de Hopf

O gerador da carta `z` continua representando a parte regular da superfície. A cena agora também solicita uma malha construída **nativamente** pela equação de traço zero na carta recíproca `(free,X,Z)` com `Z=1/z`, e recortada pela condição `det >= 0`.

A projeção para a visualização atual `(tau,Y,zc)` usa a transformação de atlas existente `fromReciprocal` **apenas onde `Z != 0`**, valida a reconstrução dos estados e descarta faces fora da janela. As regiões `Z<0` e `Z>0` são trianguladas separadamente: nenhuma face atravessa `Z=0` por artifício gráfico. A implementação fica em `src/geometry/hopf/reciprocalDisplay.js` e está ligada a `HopfSurfaces` em `src/components/Scene.jsx`.

## Limitações matemáticas e visuais

A carta recíproca é regular em `Z=0`, mas a projeção `(tau,Y,zc)` **não** é uma carta regular ali. Portanto, a superfície ainda não é exibida exatamente sobre `zc=±1`. É necessária uma visualização em atlas ou uma imersão 3D que preserve a direção projetiva para representar o conjunto em `Z=0` sem colapsar informações.

O recorte da malha recíproca usa uma janela auxiliar finita em `free,X`; isso não certifica completude global. O gerador de malha recíproca usa interpolação de determinante nas arestas, de modo que sua fronteira é aproximada. A malha atual também não une nem elimina automaticamente possíveis sobreposições entre cartas.

Para os parâmetros de referência, há triângulos recíprocos válidos projetados no domínio comum. Isso não implica que a superfície Hopf atinja os pontos `zc=±1` para todos os parâmetros: a condição espectral deve continuar sendo verificada.
