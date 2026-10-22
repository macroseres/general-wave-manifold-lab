# Inflexão e dupla sônica: dedução e geometria

## Proposição — Auditoria algébrica e limites de regularidade

Considere um ponto regular da carta finita, com $r=(z,1)^T$, $A=DF(\bar U)-sI$, $Ar=0$ e $M=D^2F[r,\cdot]$. Para o fluxo quadrático, a identidade exata

$$
\det(DF(U_\pm)-sI)=\frac{Y}{4}\bigl(Y\det M\pm 2K\bigr),\quad K=\operatorname{tr}(\operatorname{adj}(A)M)
$$

permite verificar as equações sônicas por avaliação direta dos determinantes, sem dividir por $Y$ ou $\det M$. Os zeros das funções reduzidas $\Phi_\pm$ representam as extensões sônicas; os determinantes completos também se anulam na característica $Y=0$.

A inflexão candidata requer $Y=K=0$, e a dupla sônica não trivial requer $Y\ne0,\ K=\det M=0$. Essas condições são algébricas: a regularidade de $\mathcal J$ ou $\mathcal{DS}$ exige, adicionalmente, hipóteses de posto e simplicidade espectral onde apropriado.

**Demonstração.** Como $DF(U_\pm)-sI=A\pm (Y/2)M$ e $\det A=0$, aplicamos a identidade polinomial $\det(A+tM)=\det A+tK+t^2\det M$. O resultado é exato, inclusive quando $Y=0$ ou $\det M=0$. A equivalência dos conjuntos reduzidos entre cartas só é afirmada onde a mudança projetiva é regular; a direção $Z=0$ deve ser avaliada na carta recíproca. $\square$

## Convenção — Da condição tradicional à construção topológica

Primeiro definimos a inflexão pela derivada direcional da velocidade característica e a dupla sônica pelas duas condições espectrais nos estados extremos. Em seguida, levantamos esses lugares à Variedade de Ondas e só então deduzimos suas equações implícitas na carta finita. A passagem à carta recíproca exige transformar as equações pela transição efetiva entre cartas, sem simplesmente trocar o símbolo $z$ por $Z$.

## Definição — Perda de genuína não linearidade

Em uma região estritamente hiperbólica, seja $DF(U)r_i(U)=\lambda_i(U)r_i(U)$. A curva de inflexão da família i é o levantamento à característica do lugar onde a derivada da velocidade característica ao longo de sua própria direção se anula.

$$
\nabla\lambda_i(U)\cdot r_i(U)=0.
$$

## Proposição — Interpretação pela rarefação

Se $U'(t)=r_i(U(t))$, então

$$
\frac{d}{dt}\lambda_i(U(t))=\nabla\lambda_i(U(t))\cdot r_i(U(t)).
$$

Assim, a inflexão é o lugar onde a velocidade característica fica estacionária ao longo da curva integral. Uma inflexão não degenerada exige ainda que a derivada seguinte não se anule.

**Demonstração.** Aplicamos a regra da cadeia à composição da função autovalor com a solução da EDO de rarefação. A conclusão vale onde o autovalor e o autovetor admitem escolhas diferenciáveis. $\square$

## Proposição — Equação implícita na carta

Na parametrização algébrica utilizada pelo laboratório, o conjunto algébrico candidato à curva de inflexão é

$$
\mathcal J_{\mathrm{cand}}=\{Y=0,\ K=0\}\subset\mathcal C.
$$

A relação com a condição espectral pode ser demonstrada nos pontos regulares e com autovalor simples: ao longo de uma curva característica, a derivada de $\lambda_i$ é proporcional à derivada da velocidade de choque no levantamento característico. A equivalência global em pontos degenerados requer análise separada.

## Proposição — Relação exata entre K e a derivada característica

Na característica, suponha que a velocidade própria $s=\lambda_i(U)$ seja simples e que a outra velocidade seja $\mu\ne s$. Escolha autovetores direito $r$ e esquerdo $\ell$, com $\ell^Tr\ne0$. Então

