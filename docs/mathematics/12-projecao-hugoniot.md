# Projeção explícita das Hugoniot em U

## Proposição — Imagem constante e imagem variável

A vista do espaço de estados permite escolher $\pi_-$ ou $\pi_+$. A projeção escolhida determina qual fibra colapsa no estado fixado:

$$
\begin{array}{c|cc}&\pi_-&\pi_+\\ \hline \mathcal H^{\mathrm{forw}}(U_*)&\{U_*\}&\text{curva de }U_+\\ \mathcal H^{\mathrm{back}}(U_*)&\text{curva de }U_-&\{U_*\}\end{array}
$$

O app desenha apenas a imagem não constante correspondente e representa a imagem constante pelo marcador $U_*$.

**Demonstração.** Na fibra direta, a identidade $\pi_-(P)=U_*$ vale por definição para todos os pontos. Na reversa, vale $\pi_+(P)=U_*$. A outra projeção fornece os estados variáveis, sem que se presuma sua injetividade ou regularidade global. $\square$

## Relação com a geometria implementada

O adaptador src/geometry/state/hugoniotStateProjection.js projeta os pontos já calculados e preserva os metadados dos segmentos. Em projectHugoniotPointToState, side identifica o extremo fixado: minus projeta o extremo variável $U_+$ e plus projeta $U_-$. Essa convenção não deve ser confundida com o nome da projeção exibida.

Os pontos aceitos por esse adaptador precisam de coordenadas finitas e de um estado regular; dados não representáveis são descartados. Portanto, a figura desenhada não demonstra que a imagem matemática inteira foi coberta, sobretudo nas singularidades e direções que exigem representação recíproca.

Conservar a identificação do ramo permite relacionar a curva de estados à sua origem na variedade. A seleção de um ponto ou segmento da figura, por si só, não prova que toda cadeia de Riemann correspondente existe ou é admissível.
