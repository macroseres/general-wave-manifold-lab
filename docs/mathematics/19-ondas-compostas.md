# Ondas compostas: EDO tradicional e construção topológica

## Convenção — Representação intrínseca e representação por cartas

A EDO tradicional é escrita para os estados $U(t),V(t)$ e a velocidade $s(t)$. A construção topológica por saturação e interseção é intrínseca às projeções da Variedade de Ondas; a representação em $(\tau,Y,z)$ ou na carta recíproca é apenas uma escolha computacional. Em regiões regulares, mudanças de carta preservam os conjuntos geométricos e suas incidências, mas não necessariamente a parametrização temporal da EDO.

O parâmetro t usado nas curvas deste capítulo é auxiliar; não representa automaticamente o tempo físico da lei de conservação.

## Definição — Construção tradicional por uma EDO

Considere uma rarefação $U(t)$ da família i, com $U'=r_i(U)$. Procuramos o outro estado $V(t)$ conectado por Rankine–Hugoniot e cuja velocidade de choque seja a velocidade característica no estado da rarefação:

$$
F(V)-F(U)=s(V-U),\qquad s=\lambda_i(U).
$$

Derivando a relação de salto em t, resulta

$$
(DF(V)-sI)V'=(DF(U)-sI)U'+s'(V-U).
$$

Como $(DF(U)-sI)U'=0$, obtemos a EDO implícita da construção tradicional:

$$
(DF(V)-\lambda_i(U)I)V'=(\nabla\lambda_i(U)\cdot r_i(U))(V-U).
$$

Quando a matriz da esquerda é inversível, a equação se torna explícita. Em pontos duplamente sônicos ou degenerados, não se pode usar essa inversa sem análise adicional.

**Demonstração.** Diferenciamos $F(V)-F(U)-s(V-U)=0$ e agrupamos os termos com $V'$. A equação característica da rarefação anula o termo $(DF(U)-sI)U'$; pela regra da cadeia, $s'=\nabla\lambda_i(U)\cdot r_i(U)$. $\square$

**Passagem da construção tradicional à topológica.**  A EDO anterior descreve um ramo regular quando é possível parametrizar o estado oposto pela rarefação. A extensão geométrica é construída depois, sem pressupor essa parametrização: satura-se o levantamento da rarefação pelas fibras de Hugoniot e toma-se a interseção com a folha sônica correspondente. A coincidência entre os dois procedimentos é local e depende das hipóteses enunciadas a seguir.

## Definição — Construção topológica por extensão

O termo extensão neste capítulo designa a construção do conjunto geométrico que segue, não uma declaração de admissibilidade não clássica. Pela definição geral de saturação por fibras, $\operatorname{sat}_{\mathrm{forw}}(\mathcal R)=\operatorname{Sat}_{\pi_-}(\mathcal R)$ e $\operatorname{sat}_{\mathrm{back}}(\mathcal R)=\operatorname{Sat}_{\pi_+}(\mathcal R)$. A interseção com a folha sônica reduzida prolongada é uma operação adicional; não se confunde com o fecho de um ramo físico já selecionado.

Em vez de integrar a EDO do estado V, levantamos toda a curva de rarefação $\mathcal R\subset\mathcal C$ às fibras de Hugoniot e intersectamos a superfície saturada com a folha sônica apropriada:

$$
\operatorname{sat}_{\mathrm{forw}}(\mathcal R)=\bigcup_{P\in\mathcal R}\pi_-^{-1}(U_-(P)),
$$

$$
\operatorname{sat}_{\mathrm{back}}(\mathcal R)=\bigcup_{P\in\mathcal R}\pi_+^{-1}(U_+(P)).
$$

$$
\mathcal K_-=\operatorname{sat}_{\mathrm{forw}}(\mathcal R)\cap\mathcal S^-,\qquad\mathcal K_+=\operatorname{sat}_{\mathrm{back}}(\mathcal R)\cap\mathcal S^+.
$$

## Proposição — Correspondência local, com orientação fixada

