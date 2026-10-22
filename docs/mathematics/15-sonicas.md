# Sônicas: definição tradicional e construção topológica

## Convenção — Três níveis de descrição

Para cada objeto geométrico, a definição tradicional é formulada em $(U_-,U_+,s)$; a construção na variedade usa $(\bar U,X,Z,s)$ com as coordenadas de salto fixadas pela convenção do modelo; por fim, as equações explícitas são apresentadas nas cartas locais $(\tau,Y,z)$ e recíproca $(\eta,\widehat{Y},Z)$. A compactificação $z_{\mathrm c}$ serve à visualização e não substitui uma carta projetiva.

## Definição tradicional — Curva de Hugoniot de um estado fixado

Fixado $U_*$, a curva tradicional de Hugoniot é o conjunto dos estados $V$ para os quais existe uma velocidade $s$ satisfazendo

$$
F(V)-F(U_*)=s(V-U_*).
$$

Para saltos não nulos em duas componentes, a condição de paralelismo pode ser expressa por $\det(F(V)-F(U_*),V-U_*)=0$; a velocidade ainda deve ser recuperada da relação vetorial. A orientação esquerda/direita não altera o conjunto de pares admissíveis por Rankine–Hugoniot, mas determina qual projeção será fixada.

## Definição — Variedade de Ondas e fibras de Hugoniot

Denotamos por $\mathcal W$ a Variedade de Ondas desingularizada, dotada das projeções $\pi_-,\pi_+$ e da velocidade de choque $s:\mathcal W\to\mathbb R$. Fixando o estado esquerdo ou direito, obtemos, respectivamente, as fibras orientadas

$$
\mathcal H^{\mathrm{forw}}(U_*)=\pi_-^{-1}(U_*),\qquad\mathcal H^{\mathrm{back}}(U_*)=\pi_+^{-1}(U_*).
$$

## Definição — Condições espectrais completas

As condições sônicas completas são os lugares em que a velocidade do choque coincide com um autovalor do jacobiano do fluxo no estado correspondente. Para distingui-las das folhas reduzidas desenhadas no aplicativo, usamos neste capítulo os símbolos auxiliares $\Sigma^-$ e $\Sigma^+$:

$$
\Sigma^- =\{P\in\mathcal W:\det(DF(U_-(P))-s(P)I)=0\},
$$

$$
\Sigma^+ =\{P\in\mathcal W:\det(DF(U_+(P))-s(P)I)=0\}.
$$

Essas equações são avaliadas diretamente pelo núcleo. Elas incluem toda a característica, onde o salto é nulo. Reservamos $\mathcal S^\pm$ para os fatores não triviais prolongados, deduzidos abaixo, conforme 05-sonic.tex. Na carta regular, vale $\Sigma^\pm=\mathcal C\cup\mathcal S^\pm$; fora de $\mathcal C$, as duas condições são equivalentes. Na característica, a folha reduzida exige ainda $K=0$.

Não se deve definir sônicas pela perda de posto de $d\pi_\pm$: as projeções vão de uma variedade tridimensional para um plano, e seus conjuntos críticos não são, em geral, as superfícies sônicas.

Na construção topológica, pela caracterização geométrica das fibras, observa-se o comportamento da função velocidade de choque restrita a uma curva de Hugoniot. Ela é uma caracterização local sob hipóteses de regularidade, não uma definição global automaticamente equivalente à condição espectral.

Esta segunda caracterização é introduzida após a definição tradicional espectral. Ela traduz a condição sônica em geometria das fibras, onde as hipóteses de regularidade permitem relacionar os dois critérios.

## Definição — Estacionariedade da velocidade na fibra

Em um ponto regular de uma fibra unidimensional de Hugoniot, dizemos que a velocidade é estacionária quando sua derivada ao longo de um vetor tangente não nulo à fibra é zero. A condição é $ds_P(v)=0$, para $0\ne v\in T_P\mathcal H$.

