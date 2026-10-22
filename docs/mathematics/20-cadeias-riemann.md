# Construção de cadeias de ondas para o problema de Riemann

Os estados inicial e final são fixados pelo problema de Riemann da seção 1.1. A construção na Variedade de Ondas $\mathcal W$ procura uma sequência orientada de ondas elementares que conecte esses estados, respeitando simultaneamente a relação de Rankine–Hugoniot, as famílias características e a ordenação em $\xi=x/t$.

## Definição — Cadeia candidata de ondas

Uma cadeia é uma sequência finita de estados $U_0=U_L,U_1,\ldots,U_m=U_R$, na qual cada ligação é um choque, um leque de rarefação ou um trecho composto, com velocidades ou intervalos de velocidades associados. A existência de uma cadeia algébrica não implica que ela defina uma solução admissível.

## Definição — Curvas orientadas de ondas

Partindo de $U_L$, exploram-se as rarefações e as fibras de Hugoniot de estado esquerdo fixo; partindo de $U_R$, pode-se reconstruir a cadeia retrospectivamente por fibras de estado direito fixo. A orientação da cadeia é sempre da esquerda para a direita no espaço físico, mesmo quando o cálculo é feito retrospectivamente.

## Proposição — Ordenação das velocidades dos choques

Para uma solução autossimilar por partes constantes com choques em $\xi=s_1,\ldots,s_m$ e regiões constantes de largura positiva entre choques consecutivos, necessariamente $s_1<\cdots<s_m$. Cada salto satisfaz $F(U_j)-F(U_{j-1})=s_j(U_j-U_{j-1})$.

**Demonstração.** A condição de Rankine–Hugoniot decorre da formulação fraca em cada interface. Como as interfaces ocupam as posições $x=s_jt$ para $t>0$, a existência de intervalos não vazios entre elas exige a ordenação estrita indicada. $\square$

## Proposição — Compatibilidade de choques e leques

Se um leque de rarefação da família $i$ ocupa o intervalo $[\lambda_i(U_a),\lambda_i(U_b)]$, então qualquer choque imediatamente à sua esquerda deve ter velocidade não superior à velocidade da borda esquerda; qualquer choque imediatamente à sua direita deve ter velocidade não inferior à velocidade da borda direita. Igualdade é permitida em uma junção sônica, desde que os traços coincidam apropriadamente.

**Demonstração.** Em coordenadas autossimilares, um leque ocupa precisamente seu intervalo de velocidades características. Uma interface adjacente não pode situar-se no interior desse intervalo sem truncar o leque; nas extremidades, a continuidade dos traços ou uma condição de salto compatível permite a colagem fraca. $\square$

## Definição — Rarefação seguida de choque composto

Considere um arco de rarefação $U_L\rightsquigarrow U_*$ e um choque $U_*\to U_+$. A junção é sônica no estado $U_*$ quando $s(U_*,U_+)=\lambda_i(U_*)$. O choque é então representado por um ponto da folha sônica correspondente ao lado em que se encontra $U_*$; a família de tais junções é descrita pela curva composta $\mathcal K_\pm$ desenvolvida na seção 19 (capítulo VI, seção 3).

## Observação — Choques locais e não locais

Um choque local pode ser acompanhado por continuação a partir da característica, mas um choque não local pode conectar estados afastados no espaço de estados. A relação de Rankine–Hugoniot deve ser verificada nos dois casos; proximidade geométrica não substitui a condição de salto. Para choques não locais, a seleção de ramos e a admissibilidade requerem atenção especial.

## Observação — Admissibilidade e perfil viscoso

As condições de Lax e Liu são critérios distintos de seleção de choques, aplicáveis sob suas hipóteses próprias. Quando se usa uma regularização viscosa $U_t+F(U)_x=\varepsilon(B(U)U_x)_x$, a existência de uma órbita de perfil viajante com os limites prescritos fornece outro teste, dependente da matriz viscosa $B(U)$. Nem toda cadeia que satisfaz Rankine–Hugoniot e ordenação de velocidades é automaticamente admissível.

