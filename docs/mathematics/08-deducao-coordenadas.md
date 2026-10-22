# Dedução das coordenadas da Variedade de Ondas

A condição de Rankine–Hugoniot foi obtida ao admitir descontinuidades na solução fraca do problema de Riemann. Nesta seção, deduzimos as coordenadas utilizadas para estudar simultaneamente os choques e seu limite quando o salto tende a zero.

**Ordem da construção.**  Primeiro partimos da formulação tradicional de Rankine–Hugoniot para um par de estados e uma velocidade. Em seguida, a redução projetiva constrói a descrição geométrica da Variedade de Ondas e suas cartas. A parametrização não substitui a definição tradicional: organiza suas soluções e prolonga a diagonal característica.

**Representações e cartas.**  As representações $(U_-,U_+,s)$ e $(\bar U,X,Z,s)$ descrevem o ponto de $\mathcal W$. Na carta finita, escrevemos $(X,Z)=Y(z,1)$; a relação de Rankine–Hugoniot para o fluxo quadrático determina $s$ e a equação projetiva restringe $\bar U$. Assim, $(\tau,Y,z)$ são apenas coordenadas locais da variedade desingularizada, não uma redefinição de seus pontos.

## Proposição — Três níveis de descrição de um mesmo ponto

A definição tradicional utiliza $(U_-,U_+,s)$. A transformação linear invertível de estados e saltos fornece $(\bar U,X,Z,s)$, com $(X,Z)=U_+-U_-$. Fora da diagonal de salto nulo, a condição de salto consiste em duas equações escalares em cinco variáveis. Na região em que seu diferencial tem posto dois, o conjunto de soluções tem dimensão local três. Na diagonal, essa contagem para a relação bruta não substitui a construção prolongada com direção própria. As coordenadas $(\tau,Y,z)$ e as da carta recíproca são parametrizações locais desse objeto, não novos tipos de ponto.

## Definição — Carta recíproca e representação compactificada

Na carta finita, o salto é $Y(z,1)$. Na carta recíproca, a mesma direção é $(1,Z)$, com amplitude $\widehat{Y}$. Na sobreposição, a mudança usada no núcleo é

$$
Z=1/z,\qquad \widehat{Y}=Y/Z,\qquad \eta=\tau/Z^2.
$$

Assim, a carta recíproca é representada no código por $(\eta,\widehat{Y},Z)$. A escrita informal $(\tau,X,Z)$ somente é aceitável depois de redefinir explicitamente seus símbolos: não se deve identificar seu $X$ com a primeira componente do salto em $(\bar U,X,Z,s)$, nem substituir $\eta$ por $\tau$ sem a mudança de escala. A coordenada $z_{\mathrm c}=(2/\pi)\arctan z$ compactifica a exibição da carta finita; não substitui a carta recíproca no infinito projetivo.

## Definição — Estado médio e vetor salto

Para dois estados distintos, introduzimos o estado médio e o salto

$$
\bar U=\frac{U_-+U_+}{2},\qquad \Delta U=U_+-U_-.
$$

Escolhida a carta projetiva em que a segunda componente do salto não é nula, escrevemos

$$
\Delta U=Y\,r(z),\qquad r(z)=\begin{pmatrix}z\\1\end{pmatrix},\qquad U_\pm=\bar U\pm\frac{Y}{2}r(z).
$$

O parâmetro $Y$ mede o salto nesta normalização; não é seu comprimento euclidiano.

## Lema — Identidade do fluxo quadrático

Se $F:\mathbb R^2\to\mathbb R^2$ tem componentes de grau no máximo dois, então

$$
F\!\left(\bar U+\frac{\Delta U}{2}\right)-F\!\left(\bar U-\frac{\Delta U}{2}\right)=DF(\bar U)\,\Delta U.
$$

**Demonstração.** Em cada componente, os termos quadráticos pares em $\Delta U$ se cancelam na diferença; permanecem somente os termos lineares dados pela diferencial em $\bar U$. $\square$

## Proposição — Fatoração da condição de Rankine–Hugoniot

Escreva $P=(\bar U,X,Z,s)$, com $(X,Z)=U_+-U_-$. Para o fluxo quadrático, a condição vetorial de Rankine–Hugoniot é exatamente

$$
\mathcal F(\bar U,X,Z,s)=(DF(\bar U)-sI)\begin{pmatrix}X\\Z\end{pmatrix}=0.
$$

Na carta projetiva em que $X$ é a amplitude, escrevemos $(X,Z)=X(1,\zeta)$. Então ocorre a fatoração

$$
\mathcal F=X\,\mathcal G,\qquad\mathcal G=(DF(\bar U)-sI)\begin{pmatrix}1\\\zeta\end{pmatrix}.
$$