Fora da característica, para estudar $\mathcal S^-$ utiliza-se a fibra $\mathcal H^{\mathrm{back}}(U_+)$, que mantém o estado direito fixo; para $\mathcal S^+$, a fibra $\mathcal H^{\mathrm{forw}}(U_-)$, que mantém o esquerdo fixo.

## Proposição — Estacionariedade implica condição sônica

Seja $P=(U_-,U_+,s)\in\mathcal W$ um choque não trivial, e seja uma curva regular de Hugoniot com estado direito fixo, parametrizada por $t\mapsto(U_-(t),U_+,s(t))$. Se $U_-'(t_0)\ne0$ e $s'(t_0)=0$, então $P\in\mathcal S^-$. Analogamente, estacionariedade em uma fibra com estado esquerdo fixo e derivada não nula do estado direito implica $P\in\mathcal S^+$.

**Demonstração.** Diferenciando $F(U_+)-F(U_-)=s(U_+-U_-)$ com $U_+$ fixo, obtemos $(DF(U_-)-sI)U_-'=s'(U_--U_+)$. Quando $s'=0$, o vetor não nulo $U_-'$ pertence ao núcleo de $DF(U_-)-sI$. A demonstração para o outro estado é análoga. $\square$

**Sobre a recíproca** A condição espectral não implica automaticamente estacionariedade em qualquer parametrização degenerada da fibra. A equivalência entre as duas caracterizações exige hipóteses de regularidade e transversalidade; essas hipóteses devem ser verificadas no ponto estudado.

## Proposição — Simetria pela involução canônica

A involução $\dagger:(\tau,Y,z)\mapsto(\tau,-Y,z)$ troca os estados e preserva a velocidade de choque. Assim, onde as cartas estão definidas,

$$
\pi_+\circ\dagger=\pi_-,\qquad\dagger(\mathcal S^-)=\mathcal S^+.
$$

**Demonstração.** A troca dos estados deixa a relação de Rankine–Hugoniot invariante e permuta os dois determinantes da definição tradicional. $\square$

## Proposição — Equações implícitas na carta finita

Com as quantidades $M,K$ definidas pela parametrização quadrática, os determinantes se fatoram como

$$
\det(DF(U_-)-sI)=\frac{Y}{4}(Y\det M-2K),
$$

$$
\det(DF(U_+)-sI)=\frac{Y}{4}(Y\det M+2K).
$$

Fora da característica $\mathcal C=\{Y=0\}$, as folhas sônicas não triviais são dadas por

$$
\mathcal S^-:\ Y\det M-2K=0,\qquad\mathcal S^+:\ Y\det M+2K=0.
$$

## Lema — Velocidade de choque na carta projetiva

Como $r(z)=(z,1)^T$ e $(DF(\bar U)-sI)r=0$, a segunda componente determina diretamente a velocidade:

$$
s=g_u(\bar U)z+g_v(\bar U).
$$

A primeira componente exige simultaneamente $f_u(\bar U)z+f_v(\bar U)=sz$. Substituindo a expressão de s, recuperamos exatamente a equação projetiva da variedade. Assim, a fórmula da velocidade não é uma condição adicional independente.

**Demonstração.** O sistema vetorial $DF(\bar U)r=sr$ tem componentes $f_uz+f_v=sz$ e $g_uz+g_v=s$. Eliminando s entre elas obtemos $f_uz+f_v-z(g_uz+g_v)=0$, equivalente à equação característica projetiva, a menos de sinal. $\square$

## Lema — Expansão exata do jacobiano quadrático

Como o fluxo é quadrático, sua derivada é afim. Definindo $A=DF(\bar U)-sI$ e $B=D^2F[r(z),\cdot]$, onde a Hessiana vetorial é constante, obtemos exatamente

$$
DF(U_\pm)-sI=A\pm\frac Y2 B.
$$