Considere um arco regular de rarefação $U(t)$ de uma família simples, parametrizado por $U'=r_i(U)$, e um ramo diferenciável da interseção entre a saturada e a folha sônica cujo estado característico seja U. Se a projeção sobre esse arco é localmente invertível, o estado oposto $V(t)$ satisfaz a EDO implícita da construção tradicional. A recíproca exige que a solução da EDO preserve a condição de Rankine–Hugoniot e a igualdade entre a velocidade do choque e a velocidade característica escolhida.

**Demonstração.** Ao longo da interseção, escrevemos $F(V)-F(U)=s(V-U)$ e $s=\lambda_i(U)$. A derivada da primeira identidade fornece $(DF(V)-sI)V'=(DF(U)-sI)U'+s'(V-U)$. Como $DF(U)r_i(U)=\lambda_i(U)r_i(U)$, o primeiro termo do lado direito se anula e $s'=\nabla\lambda_i(U)\cdot r_i(U)$. Obtém-se, portanto, a EDO tradicional. No sentido inverso, defina o resíduo $G(t)=F(V)-F(U)-\lambda_i(U)(V-U)$. A EDO implica $G'(t)=0$; assim, é necessário impor $G(t_0)=0$ em um ponto inicial para garantir Rankine–Hugoniot ao longo de todo o ramo. $\square$

## Proposição — Invariância da construção composta sob mudança de carta

Sejam $h:\mathcal U_f\to\mathcal U_r$ a transição diferenciável entre regiões regulares das cartas finita e recíproca e $\mathcal R\subset\mathcal C$ um arco de rarefação contido nessa região. Denotando por $\pi_\pm^f$ e $\pi_\pm^r$ as expressões das mesmas projeções intrínsecas nas duas cartas, vale $\pi_\pm^r\circ h=\pi_\pm^f$. Assim, para a parte das fibras e das sônicas contida na sobreposição,

$$
h\bigl(\operatorname{sat}_{\mathrm{forw}}^f(\mathcal R)\cap\mathcal S_f^-\bigr)=\operatorname{sat}_{\mathrm{forw}}^r(h(\mathcal R))\cap\mathcal S_r^-
$$

e analogamente para a saturação backward e $\mathcal S^+$. As igualdades são entendidas com todos os conjuntos restringidos às regiões correspondentes da sobreposição.

**Demonstração.** Um ponto $p$ pertence à saturada forward precisamente quando existe $q\in\mathcal R$ com $\pi_-(p)=\pi_-(q)$. Pela identidade de compatibilidade das projeções, essa condição equivale a $\pi_-(h(p))=\pi_-(h(q))$. Como a folha sônica é definida intrinsecamente pela igualdade entre a velocidade de choque e o autovalor do estado apropriado, a transição também preserva sua pertença. A bijetividade de $h$ na sobreposição conclui a prova; o argumento backward é idêntico com $\pi_+$. $\square$

## Observação — Continuação na direção projetiva excepcional

A proposição não afirma que a carta finita descreva pontos com $Z=0$ na carta recíproca. Para continuar uma curva composta até essa direção, deve-se calcular diretamente as projeções, a folha sônica e a interseção na carta recíproca, verificando posto, transversalidade e eventual multiplicidade de ramos. A compactificação de $z$ não substitui essa continuação.

## Critério de auditoria — Validação cruzada das ondas compostas

Para um ramo regular, comparar os estados $U_-,U_+$ e a velocidade $s$ calculados nas duas cartas; verificar o resíduo de Rankine–Hugoniot, a igualdade sônica, a projeção sobre a rarefação e a dimensão local da interseção. A coincidência de curvas desenhadas não comprova admissibilidade: Lax, Liu ou o perfil viscoso exigem verificações adicionais.

## Observação — Fibras, dimensões e transversalidade

Em uma região regular da variedade tridimensional $\mathcal W$, a rarefação levantada é unidimensional. A união das fibras de Hugoniot correspondentes é tipicamente uma superfície bidimensional; sua interseção transversal com uma folha sônica bidimensional é uma curva. Se a interseção não é transversal, pode haver tangência, múltiplos ramos ou singularidade da parametrização. A contagem dimensional não substitui uma prova de regularidade.

## Observação — Orientação das sônicas