Nessa carta, $X=0$ implica salto nulo e corresponde à diagonal; a extensão geométrica seleciona nela o ramo característico impondo também $\mathcal G=0$. Para $X\ne0$, Rankine–Hugoniot equivale a $\mathcal G=0$ e descreve pares distintos de estados, candidatos a choques. A condição de entropia continua necessária para a admissibilidade.

**Demonstração.** Pela identidade quadrática, $F(U_+)-F(U_-)=DF(\bar U)(U_+-U_-)$. Substituindo o salto parametrizado por $X(1,\zeta)$, obtemos a fatoração. A equação original se anula automaticamente quando a amplitude é zero, independentemente de $s$; a exigência adicional $\mathcal G=0$ retém apenas velocidades e direções próprias, isto é, o prolongamento característico. $\square$

**Distinção entre cartas.**  Se $X,Z$ forem considerados componentes independentes do salto, $X=0$ não implica salto nulo quando $Z\ne0$. A fatoração por $X$ é válida na carta $Z=X\zeta$; a direção $X=0,\ Z\ne0$ é coberta pela carta complementar $(X,Z)=Y(z,1)$, usada no laboratório. Nela, a mesma separação é feita por $Y=0$ e $Y\ne0$.

## Proposição — Redução projetiva de Rankine–Hugoniot

Para $Y\ne0$, Rankine–Hugoniot equivale a

$$
(DF(\bar U)-sI)r(z)=0.
$$

Eliminando $s$ pela condição de paralelismo, obtemos

$$
\det\bigl(r(z),DF(\bar U)r(z)\bigr)=0.
$$

A equação resultante também faz sentido quando $Y=0$, fornecendo o prolongamento característico da relação de choque.

**Demonstração.** Pelo lema, a diferença dos fluxos é $YDF(\bar U)r$. Dividindo Rankine–Hugoniot por $Y\ne0$, obtemos a equação própria. Em dimensão dois, um vetor é paralelo a $r$ exatamente quando o determinante indicado se anula. $\square$

## Proposição — Equação da fibra característica

Para o fluxo quadrático geral definido no início da documentação, a condição projetiva é linear no estado médio:

$$
P(z)\bar u+Q(z)\bar v+R(z)=0,
$$

$$
\begin{aligned}P(z)&=2b_{20}z^2+(b_{11}-2a_{20})z-a_{11},\\Q(z)&=b_{11}z^2+(2b_{02}-a_{11})z-2a_{02},\\R(z)&=b_{10}z^2+(b_{01}-a_{10})z-a_{01}.\end{aligned}
$$

Esses polinômios resultam da expansão de $\det(r,DF(\bar U)r)$; não são coeficientes independentes adicionais.

## Proposição — Auditoria algébrica dos dez coeficientes

Para o fluxo quadrático geral, o jacobiano e a matriz direcional da Hessiana são, respectivamente,

$$
DF(u,v)=\begin{pmatrix}2a_{20}u+a_{11}v+a_{10}&a_{11}u+2a_{02}v+a_{01}\\2b_{20}u+b_{11}v+b_{10}&b_{11}u+2b_{02}v+b_{01}\end{pmatrix},
$$

$$
M(z)=D^2F[(z,1)^T,\cdot]=\begin{pmatrix}2a_{20}z+a_{11}&a_{11}z+2a_{02}\\2b_{20}z+b_{11}&b_{11}z+2b_{02}\end{pmatrix}.
$$

O determinante projetivo satisfaz a identidade exata

$$
\det(r(z),DF(\bar U)r(z))=P(z)\bar u+Q(z)\bar v+R(z),
$$

com os polinômios definidos acima. Essas expressões devem coincidir, termo a termo, com quadraticFlux.js, zChart.js e sonic.js.

**Demonstração.** Calcula-se $DF(\bar U)r$ multiplicando o jacobiano por $r=(z,1)^T$ e expande-se $z(DF(\bar U)r)_2-(DF(\bar U)r)_1$. Os coeficientes de $\bar u,\bar v,1$ são exatamente $P,Q,R$. A matriz M resulta da diferenciação direcional do jacobiano, sem termos de ordem superior porque o fluxo é quadrático. $\square$

## Proposição — Homogeneização da equação projetiva

Na sobreposição $Z=1/z\ne0$, os coeficientes da carta recíproca são os polinômios homogeneizados

$$
\widehat P(Z)=Z^2P(1/Z),\quad\widehat Q(Z)=Z^2Q(1/Z),\quad\widehat R(Z)=Z^2R(1/Z).
$$