Não há termo de resto de Taylor: essa identidade é exata para todo salto na carta.

**Demonstração.** Substituímos $U_\pm=\bar U\pm Yr/2$ na identidade afim $DF(\bar U+h)=DF(\bar U)+D^2F[h,\cdot]$. $\square$

## Proposição — Dedução dos determinantes sônicos

Para matrizes quadradas de ordem dois vale a identidade algébrica

$$
\det(A+tB)=\det A+t\operatorname{tr}(\operatorname{adj}(A)B)+t^2\det B.
$$

A relação projetiva de Rankine–Hugoniot fornece $Ar=0$; portanto $\det A=0$. Escrevendo

$$
L=\operatorname{tr}(\operatorname{adj}(A)B),\qquad J=\det B,
$$

segue a fatoração explícita

$$
\det(DF(U_\pm)-sI)=\pm\frac Y2 L+\frac{Y^2}{4}J=\frac Y4(YJ\pm2L).
$$

Comparando com as convenções da carta utilizadas no núcleo, identificam-se exatamente $M=B$, $\det M=J$ e $K=L$. Essas identidades coincidem com as definições de directionalJacobian e sonicData do núcleo matemático.

**Demonstração.** A fórmula do determinante é uma identidade polinomial em t. A equação $Ar=0$ torna A singular. Aplicando a identidade com $t=\pm Y/2$ obtêm-se os dois fatores; a remoção do fator Y só é permitida fora da característica. $\square$

## Corolário — Equações implícitas sem divisão por determinantes

Definindo as funções escalares $\Phi_-=Y\det M-2K$ e $\Phi_+=Y\det M+2K$, as folhas sônicas prolongadas são os conjuntos de nível zero $\Phi_-=0$ e $\Phi_+=0$. Esta formulação não exige resolver Y como função de outras coordenadas nem dividir por $\det M$.

Em particular, ela preserva os pontos em que $K=\det M=0$, candidatos à dupla sônica, e a interseção com a característica, onde $Y=K=0$. A existência de uma superfície regular em cada ponto depende, adicionalmente, do posto do gradiente de $\Phi_\pm$.

## Proposição — Equações sônicas na sobreposição das cartas

Seja $r(z)=(z,1)^T$ a direção na carta finita e $\widehat r(Z)=(1,Z)^T$ a direção na carta recíproca. Na sobreposição $Z=1/z\ne0$, vale $\widehat r=Zr$. Para representar o mesmo salto, escrevemos $Y r=\widehat{Y}\widehat r$, donde $Y=Z\widehat{Y}$.

Definindo $\widehat M=D^2F[\widehat r,\cdot]$ e $\widehat K=\operatorname{tr}(\operatorname{adj}(A)\widehat M)$, com $A=DF(\bar U)-sI$, obtemos, no mesmo ponto físico,

$$
\widehat M=ZM,\qquad \det\widehat M=Z^2\det M,\qquad \widehat K=ZK.
$$

Logo, os representantes implícitos nas duas cartas satisfazem

$$
\widehat\Phi_\pm=\widehat{Y}\det\widehat M\pm2\widehat K=Z\bigl(Y\det M\pm2K\bigr)=Z\Phi_\pm.
$$

Como $Z\ne0$ na sobreposição, os conjuntos de zeros correspondem exatamente. O fator não nulo muda a função definidora, mas não a superfície geométrica. A identidade não autoriza avaliar a carta finita em $Z=0$; nessa direção usa-se diretamente a equação recíproca.

**Demonstração.** Por bilinearidade da Hessiana do fluxo quadrático, $D^2F[Zr,\cdot]=Z D^2F[r,\cdot]$. O determinante de uma matriz de ordem dois é homogêneo de grau dois, enquanto $\operatorname{tr}(\operatorname{adj}(A)M)$ é linear em M. Substituindo $Y=Z\widehat{Y}$ na expressão implícita, resulta a identidade anunciada. A transição do parâmetro longitudinal, quando necessária para calcular $\bar U$, deve respeitar a parametrização efetiva das fibras; não se obtém apenas trocando z por Z. $\square$