$$
\nabla\lambda_i(U)\cdot r=\frac{\ell^T D^2F[r,r]}{\ell^Tr},\qquad
K=(\mu-s)\bigl(\nabla\lambda_i(U)\cdot r\bigr).
$$

Em particular, $K=0$ equivale à perda de genuína não linearidade nessa direção sob as hipóteses indicadas.

**Demonstração.** Diferenciando $DF(U)r=\lambda_i(U)r$ na direção $r$ e multiplicando por $\ell^T$, cancelam-se os termos de derivada do autovetor e obtém-se a primeira identidade. Para $A=DF(U)-sI$, os autovalores são zero e $\mu-s$. Em dimensão dois, $\operatorname{adj}(A)=(\mu-s)r\ell^T/(\ell^Tr)$. Logo $K=\operatorname{tr}(\operatorname{adj}(A)M)=(\mu-s)\ell^TMr/(\ell^Tr)$, com $Mr=D^2F[r,r]$. $\square$

Quando $\mu=s$, essa demonstração não permite dividir pelo intervalo espectral. Portanto, o conjunto algébrico $Y=K=0$ pode conter pontos que precisam de outra interpretação na coincidência. Também não se presume que o conjunto de perda de genuína não linearidade seja sempre uma curva regular.

## Proposição — Invariância projetiva da inflexão

Na interseção das cartas, com $Z=1/z\ne0$ e $\widehat r=Zr$, a condição tradicional de inflexão é preservada: 

$$
\nabla\lambda_i(U)\cdot\widehat r=Z\bigl(\nabla\lambda_i(U)\cdot r\bigr).
$$

Além disso, como $\widehat K=ZK$ e o salto nulo é descrito por $Y=0\iff\widehat{Y}=0$, os candidatos algébricos $\{Y=0,K=0\}$ e $\{\widehat{Y}=0,\widehat K=0\}$ coincidem na sobreposição. A equivalência com a definição espectral continua condicionada à simplicidade do autovalor e à regularidade do levantamento.

**Demonstração.** O produto escalar com o gradiente é linear na direção própria, e o fator Z não se anula na sobreposição. A identidade para K segue da linearidade de $D^2F[r,\cdot]$ em r. A transição de amplitudes é $Y=Z\widehat{Y}$. Portanto, as duas condições algébricas definem os mesmos pontos físicos nessa região. $\square$

## Definição — Dupla sônica

$$
\mathcal{DS}=(\mathcal S^-\cap\mathcal S^+)\setminus\mathcal C.
$$

É o lugar em que a velocidade do mesmo choque é característica nos dois estados extremos, com salto não nulo.

## Proposição — Eliminação algébrica

Para as folhas prolongadas dadas por $\Phi_-=Y\det M-2K$ e $\Phi_+=Y\det M+2K$, vale, fora da característica,

$$
\mathcal{DS}=\{K=0,\ \det M=0,\ Y\ne0\}.
$$

**Demonstração.** Somando $\Phi_-=0$ e $\Phi_+=0$, obtemos $2Y\det M=0$. Subtraindo, obtemos $4K=0$. Como $Y\ne0$, seguem as duas equações. A recíproca resulta por substituição. $\square$

## Proposição — Invariância projetiva da dupla sônica

Na sobreposição das cartas, as condições que definem a dupla sônica transformam-se segundo

$$
\widehat K=ZK,\qquad\det\widehat M=Z^2\det M,\qquad Y=Z\widehat{Y}.
$$

Como $Z\ne0$, obtemos a equivalência

$$
\{K=0,\det M=0,Y\ne0\}\iff\{\widehat K=0,\det\widehat M=0,\widehat{Y}\ne0\}.
$$

Assim, as duas cartas representam o mesmo conjunto $\mathcal{DS}$ onde ambas são válidas.

