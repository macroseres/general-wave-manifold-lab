# Fase 14.88 — aceleração da carta recíproca de Hopf

Em cada seção fixa `Z`, o traço é afim nas coordenadas `(free,Y)`. O construtor agora calcula os três coeficientes com três avaliações de `reciprocalHopfAt` por seção e reutiliza-os em todas as amostras dessa seção, inclusive nas interseções usadas pelo recorte espectral. A avaliação do determinante e a projeção para a carta visual permanecem inalteradas.

## Comparação controlada

Parâmetros: `a20=4.5,a02=0.5,b11=1,b02=-0.1,b10=1`, demais nulos. Malha padrão `nZ=100,nY=128`.

| Lado | Antes | Depois | Triângulos antes/depois | Diferença máxima de coordenadas |
| --- | ---: | ---: | ---: | ---: |
| minus | 1238 ms | 915 ms | 1047/1047 | 2.78e-17 |
| plus | 1215 ms | 835 ms | 1047/1047 | 2.78e-17 |

Medições locais indicativas; o ganho no navegador depende do processador e do restante da construção. A carta finita, a resolução e o recorte espectral não foram modificados.
