# Estado genérico U* e fibras de Hugoniot

Este capítulo serve como modelo de documentação de uma construção: parte do lugar de Hugoniot nos estados, explicita sua fibra na variedade e realiza um ponto como descontinuidade no espaço físico. As fórmulas gerais são seguidas por um exemplo exato, arquivos reproduzíveis e referências com escopo declarado.

## Definição — Fibras de um estado de exploração

$U_*\in\mathcal U$ é um estado genérico de exploração, sem papel esquerdo/direito intrínseco. Fixá-lo produz duas pré-imagens:

$$
\mathcal H^{\mathrm{forw}}(U_*)=\pi_-^{-1}(U_*),\qquad \mathcal H^{\mathrm{back}}(U_*)=\pi_+^{-1}(U_*).
$$

Na forward fixa-se $U_-=U_*$ e $U_+$ varia; na backward fixa-se $U_+=U_*$ e $U_-$ varia. A implementação usa as cartas finita e recíproca para continuar ramos regulares. Isso não é uma prova de cobertura de todos os ramos para qualquer parâmetro. As fibras encontram $\mathcal C$ nos levantamentos característicos, incluindo $P_s$ e $P_f$ quando finitos e definidos.

## Proposição — Amplitude da fibra na carta finita

Escreva $\varepsilon=-1$ para fixar $U_-$ e $\varepsilon=1$ para fixar $U_+$. Defina $L(z)=P(z)u_*+Q(z)v_*+R(z)$. Se $P(z)z+Q(z)\ne0$, então

$$
Y=\frac{2L(z)}{\varepsilon(P(z)z+Q(z))},\qquad
\bar U=U_*-\frac{\varepsilon Y}{2}r(z).
$$

**Demonstração.** Substituindo a expressão de $\bar U$ na equação projetiva, obtemos $L-\varepsilon Y(Pz+Q)/2=0$. A divisão pelo denominador não nulo dá a fórmula. $\square$

O módulo src/math/state/fibers.js implementa essa construção em stateFiberPoint. Se o denominador se anula, $L\ne0$ impede uma solução finita nesse parâmetro; se também $L=0$, a equação não determina a amplitude. O código distingue no-finite-point de singular-parameterization usando tolerância. Este último caso exige outra análise, não a conclusão de que a fibra está vazia.

Depois de recuperar $\bar U$, a coordenada $\tau$ é obtida pela componente ao longo de $T$, e a regularidade da carta ainda precisa ser verificada. Uma carta regular não garante por si só que todas as fibras sejam curvas regulares: pelo teorema do valor regular, essa conclusão local requer posto dois da projeção em uma região tridimensional regular da variedade.

Para dados de Riemann, a fibra direta de $U_L$ descreve conexões que saem do estado esquerdo, e a reversa de $U_R$ descreve conexões que chegam ao direito. Selecionar e combinar essas conexões requer estados intermediários, ordenação de velocidades e admissibilidade.

## Referências e procedência da construção