**Demonstração.** A transformação do tensor direcional fornece $\widehat M=ZM$. Como M é uma matriz de ordem dois, seu determinante multiplica-se por $Z^2$; o escalar K multiplica-se por Z. Esses fatores são não nulos na sobreposição, e a amplitude não nula também é preservada. $\square$

## Proposição — Inflexão na direção projetiva Z=0

Na carta recíproca, a candidata algébrica à inflexão é $\{\widehat{Y}=0,\ \widehat K=0\}$. Na direção $Z=0$, a condição característica $A(1,0)^T=0$ implica $f_u(\bar U)=s$ e $g_u(\bar U)=0$. Portanto, a condição algébrica reduz-se a

$$
\widehat{Y}=0,\qquad a_{20}(g_v(\bar U)-s)-b_{20}f_v(\bar U)=0.
$$

Quando o autovalor s é simples, esta última igualdade equivale à condição tradicional de perda de genuína não linearidade na direção $\widehat r=(1,0)^T$. Sem simplicidade espectral, a igualdade é apenas um critério algébrico candidato.

**Demonstração.** Na direção Z=0, a matriz $\widehat M=D^2F[(1,0)^T,\cdot]$ tem primeira coluna $(2a_{20},2b_{20})^T$, e a fórmula deduzida para a carta recíproca fornece $\widehat K=2[a_{20}(g_v-s)-b_{20}f_v]$. Se s é simples, a derivada direcional do autovalor é $\ell^TD^2F[\widehat r,\widehat r]/(\ell^T\widehat r)$, para um autovetor esquerdo $\ell$. Podemos tomar $\ell=(g_v-s,-f_v)^T$, cujo produto com $\widehat r$ é não nulo quando s é simples. A condição de anulação coincide com a expressão acima. $\square$

## Proposição — Dupla sônica na direção projetiva Z=0

Para saltos não nulos $\widehat{Y}\ne0$, a dupla sônica na carta recíproca satisfaz $\widehat K=0$ e $\det \widehat M=0$. Em Z=0, isso equivale às duas condições algébricas

$$
a_{20}(g_v(\bar U)-s)-b_{20}f_v(\bar U)=0,\qquad a_{20}b_{11}-a_{11}b_{20}=0.
$$

Essas condições devem ser impostas juntamente com $f_u(\bar U)=s$, $g_u(\bar U)=0$ e $\widehat{Y}\ne0$. Não se conclui, somente dessas igualdades, que haja um ramo regular ou uma interseção transversal.

**Demonstração.** Substituindo Z=0 nas expressões polinomiais da carta recíproca, obtemos $\widehat K(0)=2[a_{20}(g_v-s)-b_{20}f_v]$ e $\det \widehat M(0)=2(a_{20}b_{11}-a_{11}b_{20})$. A soma e a diferença das equações $\widehat\Phi_\pm=0$, com amplitude não nula, equivalem à anulação simultânea dessas duas quantidades. $\square$

## Critério de auditoria — Regularidade em Z=0

Para classificar os ramos locais de $\mathcal J$ e $\mathcal{DS}$, avaliar os diferenciais das funções definidoras nas coordenadas efetivas $(\eta,\widehat{Y},Z)$. Na dupla sônica, a independência de $d\widehat K$ e $d(\det \widehat M)$ assegura uma interseção local unidimensional; posto menor exige análise singular adicional. A existência de soluções das condições algébricas depende dos coeficientes do fluxo e não é garantida para todos os parâmetros.

## Proposição — Classificação local das degenerações da dupla sônica

Na carta recíproca regular, considere $G=(\widehat K,\det \widehat M)$ restrita ao domínio tridimensional $(\eta,\widehat Y,Z)$, com $\widehat Y\ne0$. Um ponto pertence à dupla sônica se, e somente se, $G=0$. Se $G\ne0$, não há dupla sônica nesse ponto. Se $G=0$ e $\operatorname{rank}DG=2$, a dupla sônica é localmente uma curva suave. Se $G=0$ e $\operatorname{rank}DG<2$, as equações não determinam, por si só, a dimensão ou a topologia local do conjunto de zeros.