Se $(P,Q)\ne(0,0)$, a projeção ortogonal $U^0=-R(P,Q)/(P^2+Q^2)$ é a mesma nas duas cartas. Como $\widehat T=Z^2T$, o mesmo estado médio exige $\eta=\tau/Z^2$. A amplitude do salto obedece a $\widehat{Y}=Y/Z$.

**Demonstração.** A homogeneização multiplica simultaneamente P, Q e R por $Z^2$, deixando a expressão de U⁰ invariável. O vetor tangente não normalizado é linear em P e Q, portanto adquire o mesmo fator. A igualdade $\tau T=\eta\widehat T$ dá a transformação longitudinal. A igualdade $Y(z,1)=\widehat{Y}(1,Z)$ fornece a transformação da amplitude. Nenhuma dessas identidades deve ser prolongada por divisão até Z=0. $\square$

## Definição — Carta finita regular

Quando $N(z)=P(z)^2+Q(z)^2>0$, a reta anterior admite a parametrização

$$
\begin{aligned}U^0(z)&=-\frac{R(z)}{N(z)}(P(z),Q(z)),\\T(z)&=(-Q(z),P(z)),\\\bar U(\tau,z)&=U^0(z)+\tau T(z).\end{aligned}
$$

Portanto, os estados são reconstruídos por $U_\pm(\tau,Y,z)=\bar U(\tau,z)\pm\tfrac{Y}{2}\begin{pmatrix}z\\1\end{pmatrix}$. A velocidade $s$ é o autovalor associado a $r(z)$.

## Corolário — Dimensão e característica

Na região regular da carta, $(\tau,Y,z)$ fornece três coordenadas para a Variedade de Ondas $\mathcal W$. O subconjunto $Y=0$ é a característica $\mathcal C$: nele, os estados coincidem, mas a direção $r(z)$ continua sujeita à equação característica.

## Lema — Troca dos estados

Na carta simétrica, a involução $\dagger$ age por

$$
\dagger(\tau,Y,z)=(\tau,-Y,z),\qquad\pi_-\circ\dagger=\pi_+,\quad\pi_+\circ\dagger=\pi_-.
$$

**Demonstração.** A troca de $U_-$ por $U_+$ preserva o estado médio e inverte o salto. A direção projetiva permanece a mesma, enquanto $Y$ muda de sinal. $\square$

**Limites da carta** Quando $P=Q=0$, a parametrização por $U^0,T$ não é válida. Se também $R=0$, a equação característica deixa de restringir o estado médio nessa direção. Além disso, a direção $r=(1,0)$ exige a carta projetiva recíproca. Esses casos não podem ser eliminados por uma divisão formal.

## Proposição — A carta finita é uma parametrização local

Suponha $N(z)>0$ em um intervalo de direções. Então a equação projetiva determina uma reta afim de estados médios para cada $z$, e as coordenadas $(\tau,Y,z)$ parametrizam localmente o prolongamento da relação de Rankine–Hugoniot. A coordenada $Y$ é livre porque, para um fluxo quadrático, a velocidade do salto depende do estado médio e da direção, não da amplitude.

**Demonstração.** O vetor $(P,Q)$ é não nulo, e $T=(-Q,P)$ gera o núcleo da forma linear $(P,Q)\cdot\bar U$. Logo todo estado médio que satisfaz a equação projetiva é escrito de maneira única como $\bar U=U^0+\tau T$. Para qualquer amplitude $Y$, os estados reconstruídos satisfazem a identidade quadrática do fluxo e, portanto, Rankine–Hugoniot com a velocidade própria correspondente. O argumento é local: não abrange $N=0$ nem a direção omitida pela carta. $\square$

## Observação — Projeções e fibras de Hugoniot

As projeções $\pi_\pm(\tau,Y,z)=\bar U(\tau,z)\pm\tfrac{Y}{2}r(z)$ não são injetivas em geral. Para um estado fixado $U_*$, suas pré-imagens definem as fibras orientadas de Hugoniot. A troca de estados $\dagger$ permuta essas fibras e mantém a velocidade de choque. A regularidade de uma fibra exige analisar o posto da projeção correspondente; ela não decorre apenas da regularidade da carta.

Com a construção de $\mathcal W$ justificada, podemos definir as fibras de Hugoniot como pré-imagens de estados fixos e, em seguida, estudar as sônicas pela velocidade de choque ao longo dessas fibras.

## Rastreabilidade e domínio

As identidades acima correspondem a src/math/flux/quadraticFlux.js, src/math/charts/zChart.js e src/math/manifold/waveState.js, com referência canônica em 01-flux.tex e 02-wave-manifold.tex. A identidade exata no estado médio depende do fluxo ser quadrático; ela não se transfere automaticamente a um fluxo não linear arbitrário. Regularidade da carta, regularidade das projeções e admissibilidade de uma onda são propriedades distintas.
