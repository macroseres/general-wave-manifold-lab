# Variedade de Ondas e carta finita

## Definição — Coordenadas regulares da carta finita

A direção projetiva é $r(z)=\begin{pmatrix}z\\1\end{pmatrix}$. A equação característica da fibra é $P(z)\bar u+Q(z)\bar v+R(z)=0$. Definindo $N(z)=P(z)^2+Q(z)^2$, para $N(z)>0$ temos $U^0=-R(P,Q)/N$ e $T=(-Q,P)$.

$$
\bar U(\tau,z)=U^0(z)+\tau T(z)
$$

**Distinção de notação.** Usamos $N(z)=P(z)^2+Q(z)^2$ exclusivamente para o denominador da carta finita. O símbolo $\Delta(u,v)$ fica reservado ao discriminante espectral. O campo D retornado pelo código da fibra corresponde a $N$, não a $\Delta$.

$\tau$ é o coeficiente da direção tangente não normalizada, não comprimento de arco.

A variedade é denominada  **Variedade de Ondas** , denotada por $\mathcal W$. A troca de estados é a involução $\dagger:(\tau,Y,z)\mapsto(\tau,-Y,z)$.

## Proposição — Velocidade na carta regular

Se $\bar U$ satisfaz a equação projetiva, então $DF(\bar U)r$ é paralelo ao vetor não nulo $r=(z,1)^T$. A velocidade própria pode ser recuperada sem dividir por uma componente particular:

$$
s=\frac{r\cdot DF(\bar U)r}{r\cdot r}.
$$

**Demonstração.** Escrevendo $DF(\bar U)r=sr$ e tomando o produto escalar com $r$, obtemos a expressão, pois $r\cdot r=1+z^2>0$. $\square$

Essa é a fórmula usada em src/math/manifold/waveState.js. Para um fluxo quadrático ela não depende da amplitude $Y$ quando o estado médio e a direção são mantidos fixos; isso não implica constância ao longo de uma fibra de Hugoniot de estado fixado, onde o estado médio pode variar.

## Casos fora da parametrização regular

Se $P=Q=0$ e $R\ne0$, não existe estado médio que satisfaça a equação nessa direção. Se $P=Q=R=0$, ela não restringe o estado médio, e a parametrização por uma única reta deixa de valer. O módulo src/math/charts/zChart.js usa tolerâncias para devolver absent, degenerate ou regular. Esses estados numéricos não devem ser substituídos por uma divisão por $N$ nem por pontos artificiais.

A direção $(1,0)$ não pertence à carta $r=(z,1)$ e precisa da carta recíproca. A amplitude $Y$ é livre no modelo polinomial em todo $\mathbb R^2$; se o estudo restringir os estados a um domínio físico $\Omega$, é necessário exigir também $U_-,U_+\in\Omega$.