A relação entre lugar projetado e fibra levantada é discutida em [Eschenazi e colaboradores, versão 2, seção 2.2](https://arxiv.org/html/2312.17377v2#S2.SS2). As seções 2.1 e 2.4 especificam o modelo e suas coordenadas. O artigo restringe o estudo ao caso IV simétrico indicado pelos autores; suas conclusões globais não são automaticamente resultados para toda a família de dez coeficientes do app. A coordenada longitudinal e a convenção de salto também precisam ser traduzidas antes de comparar fórmulas.

Para a construção tradicional nos estados e a separação entre lugar de Hugoniot e seleção de choques, usamos como referência didática [Riemann Problems and Jupyter Solutions, capítulo Shallow water, Shock waves](https://www.clawpack.org/riemann_book/html/Shallow_water.html#Shock-waves). Esse capítulo usa outro fluxo: não importamos suas fórmulas de águas rasas para o modelo quadrático.

As deduções por $P,Q,R$ acima e as contas do exemplo abaixo são expostas na convenção do projeto e conferidas contra seu núcleo. O exemplo é escolhido para verificação e ensino; não é reivindicado como resultado científico original. As referências completas e o mapa de uso estão em docs/BIBLIOGRAPHY.md.

## Exemplo — Fluxo, dados e domínio

Escolha o fluxo triangular quadrático

$$
F(u,v)=\left(\frac{u^2}{2},\frac{v^2}{2}+\frac34u\right),\qquad
U_L=(2,0),\quad U_R=(0,-1).
$$

Os coeficientes não nulos são $a_{20}=1/2$, $b_{02}=1/2$ e $b_{10}=3/4$; todos os outros são zero. O domínio de estados deste exemplo é $\mathbb R^2$. Não se trata do preset padrão do aplicativo nem do caso simétrico analisado no artigo citado.

Fixaremos $U_*=U_L$ na fibra direta. Para este fluxo,

$$
P(z)=-z,\quad Q(z)=z,\quad R(z)=\frac34z^2,\qquad N(z)=2z^2.
$$

Substituindo na fórmula da amplitude, para $z\ne0,1$,

$$
Y(z)=\frac{4-\tfrac32z}{1-z},\quad
\bar U(z)=\left(2+\frac{zY(z)}2,\frac{Y(z)}2\right),\quad
U_+(z)=\left(2+zY(z),Y(z)\right).
$$

Para o desenho e a reprodução numérica, restringimos o ramo a $7/4\leq z\leq9/4$. A escolha evita os denominadores nulos; a figura não representa toda a fibra.

## Exemplo — Do estado direito ao ponto na variedade

No ponto selecionado $z=2$, obtemos

$$
Y=-1,\quad \bar U=(1,-1/2),\quad
U^0=(3/4,-3/4),\quad T=(-2,-2),\quad \tau=-1/8.
$$

De fato, $\bar U=U^0+\tau T$. O salto é $Yr=(-2,-1)$, e as projeções recuperam exatamente $\pi_-(P)=(2,0)$ e $\pi_+(P)=(0,-1)$. Assim,

$$
P=(\tau,Y,z)=(-1/8,-1,2)\in\mathcal H^{\mathrm{forw}}(U_L).
$$

A base ortogonal e o vetor tangente foram escolhidos pelo projeto; outra parametrização da mesma fibra pode ter outro valor da coordenada longitudinal. É a reconstrução dos estados e da velocidade que deve concordar.

Na carta recíproca, o mesmo ponto tem

$$
Z=1/2,\qquad\eta=\tau/Z^2=-1/2,\qquad\Upsilon=Y/Z=-2.
$$

A fórmula $U_\pm=\bar U\pm(\Upsilon/2)(1,Z)$ devolve os mesmos extremos. Nenhum desses valores está na fronteira $Z=0$.

## Exemplo — Conservação, velocidade e classificação

As avaliações diretas do fluxo são

$$
F(U_L)=(2,3/2),\quad F(U_R)=(0,1/2),\quad
F(U_R)-F(U_L)=(-2,-1)=U_R-U_L.
$$

Logo Rankine–Hugoniot vale exatamente com $s=1$. Como

$$
DF(u,v)=\begin{pmatrix}u&0\\3/4&v\end{pmatrix},
$$

os espectros ordenados nos extremos são $(0,2)$ à esquerda e $(-1,0)$ à direita. Portanto, $\lambda_2(U_R)=0<1<2=\lambda_2(U_L)$ e $\lambda_1(U_L)=0<1$: o ponto satisfaz as desigualdades estritas de Lax da família 2, longe das fronteiras de igualdade.

Não foi construído aqui um par convexo de entropia nem analisado um perfil viscoso. A verificação de Lax neste ponto não demonstra unicidade global ou cobertura de todas as soluções para esses dados.

## Exemplo — Realização no espaço físico

O ponto selecionado representa a descontinuidade

$$
U(x,t)=\begin{cases}(2,0),&x<t,\\(0,-1),&x>t,\end{cases}\qquad t>0.
$$

A interface é $x=st=t$. Os estados constantes satisfazem a equação em cada lado, e o termo de interface se anula pela igualdade exata de Rankine–Hugoniot. Assim, esta é uma solução fraca com traço inicial de Riemann; além disso, satisfaz o critério estrito de Lax calculado acima. O valor atribuído exatamente sobre a interface não altera a identidade fraca.

Um ponto da fibra realiza um salto. O restante do ramo desenhado corresponde a outros estados direitos e velocidades, não a partes adicionais dessa mesma solução física.

![Exemplo de Hugoniot: ramo projetado nos estados, fibra na carta da variedade e interface física do ponto selecionado. A imagem abre em tamanho completo.](/docs/hugoniot-reference.svg)

## Reproduzir e verificar no código

Os dados de entrada estão em docs/examples/hugoniot-reference.json. O comando node scripts/hugoniot-reference.mjs --json reconstrói o ponto e 81 amostras do ramo usando stateFiberPoint, waveState e stateFiberPointReciprocal; grava o relatório em docs/examples/hugoniot-reference-results.json. O roteiro scripts/plot_hugoniot_reference.py lê esse relatório para gerar a figura, sem uma integração adicional.

tests/hugoniotReferenceExample.test.js verifica fluxos exatos, extremos, coordenadas, resíduo conservativo, levantamento inverso e mudança de carta. Também compara o ramo numérico com a fórmula simbólica de $Y(z)$. O critério numérico dos testes é erro absoluto inferior a $10^{-11}$; isso verifica as amostras escolhidas, não uma cobertura global.

O teste de renderização da documentação carrega este mesmo texto pelo registro do aplicativo e verifica a interpretação matemática. Os testes matemáticos do exemplo não dependem do desenho para decidir se a conexão satisfaz conservação.

## Exclusões e como estender o capítulo

Em $z=0$, $P=Q=R=0$ e a parametrização regular da carta falha; cancelar formalmente o fator comum na expressão de $Y$ não torna essa carta regular. Em $z=1$, o denominador da fibra se anula e $L\ne0$, portanto não há ponto finito por essa parametrização. O programa devolve estados distintos para esses casos.

Não foram cobertos todos os ramos, o ponto característico de salto nulo, as direções excepcionais nem todas as famílias admissíveis. Para outro fluxo ou estado fixado, repetir a dedução, registrar os denominadores e domínios, conferir a família espectral e testar a correspondência dos três espaços. O modelo editorial é reutilizável; os valores e conclusões deste exemplo não são universais.
