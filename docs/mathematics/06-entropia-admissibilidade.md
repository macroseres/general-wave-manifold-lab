# Entropia e admissibilidade

A formulação fraca admite descontinuidades que satisfazem Rankine–Hugoniot, mas a conservação sozinha não seleciona necessariamente a solução de Riemann. Uma seleção entrópica exige condições adicionais, com hipóteses próprias e um domínio de aplicação declarado.

## Definição — Par entropia–fluxo de entropia

Sejam $F$ de classe $C^2$ em um domínio aberto $\Omega$, e funções escalares $\eta,q$ de classe $C^2$ nesse domínio. O par $(\eta,q)$ é compatível com o sistema quando

$$
Dq(U)=D\eta(U)\,DF(U).
$$

Aqui, $D\eta$ e $Dq$ são vetores linha. Quando se exige uma entropia convexa, a convexidade de $\eta$ deve ser verificada no domínio considerado; não é uma propriedade presumida para todos os parâmetros do fluxo quadrático.

## Proposição — Identidade entrópica para soluções suaves

Uma solução clássica $U$ da lei de conservação que permaneça nesse domínio satisfaz

$$
\partial_t\eta(U)+\partial_xq(U)=0.
$$

**Demonstração.** Pela regra da cadeia e pela compatibilidade, $\partial_t\eta(U)+\partial_xq(U)=D\eta(U)U_t+Dq(U)U_x=D\eta(U)(U_t+DF(U)U_x)=0$. $\square$

## Definição — Desigualdade entrópica

Para um par convexo especificado, a condição adicional adotada é

$$
\partial_t\eta(U)+\partial_xq(U)\leq0
$$

no sentido das distribuições. No interior $t>0$, isso significa que, para toda função teste não negativa $\varphi\in C_c^1(\mathbb R\times(0,\infty))$,

$$
\int_0^\infty\!\int_{\mathbb R}\bigl(\eta(U)\varphi_t+q(U)\varphi_x\bigr)\,dx\,dt\geq0.
$$

A condição inicial é imposta adicionalmente no sentido apropriado. Se a formulação de admissibilidade exigir uma classe de pares de entropia, a desigualdade deve valer para os pares dessa classe, e não somente para um exemplo escolhido. Este capítulo não afirma que um único par assegure existência, unicidade ou seleção global para sistemas gerais.

## Lema — Entropia através de um choque

Considere os estados constantes $U_-$ e $U_+$ separados por $x=st$, satisfazendo Rankine–Hugoniot. Para o par especificado, a desigualdade entrópica no interior $t>0$ equivale a

$$
[q]-s[\eta]\leq0,\qquad
[q]=q(U_+)-q(U_-),\quad [\eta]=\eta(U_+)-\eta(U_-).
$$

**Demonstração.** Escrevendo a função por meio do degrau $H(x-st)$, a distribuição $\partial_t\eta(U)+\partial_xq(U)$ é $([q]-s[\eta])\delta(x-st)$. Como a medida delta é não negativa, a distribuição tem sinal não positivo se, e somente se, seu coeficiente é não positivo. $\square$

O sinal usa a convenção fixada de estados esquerdo e direito e a desigualdade $\eta_t+q_x\leq0$. Alterar a orientação dos estados exige reavaliar o salto e o critério; a simetria algébrica de Rankine–Hugoniot não preserva automaticamente a seleção entrópica.

## Relação com os três espaços

No espaço de estados, o teste usa os valores de $\eta$ e $q$ nos extremos da conexão. Na variedade, esses extremos são recuperados por $\pi_-$ e $\pi_+$, e a velocidade pertence aos dados da onda. No espaço físico, a desigualdade determina o sinal da produção de entropia concentrada na interface. São expressões da mesma condição para o mesmo choque.

Para cadeias com vários segmentos, é preciso verificar as hipóteses de cada construção, compatibilidade dos estados intermediários, ordenação das velocidades e o critério de admissibilidade escolhido. Passar em um teste de um salto isolado não demonstra a validade de toda a cadeia.

## Convenção — Teoria clássica e teoria não clássica

Na terminologia deste projeto, a construção tradicional em leis de conservação inclui ambas as teorias de LeFloch, clássica e não clássica. A construção topológica é sua representação na Variedade de Ondas por levantamentos, fibras, extensões, saturações e interseções, com correspondência a demonstrar. Portanto, tradicional/topológica distingue construções, enquanto clássica/não clássica distingue teorias de admissibilidade; a representação topológica deve preservar o critério selecionado.