O índice $-$ ou $+$ identifica o estado no qual se impõe a igualdade sônica. A fórmula da EDO escrita acima corresponde ao estado U situado no lado sônico. Para a construção retrospectiva, trocam-se consistentemente os papéis de $U_-$ e $U_+$, em vez de aplicar automaticamente a mesma parametrização a ambos os lados.

## Observação — Alcance geométrico

A extensão por saturação e interseção permite localizar ramos sem inverter $DF(V)-sI$ e evidencia componentes múltiplas, tangências e pontos de bifurcação. Ela não garante automaticamente que cada componente seja o gráfico de uma solução clássica regular da EDO.

A rarefação de origem pode pertencer tanto a $\mathcal C_s$ quanto a $\mathcal C_f$. Para selecionar uma onda composta física, ainda é necessário impor a orientação, a ordenação das velocidades e a admissibilidade do choque.

## Estado da construção numérica

O módulo src/math/state/composite.js fixa as convenções: $\mathcal K_-$ usa saturação forward, extremo esquerdo fixado e sônica minus; $\mathcal K_+$ usa saturação backward, extremo direito fixado e sônica plus. O módulo saturation.js fornece as sementes de estados fixados; ele não constrói sozinho a superfície saturada completa.

Em compositeTrace.js, compositeLeafIntersections procura candidatos sônicos ao longo de cada fibra, com amostragem angular, amostragem recíproca e refinamento de mudanças de sinal. Uma raiz tangencial pode escapar da detecção por mudança de sinal; amostras próximas de zero e tolerâncias não dão garantia de isolamento ou completude de todas as raízes.

traceCompositeField escolhe inicialmente o primeiro candidato e depois o de direção projetiva mais próxima do anterior. Essa regra de seleção é numérica e pode escolher apenas um entre vários ramos. O campo complete significa que houve ponto escolhido para cada amostra da rarefação de entrada; não prova cobertura de todas as componentes, continuidade diferenciável ou admissibilidade física.

## Correção do resíduo recíproco na fronteira

Na sobreposição, a equação canônica é $\widehat\Phi_\pm=Z\Phi_\pm$. O antigo resíduo de compositeTrace.js usava $Z^2\Phi_\pm$, ou seja, $Z\widehat\Phi_\pm$, e uma continuação simétrica em zero. Esse fator adicional podia mascarar erros. A implementação agora usa sonic/reciprocalSonic.js para avaliar diretamente o fator canônico, inclusive em $Z=0$ quando a carta é regular.

As bisseções também exigem o resíduo dentro da tolerância e não aceitam uma raiz apenas pela largura pequena do intervalo. Há testes da identidade de transição e da rejeição do falso certificado histórico. Essas correções numéricas não demonstram completude da busca ou admissibilidade física.

## Correspondência com a solução física

A incidência sônica na saturada pode corresponder a qualquer uma das velocidades próprias no estado de origem. Para compará-la com a EDO de uma família específica, é necessário verificar também $s=\lambda_i(U)$ para a família escolhida, além do resíduo de Rankine–Hugoniot e da regularidade da projeção sobre a rarefação.

No espaço de estados, vemos os extremos do ramo composto; na variedade, vemos as fibras e a interseção sônica que os relacionam; no espaço físico, a conexão choque–rarefação ou rarefação–choque precisa ter estados compatíveis e velocidades ordenadas. As definições de $\mathcal K_\pm$ são geométricas: nem toda componente dessas interseções representa uma onda composta física admissível.

A referência canônica 12-composite-waves.tex registra as definições de saturação. Os diagnósticos de seleção e Liu em src/math/solution/compositeEvidence.js e compositeLiuSelection.js fornecem evidências adicionais; não estabelecem certificação entrópica global. Não se deve substituir as convenções de $\mathcal K_\pm$ pela escolha de folha usada em outro diagnóstico de conexão física sem conferir o extremo e a família envolvidos.

## Fonte e escopo do estudo de caso

