# Rarefações e famílias características

## Curvas características e construção local do leque

## Definição — Curva integral característica

Numa região estritamente hiperbólica, sejam $\lambda_i(U)$ e $r_i(U)$ um autovalor simples e um autovetor não nulo da família $i\in\{1,2\}$. Uma curva característica no espaço de estados é uma solução de

$$
\frac{dU}{d\alpha}=r_i(U).
$$

## Proposição — Leque suave de rarefação

Suponha que $U(\alpha)$ seja uma curva integral regular de um campo próprio $r_i$ de classe $C^1$, e que $h(\alpha)=\lambda_i(U(\alpha))$ seja de classe $C^1$, com $h'(\alpha)>0$ no intervalo considerado. Então sua inversão define, no intervalo de velocidades correspondente, um perfil $V(\xi)$ de classe $C^1$ que satisfaz a equação de similaridade.

**Demonstração.** Pelo teorema da função inversa, $\alpha(\xi)=h^{-1}(\xi)$ é de classe $C^1$ e $\alpha'(\xi)=1/h'(\alpha(\xi))$. Como $\lambda_i(U(\alpha(\xi)))=\xi$, temos $V'(\xi)=r_i(V(\xi))\alpha'(\xi)$. A identidade própria $DF(V)r_i(V)=\lambda_i(V)r_i(V)$ implica $(DF(V)-\xi I)V'=0$. $\square$

O perfil é completado pelos estados constantes nos intervalos exteriores ao leque. Para que a colagem constitua solução fraca, os valores nos extremos devem coincidir com esses estados. A orientação crescente das velocidades é essencial: uma curva integral arbitrária não determina automaticamente um leque admissível.

## Observação — Campos não genuinamente não lineares

Quando $\nabla\lambda_i(U)\cdot r_i(U)=0$, a velocidade pode deixar de ser estritamente monótona ao longo da curva integral. A construção acima precisa então ser analisada por trechos; isso motiva posteriormente o estudo de inflexões e ondas compostas.

O crescimento estrito de $h$, sozinho, não garante uma inversa diferenciável: uma derivada nula pode impedir a conclusão de suavidade. O enunciado anterior cobre somente os trechos regulares com derivada positiva.

## Relação com o aplicativo e os três espaços

No espaço de estados, a curva integral determina o percurso dos estados do leque. Na variedade, o laboratório integra a órbita característica e projeta essa mesma órbita para os estados. No espaço físico, as velocidades características fornecem as coordenadas de similaridade dos estados amostrados.

A implementação em src/math/solution/rarefactionSolution.js verifica a monotonicidade das velocidades amostradas com tolerância e interpola os estados para construir um candidato físico. Essa verificação discreta não demonstra a hipótese contínua de derivada positiva e não constitui um solucionador geral de Riemann.
