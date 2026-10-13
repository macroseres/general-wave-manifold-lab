# Fase 14.53 — Malha nativa de Hopf na carta recíproca

## Objetivo

Construir a malha de `Hopf-` e `Hopf+` na carta projetiva recíproca, inclusive em `Z=0`, sem confundir coordenadas matemáticas com coordenadas do renderizador.

## Definição

A carta recíproca utiliza a direção `(1,Z)`, diferença de estados `(X,ZX)` e um parâmetro `free` que é uma componente de `Ubar` escolhida para resolver a equação de autovetor. A função `reciprocalHopfAt(free,X,Z,p,side)` calcula a velocidade e os invariantes espectrais.

Para cada seção `Z` amostrada, a condição `trace = 0` define uma reta afim no plano `(free,X)`. A malha é construída entre os segmentos dessas retas dentro da janela especificada. Cada face é recortada contra `det >= 0`. A carta inclui `Z=0` sem usar `z=1/Z`.

## Implementação

- `src/geometry/hopf/reciprocalSurface.js`: função `reciprocalHopfSurfaceMesh`, que retorna `positions`, `indices`, `chart:'reciprocal'` e a declaração explícita `coordinates:['free','X','Z']`.
- `tests/hopfReciprocalSurface.test.js`: valida o contrato de coordenadas, triângulos finitos, resíduo da equação do traço e parâmetros inválidos.

## Limitações e próximo passo

Esta malha **não** é desenhada pela cena atual. Ela vive em coordenadas nativas da carta recíproca e não pode ser enviada ao renderizador `(tau,Y,zc)` como se fossem as mesmas coordenadas. A transição `X=zY`, `Z=1/z` vale apenas na sobreposição `Z != 0`. No ponto `Z=0`, a representação visual requer uma parametrização/imersão global apropriada e a identificação projetiva da banda de Möbius.

O recorte `det >= 0` é linear por face e não substitui refinamento adaptativo. A troca da componente `free` pode gerar uma costura entre parametrizações; não se conectam faces entre componentes diferentes. Não há alegação de continuidade global ou de que um ramo físico atinja o infinito.

## Verificação

`node --test tests/hopfReciprocalSurface.test.js`

`npm run check` (quando as dependências estiverem disponíveis).