## Definição — Construção progressiva e retrospectiva da solução

A partir de $U_L$, uma construção progressiva seleciona uma onda admissível e seu estado de saída, repetindo o processo até atingir $U_R$. Uma construção retrospectiva parte de $U_R$ e utiliza as fibras de Hugoniot com estado direito fixo. As duas construções descrevem a mesma cadeia física somente quando os estados intermediários, os sentidos das ondas e a ordem das velocidades concordam.

Na variedade $\mathcal W$, cada choque corresponde a um ponto intrínseco $(U_-,U_+,s)$. As coordenadas $(\bar U,X,Z,s)$ organizam as fibras e interseções; as cartas $(\tau,Y,z)$ e recíproca servem para calcular e visualizar essas construções, sem modificar a cadeia de estados.

## Definição — Perfil viscoso de um choque

Considere uma regularização $U_t+F(U)_x=\varepsilon(B(U)U_x)_x$, com $\varepsilon>0$ e matriz viscosa $B(U)$. Para um choque candidato $U_-\to U_+$ de velocidade $s$, procura-se uma onda viajante $U(x,t)=V(\xi),\ \xi=(x-st)/\varepsilon$, tal que $V(-\infty)=U_-$ e $V(+\infty)=U_+$.

$$
B(V)V'=F(V)-F(U_-)-s(V-U_-).
$$

Uma solução com esses limites é uma órbita heteroclínica do sistema de perfil (quando os equilíbrios são isolados). O teste depende de $B$ e da orientação de $\xi$; não é uma condição adicional a ser imposta às regiões de rarefação.