A construção de compostas por levantamento é discutida em [Eschenazi e colaboradores, versão 2, seção 4.4](https://arxiv.org/html/2312.17377v2#S4.SS4). A aplicação de suas fórmulas específicas requer as hipóteses do modelo dos autores. O estudo abaixo é uma dedução explícita para o fluxo triangular do projeto; trata um caso degenerado e não reivindica originalidade ou classificação global.

## Exemplo — Um ramo duplamente sônico exato

Para $F(u,v)=(u^2/2,v^2/2+3u/4)$, tome a rarefação rápida $U(\alpha)=(\alpha,\alpha-3/4)$ do capítulo 17 e o estado oposto $V(\alpha)=(\alpha,\alpha+3/4)$, com $0\leq\alpha\leq1$. Considere o choque orientado de V para U, de velocidade $s=\alpha$.

O salto é $(0,-3/2)$ e

$$
F(U)-F(V)=(0,-3\alpha/2)=s(U-V).
$$

A velocidade s é própria nos dois extremos: no direito U é a família rápida; no esquerdo V é a lenta. Assim, ambos os determinantes sônicos se anulam, e $DF(V)-sI$ é singular. Apesar disso, a EDO implícita da construção é satisfeita:

$$
(DF(V)-\alpha I)V'
=\begin{pmatrix}0&0\\3/4&3/4\end{pmatrix}\binom11
=\binom0{3/2}
=s'(V-U).
$$

Não se pode obter esse ramo usando a inversa da matriz à esquerda. Como o estado da rarefação é o extremo direito, esta é a orientação backward da saturação, com igualdade sônica no lado plus. O ponto também é sônico no lado minus; a nomenclatura de uma família estrita não deve ser aplicada ignorando essas igualdades.

O salto tem direção $z=0$, na qual $P=Q=R=0$ para este fluxo. A parametrização por base e tangente da carta implementada não representa esse ramo. A figura usa uma projeção dos dados intrínsecos, e não coordenadas locais fabricadas. O exemplo comprova as equações indicadas, mas não satisfaz as hipóteses de regularidade usadas para equivalências locais entre todos os métodos.

## Exemplo — Junção física choque–rarefação

Fixe $\alpha=0$ no choque. Conecte $(0,3/4)$ a $(0,-3/4)$ por uma interface estacionária e, em seguida, use a rarefação rápida até $(1,1/4)$. O perfil é

$$
W(\xi)=\begin{cases}(0,3/4),&\xi<0,\\(\xi,\xi-3/4),&0<\xi<1,\\(1,1/4),&\xi>1.\end{cases}
$$

A velocidade do choque é igual à borda esquerda do leque. O salto em $\xi=0$ satisfaz Rankine–Hugoniot, o leque satisfaz a equação de similaridade e a borda em $\xi=1$ é contínua. Portanto, o perfil limitado fornece uma solução fraca exata com o traço inicial prescrito. A exigência estrita de separação de velocidades de mixedSelfSimilarCandidate não cobre automaticamente esta junção.

## Exemplo — Perfil viscoso de cada choque isolado

Para a viscosidade identidade, o sistema integrado do perfil da conexão V para U admite

$$
u(\zeta)=\alpha,\qquad
v(\zeta)=\alpha-\frac34\tanh\left(\frac38\zeta\right),\qquad
\zeta=\frac{x-\alpha t}{\varepsilon}.
$$

De fato, com $w=v-\alpha$ e $a=3/4$, a equação é $w'=(w^2-a^2)/2$. A expressão acima satisfaz essa igualdade e vai de $w=a$ a $w=-a$. A primeira componente da equação integrada se anula porque u é constante. Isso verifica um perfil viajante para o choque isolado e essa matriz de viscosidade; não demonstra convergência viscosa da cadeia completa, unicidade global ou admissibilidade para outra regularização.

![Conexão sônica degenerada: estados, projeção intrínseca do ramo e junção física choque–rarefação. A primeira parametrização local não cobre este exemplo.](/docs/composite-reference.svg)

Os dados estão em docs/examples/advanced-reference.json; scripts/advanced-reference.mjs avalia conservação e determinantes, e tests/advancedReference.test.js confere também a EDO implícita e a fórmula do perfil viscoso. Nenhum algoritmo de compostas de produção foi corrigido ou certificado por este exemplo.
