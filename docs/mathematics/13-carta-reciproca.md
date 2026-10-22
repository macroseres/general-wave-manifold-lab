# Carta recíproca e infinito

## Definição — Coordenadas recíprocas completas

Na sobreposição das cartas regulares, a transição implementada no núcleo é

$$
Z=\frac1z,\qquad \eta=\frac{\tau}{Z^2},\qquad \widehat{Y}=\frac{Y}{Z}.
$$

A coordenada $z_{\mathrm c}=(2/\pi)\arctan z$ é apenas visual e não substitui a carta recíproca. Ramos em $Z=0$ permanecem na carta recíproca.

A amplitude $\widehat Y$ também é denotada por $\Upsilon$ na referência canônica e no código. Não é a mesma variável que $Y$: a mudança da normalização da direção exige mudar a amplitude. Neste capítulo, $Z$ é a coordenada recíproca e não a segunda componente do salto usada em outra representação.

## Proposição — Preservação dos estados e da velocidade

Na sobreposição $Z\ne0$, defina os polinômios homogeneizados

$$
\widetilde P(Z)=Z^2P(1/Z),\qquad
\widetilde Q(Z)=Z^2Q(1/Z),\qquad
\widetilde R(Z)=Z^2R(1/Z).
$$

Como os graus são no máximo dois, essas expressões se estendem como polinômios a $Z=0$. Se a carta é regular, a base ortogonal $U^0$ não muda na sobreposição, enquanto $\widetilde T=Z^2T$. Portanto,

$$
U^0+\tau T=U^0+\eta\widetilde T
\quad\Longleftrightarrow\quad \eta=\tau/Z^2.
$$

Além disso,

$$
Y(z,1)=\Upsilon(1,Z)
\quad\Longleftrightarrow\quad \Upsilon=Y/Z.
$$

**Demonstração.** Na base $-R(P,Q)/(P^2+Q^2)$, o numerador e o denominador recebem o mesmo fator $Z^4$, que se cancela para $Z\ne0$. A direção tangente recebe o fator $Z^2$. A identidade $(z,1)=Z^{-1}(1,Z)$ fornece a transformação da amplitude. Assim, o estado médio e o salto são preservados, e também os extremos $U_\pm$. Como a equação própria apenas muda a normalização do autovetor, a velocidade $s$ permanece a mesma. $\square$

Na carta recíproca, os estados são reconstruídos por

$$
U_\pm=\bar U(\eta,Z)\pm\frac{\Upsilon}{2}(1,Z).
$$

Essa fórmula continua fazendo sentido em $Z=0$ quando a fibra recíproca é regular. A direção então é $(1,0)$ e o salto é $(\Upsilon,0)$. As fórmulas que dividem por $Z$ descrevem somente a sobreposição e não devem ser avaliadas diretamente nesse ponto.

## Limites e implementação

O módulo src/math/charts/reciprocalChart.js implementa os polinômios homogeneizados e fiberZ. A amplitude recíproca dos estados fixados é tratada em src/math/state/fibers.js por stateFiberPointReciprocal. Se $\widetilde P^2+\widetilde Q^2=0$, a construção por base e tangente também exige análise dos casos ausente ou degenerado, exatamente como na carta finita.

O infinito aqui é o da coordenada de direção, não necessariamente o dos estados físicos: um ponto com $Z=0$ pode ter estado médio e extremos finitos. A compactificação visual aproxima essa direção por bordas de desenho, mas não autoriza ligar pontos de ramos distintos nem substituí-la por um valor finito muito grande de $z$.

As fórmulas são as de 03-charts.tex. A cobertura de regiões singulares e a equivalência global de construções de Riemann continuam exigindo análise própria; a igualdade local dos estados na sobreposição não demonstra essa cobertura.
