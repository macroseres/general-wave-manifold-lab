# Problema de Riemann: formulação

O ponto de partida é o **problema de Riemann**: determinar a evolução de uma descontinuidade inicial entre dois estados constantes de um sistema de leis de conservação. O fluxo é parte dos dados que definem esse problema, e não um problema independente. A procura de soluções conduz naturalmente a regiões contínuas, descritas pelas direções características, e a descontinuidades, que precisam satisfazer a lei de conservação no sentido fraco.

## Definição — Problema de Riemann

Dado um fluxo $F:\Omega\subset\mathbb R^2\to\mathbb R^2$ e estados $U_L,U_R\in\Omega$, procura-se $U(x,t)$ que satisfaça

$$
U_t+F(U)_x=0,\qquad
U(x,0)=
\begin{cases}
U_L,&x<0,\\
U_R,&x>0.
\end{cases}
$$

A solução deve satisfazer a condição inicial no sentido apropriado e, quando houver descontinuidades, a formulação fraca da lei de conservação.

## Definição — Fluxo quadrático geral do problema

No laboratório, especializamos o fluxo ao modelo quadrático geral sem termos constantes (que se cancelam nas diferenças de Rankine–Hugoniot e não alteram o jacobiano):

$$
\begin{aligned}
f(u,v)&=a_{20}u^2+a_{11}uv+a_{02}v^2+a_{10}u+a_{01}v,\\
g(u,v)&=b_{20}u^2+b_{11}uv+b_{02}v^2+b_{10}u+b_{01}v.
\end{aligned}
$$

Os dez coeficientes são reais e independentes. As deduções gerais para um fluxo diferenciável serão particularizadas a esse modelo quando utilizarmos a identidade exata do fluxo quadrático.

## Dedução da equação de similaridade

Como o dado inicial é invariante pela dilatação simultânea $(x,t)\mapsto(kx,kt)$, procuramos soluções autossimilares da forma $U(x,t)=V(\xi)$, $\xi=x/t$. Essa escolha é um *ansatz*: a invariância do dado não demonstra, isoladamente, a existência ou unicidade de uma solução autossimilar.

### Lema — Equação nas regiões suaves

Se $V$ é continuamente diferenciável em um intervalo de similaridade, então satisfaz

$$
(DF(V(\xi))-\xi I)V'(\xi)=0.
$$

**Demonstração.** Como $\partial_t\xi=-\xi/t$ e $\partial_x\xi=1/t$, substituindo na lei de conservação e multiplicando por $t>0$ obtemos a identidade. $\square$

### Corolário — Direções características

Em qualquer ponto em que $V'(\xi)\ne0$, necessariamente $\det(DF(V(\xi))-\xi I)=0$, e a tangente $V'(\xi)$ pertence ao autoespaço associado à velocidade $\xi$.

Esse resultado explica por que o estudo das soluções contínuas conduz às curvas integrais das direções características. A construção dos leques de rarefação é desenvolvida na seção “Rarefações e famílias características”.