## Proposição — Equações sônicas diretamente na direção projetiva Z=0

Na carta recíproca, use $\widehat r(Z)=(1,Z)^T$ e $U_\pm=\bar U\pm (\widehat{Y}/2)\widehat r(Z)$. Defina $A=DF(\bar U)-sI$, $\widehat M(Z)=D^2F[\widehat r(Z),\cdot]$ e $\widehat K=\operatorname{tr}(\operatorname{adj}(A)\widehat M)$. A matriz direcional tem a expressão polinomial

$$
\widehat M(Z)=\begin{pmatrix}2a_{20}+a_{11}Z&a_{11}+2a_{02}Z\\2b_{20}+b_{11}Z&b_{11}+2b_{02}Z\end{pmatrix}.
$$

Em um ponto da variedade projetiva que satisfaça $A\widehat r=0$, as extensões sônicas são definidas, sem divisão por Z, por

$$
\widehat\Phi_\pm=\widehat{Y}\det \widehat M\pm 2\widehat K=0.
$$

Na direção excepcional $Z=0$, a equação característica exige $f_u(\bar U)=s$ e $g_u(\bar U)=0$. Logo, $A=\begin{pmatrix}0&f_v(\bar U)\\0&g_v(\bar U)-s\end{pmatrix}$ e

$$
\det \widehat M(0)=2(a_{20}b_{11}-a_{11}b_{20}),\qquad \widehat K(0)=2a_{20}(g_v-s)-2b_{20}f_v.
$$

Assim, $\widehat\Phi_\pm(0)=2\widehat{Y}(a_{20}b_{11}-a_{11}b_{20})\pm4[a_{20}(g_v-s)-b_{20}f_v]$. Esta equação é válida também em $Z=0$ nos pontos em que a carta recíproca parametriza regularmente a variedade; ela não afirma regularidade automática do conjunto de zeros.

**Demonstração.** Como o fluxo é quadrático, $DF(U_\pm)-sI=A\pm(\widehat{Y}/2)\widehat M$. A condição $A\widehat r=0$ implica $\det A=0$. A identidade do determinante de matrizes de ordem dois dá $\det(DF(U_\pm)-sI)=\frac{\widehat{Y}}4\widehat\Phi_\pm$. Substituindo Z=0 nas matrizes, obtemos as expressões indicadas, sem recorrer à transição com a carta finita. $\square$

**Extensão à característica** Os determinantes completos se anulam em $Y=0$ pela relação característica. A remoção desse fator define as folhas sônicas não triviais e sua extensão algébrica à característica; não se deve confundir as duas equações com o conjunto completo dos determinantes nulos.

## Relação com a implementação e a realização física

Em src/math/sonic/sonic.js, sonicDeterminant avalia o determinante do extremo; sonicFullImplicit avalia sua fatoração completa; sonicImplicit avalia somente $\Phi_\pm$. Portanto, um determinante nulo na característica não basta para concluir que o ponto pertence à folha reduzida exibida. O valor excepcional de sonicData sinaliza simultânea proximidade de $K$ e $\det M$ a zero, segundo a tolerância; não certifica posto, transversalidade ou existência de um ramo regular.

Na variedade, o ponto guarda a velocidade do choque e os dois extremos. No espaço de estados, a condição compara essa mesma velocidade com uma velocidade própria em um dos extremos. No espaço físico, ela expressa igualdade entre a velocidade da interface e uma velocidade característica desse estado. Essa igualdade não seleciona sozinha uma onda composta admissível.

A superfície renderizada aproxima o conjunto de zeros implícito em uma janela e resolução finitas. Furos, ausência de triângulos ou interseções aparentes não substituem a avaliação dos resíduos e a análise de regularidade.
