# Estados locais e projeções

## Definição — Projeções de extremos na carta finita

$$
U_-(P)=\bar U-\frac{Y}{2}\begin{pmatrix}z\\1\end{pmatrix},\qquad U_+(P)=\bar U+\frac{Y}{2}\begin{pmatrix}z\\1\end{pmatrix}
$$

Para cada $P\in\mathcal W$, os estados locais móveis são as projeções

$$
\pi_-(P)=U_-(P),\qquad \pi_+(P)=U_+(P).
$$

$U_-$ e $U_+$ não são dados globais fixos: variam quando $P$ se move em $\mathcal W$.

O estado médio $\bar U=(U_-+U_+)/2$ é uma terceira informação associada ao ponto, mas não substitui nenhuma das duas projeções de extremos. No código, os campos Um, Up e Ubar representam respectivamente $U_-$, $U_+$ e $\bar U$.

## Observação — Um estado não determina uma onda única

Fixar apenas $\pi_-(P)$ ou $\pi_+(P)$ deixa, em geral, uma fibra de possíveis pontos. Mesmo o par de estados coincidentes e uma velocidade podem deixar direções distintas na diagonal prolongada. Portanto, selecionar um estado no plano não determina automaticamente uma onda, um ramo ou uma solução de Riemann completa na variedade.

O módulo src/math/state/projections.js fornece projectLeft, projectRight e projectMean a partir de um estado regular calculado pelo núcleo. Quando o dado não é regular, essas operações retornam null em vez de inventar uma projeção. No espaço físico, os estados locais são os traços de cada salto; em uma cadeia, podem ser estados intermediários e não os dados globais $U_L,U_R$.