O termo solução clássica usado na identidade para funções suaves descreve regularidade. Já teoria clássica de choques descreve uma seleção de soluções fracas, que pode conter descontinuidades. Não se devem confundir esses usos.

O projeto deve declarar o modelo de admissibilidade antes de selecionar as conexões. Na teoria clássica, critérios como Lax ou Liu são empregados nos domínios em que suas hipóteses e resultados de seleção se aplicam; não se presume equivalência global entre esses critérios e toda desigualdade entrópica. Na teoria não clássica de choques subcompressivos discutida por LeFloch, a seleção requer informação adicional, tipicamente uma relação cinética associada à regularização adotada.

Uma relação cinética pode ser registrada como uma restrição constitutiva $\mathscr K(U_-,U_+,s)=0$ sobre conexões de Rankine–Hugoniot, com domínio e orientação especificados. Essa escrita é apenas um formato geral de restrição, não uma fórmula cinética deduzida para o fluxo de dez parâmetros. A existência de perfis para uma regularização e os resultados de seleção precisam ser demonstrados para o modelo escolhido.

Não satisfazer Lax não basta para classificar um salto como não clássico admissível. Tampouco uma extensão topológica, uma singularidade de carta ou uma junção sônica determina essa classificação.

## Definição — Restrição de admissibilidade na variedade

Fixado um modelo de seleção $\mathfrak A$, o conjunto de choques admissíveis representados é

$$
\mathcal W_{\mathfrak A}=\{P\in\mathcal W:\pi_-(P)\ne\pi_+(P),\ (\pi_-(P),\pi_+(P),s(P))\text{ satisfaz }\mathfrak A\}.
$$

Essa é a imposição do mesmo critério sobre os estados e a velocidade recuperados, e não um novo critério produzido pela geometria. O transporte da condição é imediato pela definição; existência de conexões, unicidade, cobertura das cartas e admissibilidade de uma cadeia não decorrem dessa identidade. Nos pontos de salto nulo, a seleção de rarefações e junções deve ser definida separadamente.

## Fonte e escopo — LeFloch

O livro [LeFloch, 2002](https://link.springer.com/book/10.1007/978-3-0348-8150-0) é a referência de trabalho para organizar as teorias clássica e não clássica; nesta etapa foi conferido seu sumário, sem atribuir teoremas ou fórmulas não consultados. A [revisão de 2010, resumo](https://arxiv.org/abs/1002.2950v1) fundamenta a distinção conceitual sobre relações cinéticas para choques subcompressivos. A revisão detalhada de definições e teoremas permanece necessária antes de reivindicar um solver não clássico para este fluxo.

## Estado da implementação — Seleção ainda não certificada

O aplicativo não fornece uma certificação entrópica geral baseada em pares convexos para todos os fluxos quadráticos. O diagnóstico de salto direto testa conservação numericamente. A classificação Lax compara velocidades nos extremos. Os diagnósticos de Liu avaliam ordenação de velocidades em arcos orientados de Hugoniot, com amostragem e refinamento; não são uma avaliação do fluxo de entropia $q$.

Em src/math/solution/liuArcAssessment.js, a avaliação direta distingue violação detectada, resultado inconclusivo e ausência de violação detectada. Mesmo no último caso, passes permanece false: testes finitos não certificam a desigualdade contínua em todo o arco. Os módulos de cadeias mistas e evidência composta também mantêm entropyCertified como false.

Assim, uma cadeia candidata que passa em testes numéricos não é automaticamente uma solução entrópica. Uma futura certificação precisa declarar o modelo de admissibilidade, o domínio e os resultados matemáticos que justificam a passagem da evidência numérica à conclusão.

## Exemplo — Um par convexo que não seleciona sozinho todo o sistema

Para o fluxo triangular $F=(u^2/2,v^2/2+3u/4)$ dos estudos de caso, $\eta=u^2/2$ e $q=u^3/3$ satisfazem $Dq=(u^2,0)=D\eta DF$. A Hessiana de $\eta$ é $\operatorname{diag}(1,0)$: o par é convexo, mas não estritamente convexo nas duas variáveis.

No choque $(2,0)\to(0,-1)$ de velocidade um, a produção é $[q]-s[\eta]=-8/3+2=-2/3$. Já no choque de u constante, essa produção é zero independentemente do salto em v. Portanto, passar nessa desigualdade não decide todas as conexões da segunda componente. A compatibilidade e esses valores podem ser conferidos diretamente; o aplicativo não passa a ter um certificador geral de entropia por documentar esse par.
