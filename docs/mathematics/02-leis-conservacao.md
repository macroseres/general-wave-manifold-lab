# Leis de conservação e soluções fracas

## Definição — Sistema de leis de conservação

Seja $F:\Omega\subset\mathbb R^2\to\mathbb R^2$ um fluxo continuamente diferenciável. Estudamos

$$
U_t+F(U)_x=0,\qquad U=(u,v)^T.
$$

No modelo quadrático geral adotado neste laboratório, as duas componentes de F foram definidas na seção 1.1, como parte dos dados do problema de Riemann.

## Formulação fraca e dedução de Rankine–Hugoniot

Uma solução clássica pode não existir globalmente, mesmo com fluxo suave: perfis característicos podem desenvolver gradientes elevados e descontinuidades. Por isso é necessário formular a lei de conservação sem exigir derivadas pontuais de $U$.

## Definição — Solução fraca

Uma função localmente integrável $U$, com $F(U)$ localmente integrável, é solução fraca com dado inicial $U_0$ quando, para toda função teste $\varphi\in C_c^1(\mathbb R\times[0,\infty))$,

$$
\int_0^\infty\!\int_{\mathbb R}\bigl(U\varphi_t+F(U)\varphi_x\bigr)\,dx\,dt+\int_{\mathbb R}U_0(x)\varphi(x,0)\,dx=0.
$$

A identidade é entendida componente a componente.

## Proposição — Condição de Rankine–Hugoniot

Se uma solução é $C^1$ dos dois lados de uma interface regular $x=\gamma(t)$, com traços $U_-$ e $U_+$, então a condição necessária para ser solução fraca é

$$
F(U_+)-F(U_-)=\gamma'(t)(U_+-U_-).
$$

**Demonstração.** Integrando por partes a identidade fraca em cada lado da interface, os termos de volume se anulam pela equação clássica. O termo concentrado na interface é $[F]-\gamma'[U]$, que deve ser zero. $\square$

## Corolário — Choque autossimilar

Uma interface reta $x=st$ entre estados constantes satisfaz a lei de conservação no sentido fraco se, e somente se, $F(U_+)-F(U_-)=s(U_+-U_-)$.

A condição de salto não seleciona, por si só, a solução fisicamente admissível. Isso motiva as condições de entropia e de Lax. Além disso, estudar apenas um choque não basta para conectar estados arbitrários: precisamos organizar sistematicamente todas as triplas $(U_-,U_+,s)$ compatíveis com Rankine–Hugoniot. Essa necessidade conduz à Variedade de Ondas $\mathcal W$.