**Demonstração.** O primeiro caso segue da própria definição de conjunto de zeros. No segundo, o teorema da função implícita aplicado a duas equações independentes em três variáveis fornece dimensão local $3-2=1$. No último caso, a hipótese de posto necessária ao teorema falha: podem ocorrer pontos isolados, curvas singulares, componentes de dimensão superior ou mesmo zeros não isolados. A classificação exige analisar os termos de ordem superior ou realizar uma decomposição algébrica local. $\square$

## Critério de auditoria — Casos especiais na direção Z=0

Na direção projetiva $Z=0$, verificar primeiro as equações características $f_u=s$ e $g_u=0$, depois as condições $a_{20}(g_v-s)-b_{20}f_v=0$ e $a_{20}b_{11}-a_{11}b_{20}=0$. A anulação dessas expressões é necessária para a dupla sônica, mas a existência de um ramo exige ainda examinar $DG$ nas coordenadas efetivas da carta. O posto de $DG$ não pode ser inferido apenas dessas equações restritas a $Z=0$, pois derivadas transversais em Z também contribuem.

**Direção excepcional e regularidade** 

Na direção $Z=0$, as equações devem ser avaliadas diretamente na carta recíproca; não se deve usar as identidades de transição como se a carta finita estivesse definida nesse ponto. A invariância dos conjuntos de zeros não prova, por si só, que a inflexão seja uma curva regular nem que a dupla sônica seja uma interseção transversal. Para tais conclusões, é necessário verificar o posto dos diferenciais no ponto considerado.

## Observação — Geometria das fibras

Uma sônica marca a coincidência entre velocidade de choque e velocidade característica de um dos estados. A dupla sônica impõe ambas as coincidências simultaneamente. A regularidade de $\mathcal{DS}$ como curva requer independência dos gradientes das duas equações; a interseção algébrica, isoladamente, não garante transversalidade.

## Convenções do código e cobertura numérica

O módulo src/math/sonic/intersections.js avalia os fatores canônicos e distingue o resíduo da base $K=\det M=0$ do resíduo da dupla sônica com salto não nulo. Em particular, doubleSonicResidual devolve Infinity para $Y=0$, em acordo com a definição não trivial usada neste capítulo.

Já src/math/sonic/commonIntersection.js usa o rótulo onDS para o conjunto algébrico estendido $K=\det M=0$, incluindo $Y=0$. Por isso pode retornar J-and-DS. Esse rótulo indica sobreposição de condições algébricas; não significa um choque de dupla sônica não trivial na característica. A distinção é necessária ao comparar figuras, resíduos e relatórios de auditoria.

Na carta regular, a soma e a diferença dos fatores fornecem a decomposição exata

$$
\{\Phi_-=\Phi_+=0\}
=\{Y=0,K=0\}\ \cup\ \{Y\ne0,K=0,\det M=0\}.
$$

O primeiro conjunto é candidato algébrico à inflexão; a equivalência com a definição tradicional requer as hipóteses espectrais demonstradas acima. O segundo é a dupla sônica não trivial. A decomposição dos zeros não demonstra que cada componente seja regular ou que uma malha finita cubra todos os ramos.

O cálculo de bases isoladas em doubleSonicBasePoints usa direções finitas, uma janela de parâmetros e verificações numéricas. Bases não isoladas, direções recíprocas e casos degenerados exigem análise própria. Uma lista vazia nesse procedimento não é uma prova de inexistência global.

As fórmulas canônicas estão em 05-sonic.tex. No espaço de estados projetam-se os extremos dos mesmos pontos da variedade; no espaço físico a dupla sônica impõe duas igualdades características para a mesma interface. Nenhuma dessas condições assegura isoladamente existência ou admissibilidade de uma cadeia de Riemann.