**Demonstração.** Substituindo a onda viajante na equação viscosa, obtemos $-sV'+DF(V)V'=(B(V)V')'$. Integramos em $\xi$ e usamos o limite à esquerda, supondo $B(V)V'\to0$, para fixar a constante de integração. O limite à direita recupera a condição de Rankine–Hugoniot. Se $B(V)$ for inversível, pode-se escrever $V'=B(V)^{-1}[F(V)-F(U_-)-s(V-U_-)]$; não se pressupõe essa inversibilidade em geral. $\square$

## Procedimento — Verificação de uma cadeia completa

Primeiro, verificar cada trecho de rarefação pela EDO característica e pela monotonicidade da velocidade na orientação escolhida. Segundo, verificar cada choque pela condição de Rankine–Hugoniot e pelo critério de admissibilidade adotado. Terceiro, nas junções compostas, conferir a igualdade sônica no estado de conexão e a compatibilidade das orientações. Quarto, ordenar os intervalos de velocidades em $\xi=x/t$, sem sobreposição indevida. Quinto, verificar os estados extremos, o traço inicial e, quando pertinente, a existência de perfis viscosos para os choques. Uma falha em qualquer etapa invalida a cadeia como solução sob o critério escolhido.

## Observação — Limites dos testes de admissibilidade

Rankine–Hugoniot é necessário para uma descontinuidade conservativa, mas não seleciona sozinho o choque físico. Condições de Lax e Liu têm hipóteses próprias; perfis viscosos dependem da regularização. A existência de um perfil para um choque não prova automaticamente a existência ou a unicidade de uma cadeia global que resolva os dados de Riemann.

## Proposição — Verificação de uma cadeia candidata

Considere um perfil localmente limitado com um número finito de trechos de classe $C^1$, traços nas interfaces e fluxo localmente integrável. Se os trechos suaves satisfazem a lei de conservação, os choques satisfazem Rankine–Hugoniot, os traços coincidem nas junções contínuas e as regiões de similaridade estão corretamente ordenadas, então a função autossimilar por partes assim construída é solução fraca no domínio $t>0$. Para resolver o problema de Riemann, ainda é necessário verificar o traço inicial e a admissibilidade adotada.

**Demonstração.** Em cada região suave, a equação vale classicamente. Na integração por partes contra uma função teste, os termos interiores se cancelam; nas interfaces, os termos de fronteira se anulam pela condição de Rankine–Hugoniot. A compatibilidade dos traços evita fontes concentradas nas junções contínuas. A condição inicial e a entropia não decorrem desse argumento e devem ser verificadas separadamente. $\square$

**Escopo** Esta seção fornece condições de construção e verificação de cadeias candidatas. Não demonstra existência, unicidade nem classificação global de soluções para todo fluxo quadrático de dez coeficientes.

## Proposição — Traço inicial de uma cadeia limitada

Suponha que $V(\xi)$ seja limitado, igual a $U_L$ para $\xi<a$ e a $U_R$ para $\xi>b$, com $a,b$ finitos. Então $U(x,t)=V(x/t)$ converge em $L^1_{\mathrm{loc}}$ para o dado de Riemann quando $t\downarrow0$.

**Demonstração.** Tome $C>\max(|a|,|b|)$. Fora de $[-Ct,Ct]$, o perfil coincide com o estado inicial correspondente. Dentro desse intervalo, a diferença é limitada uniformemente, e o comprimento é $2Ct$. Portanto, a integral da diferença sobre qualquer compacto é limitada por uma constante vezes $t$ e converge a zero. $\square$

Essa conclusão fornece o traço inicial para uma cadeia exata com velocidades finitas e estados externos corretos. Ela não transforma uma interpolação numérica que falha na equação em solução fraca exata.

## Construções disponíveis no aplicativo

Em src/math/solution/riemannWaveChains.js, assessTwoShockChain verifica numericamente os dois saltos e a ordenação estrita das velocidades. O resultado ordered-rh-candidate conserva entropyCertified como false. O módulo mixedWaveChains.js trata candidatos rarefação–choque e choque–rarefação com seus próprios critérios e refinamentos. Esses casos não representam uma enumeração de todas as sequências possíveis para todos os parâmetros.

O módulo riemannSelfSimilarCandidate.js constrói perfis candidatos. Para dois choques, usa três estados e duas velocidades ordenadas. Para ondas mistas, exige pré-requisitos de ramo, estado intermediário refinado, leque amostrado e separação de velocidades. Na implementação atual, mixedSelfSimilarCandidate exige separação estrita com tolerância; ele não realiza automaticamente a junção de velocidade igual permitida matematicamente em uma onda composta sônica.

evaluateSelfSimilarCandidate interpola os estados do leque por velocidade para visualização; essa interpolação não é uma solução exata da EDO. Nos pontos de choque, o avaliador escolhe o traço direito. Essa convenção pontual não modifica uma solução fraca, mas deve ser conhecida ao comparar valores amostrados. Nenhum desses perfis recebe certificação entrópica global.

## Correspondência entre os três espaços

No espaço de estados, a cadeia guarda estados intermediários e curvas orientadas. Na variedade, cada choque não trivial deve manter seu par local de estados, velocidade e ramo; as rarefações usam trechos da característica. A cadeia na variedade é uma coleção compatível de trechos e incidências, não necessariamente uma única órbita de um mesmo campo.

No espaço físico, cada trecho deve ocupar a posição ou intervalo correto de $\xi$. O mesmo estado intermediário pode ligar dois objetos distintos na variedade por projeções diferentes. Para afirmar que as três vistas representam a mesma cadeia, é necessário conservar essas identificações, conferir os extremos e as velocidades e indicar o critério de admissibilidade aplicado.

O sistema de perfil viscoso apresentado acima é uma definição e uma dedução teórica. Este capítulo não afirma que exista um verificador geral de órbitas heteroclínicas para toda matriz $B$ no aplicativo.

## Exemplo — Dois choques com um estado intermediário

Para o fluxo triangular do capítulo 11, escolha

$$
U_L=(2,1),\quad U_M=(2,0),\quad U_R=(0,-1).
$$

As avaliações do fluxo são $F(U_L)=(2,2)$, $F(U_M)=(2,3/2)$ e $F(U_R)=(0,1/2)$. Portanto,

$$
F(U_M)-F(U_L)=(0,-1/2)=\frac12(U_M-U_L),
$$

$$
F(U_R)-F(U_M)=(-2,-1)=1\,(U_R-U_M).
$$

Os choques têm velocidades $s_1=1/2<s_2=1$. Os espectros ordenados são $(1,2)$ em $U_L$, $(0,2)$ em $U_M$ e $(-1,0)$ em $U_R$. O primeiro choque é estritamente Lax 1; o segundo, estritamente Lax 2. Não há igualdade sônica nos extremos.

O perfil autossimilar é

$$
V(\xi)=\begin{cases}(2,1),&\xi<1/2,\\(2,0),&1/2<\xi<1,\\(0,-1),&\xi>1.\end{cases}
$$

Cada interface satisfaz exatamente a conservação, e as regiões estão ordenadas; a função $V(x/t)$ é uma solução fraca com os dados iniciais prescritos. Nos pontos das interfaces, adotar o traço direito é uma convenção compatível com o avaliador do app. Não foi demonstrada unicidade global ou certificação entrópica para uma classe geral de pares convexos.

## Exemplo — Dois pontos na variedade, não uma órbita única

As conexões correspondem a $P_1=(U_L,U_M,1/2)$ e $P_2=(U_M,U_R,1)$. A compatibilidade é $\pi_+(P_1)=\pi_-(P_2)=U_M$. O segundo ponto tem as coordenadas regulares $(\tau,Y,z)=(-1/8,-1,2)$ calculadas no capítulo 11.

O primeiro possui salto $(0,-1)$, direção $z=0$, estado médio $(2,1/2)$ e velocidade $1/2$. Nesse caso, $P=Q=R=0$, e a fórmula por base ortogonal e tangente da carta do app não o parametriza. liftHugoniotSample retorna degenerate-fiber. Isso não invalida a conexão conservativa nem demonstra uma singularidade intrínseca da variedade.

De fato, para o mapa bruto $H=(DF(\bar U)-sI)\Delta U$, as colunas do diferencial nas direções $\Delta u$ e $\bar v$, avaliadas em $P_1$, são

$$
\partial_{\Delta u}H=(3/2,3/4)^T,\qquad
\partial_{\bar v}H=(0,-1)^T.
$$

Seu determinante é $-3/2\ne0$. Portanto, a relação de salto tem posto dois nesse ponto e é localmente tridimensional. A falha encontrada é da parametrização utilizada; representar essa região requer outra escolha de coordenadas, não eliminar uma solução válida.

Na figura, os pontos são mostrados na projeção intrínseca $(u_+,v_+,s)$, sem afirmar que essa projeção seja uma carta global. O primeiro não é apresentado com uma coordenada $\tau$ fabricada. O tracejado no plano dos estados indica a sequência de saltos, não uma curva integral ou uma trajetória física contínua.

![Cadeia de dois choques: estados intermediários, dois pontos projetados da variedade e interfaces de velocidades 1/2 e 1. A primeira conexão requer outra parametrização local.](/docs/two-shock-reference.svg)

## Reprodução e procedência desta cadeia

Os fixtures e comandos estão em docs/examples/README.md. O gerador wave-patterns-reference.mjs chama twoShockSelfSimilarCandidate, assessTwoShockFamilyChain e liftHugoniotSample. O teste verifica conservação, velocidades, famílias e valores do perfil; registra explicitamente o sucesso do levantamento do segundo choque e a limitação da parametrização do primeiro. Não se usa um teste que passe apenas por omitir o ponto não representável.

Como referência conceitual para construir cadeias pela seleção de conexões, ver [Riemann Problems and Jupyter Solutions, All-shock Riemann solutions](https://www.clawpack.org/riemann_book/html/Shallow_water.html#All-shock-Riemann-solutions). O exemplo aqui foi deduzido para o fluxo triangular do projeto; não transfere as fórmulas nem hipóteses específicas de águas rasas. Sua função é mostrar tanto uma cadeia exata quanto uma fronteira de cobertura do algoritmo atual.
