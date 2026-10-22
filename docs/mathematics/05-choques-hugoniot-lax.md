# Choques, Hugoniot e condições de Lax

Um choque conecta dois estados constantes por uma descontinuidade que se propaga com velocidade definida. Para construir uma solução de Riemann, precisamos determinar quais conexões satisfazem a conservação, como elas se organizam na variedade e quais critérios adicionais permitem selecioná-las.

## Definição — Par de choque

Uma tripla $(U_-,U_+,s)$, com $U_-\ne U_+$, satisfaz Rankine–Hugoniot quando

$$
F(U_+)-F(U_-)=s(U_+-U_-).
$$

Os símbolos $U_-$ e $U_+$ são os estados locais à esquerda e à direita desse salto. Eles coincidem com os dados globais $U_L,U_R$ somente quando o problema é realizado por esse salto direto. Em uma cadeia com estados intermediários, cada choque possui seu próprio par de estados.

Quando $U_-=U_+$, a equação de salto é trivial e não determina $s$. Esse caso não é um choque não trivial; sua representação característica na variedade exige guardar a direção própria e a velocidade correspondente.

## Proposição — Velocidade e resíduo de um salto direto

Escreva $d=U_+-U_-\ne0$ e $b=F(U_+)-F(U_-)$. A velocidade que minimiza o resíduo euclidiano $\|b-sd\|^2$ é

$$
s_* = \frac{d\cdot b}{d\cdot d},\qquad R=b-s_*d.
$$

Existe uma velocidade que satisfaz exatamente Rankine–Hugoniot se, e somente se, $R=0$. Nesse caso ela é única e igual a $s_*$.

**Demonstração.** A derivada de $\|b-sd\|^2$ em relação a $s$ é $-2d\cdot(b-sd)$. Seu único zero é $s_*$, e a segunda derivada é $2\|d\|^2>0$. Uma solução exata deve ser esse minimizador e ter resíduo nulo. Reciprocamente, $R=0$ é a própria equação de salto. $\square$

O módulo src/math/solution/directShockDiagnostic.js usa essa projeção e avalia um resíduo relativo com tolerância. Um resíduo pequeno identifica compatibilidade numérica com a conservação; não decide entropia, existência de outras conexões nem completude da solução de Riemann. Saltos abaixo do limiar numérico são tratados separadamente como estados coincidentes.

## Definição — Fibras orientadas de Hugoniot

Para um estado fixado $U_*$, as fibras na variedade são

$$
\mathcal H^{\mathrm{forw}}(U_*)=\pi_-^{-1}(U_*),\qquad
\mathcal H^{\mathrm{back}}(U_*)=\pi_+^{-1}(U_*).
$$

Na fibra direta, $U_-=U_*$ permanece fixo, e a projeção $\pi_+$ fornece os estados variáveis conectados a ele. Na fibra reversa, $U_+=U_*$ permanece fixo, e a projeção $\pi_-$ fornece os estados variáveis. Essas orientações não são, por si só, condições de admissibilidade.

No espaço de estados vemos a projeção variável da fibra. Na variedade acompanhamos também a velocidade, a direção do salto e os ramos das cartas. No espaço físico, um ponto não trivial que satisfaz a condição de salto fornece a interface $x=st$, com $U_-$ à esquerda e $U_+$ à direita, para $t>0$.

As convenções de cartas, fibras e projeções são detalhadas na referência canônica 11-hugoniot.tex. A visualização dos estados projeta os segmentos calculados na variedade, preservando sua identificação; ela não define uma nova relação de Hugoniot independente.

## Definição — Choque estrito de Lax

Suponha os dois estados estritamente hiperbólicos, com $\lambda_1(U_\pm)<\lambda_2(U_\pm)$, e uma tripla não trivial que satisfaça Rankine–Hugoniot. Um choque de Lax da família 1 satisfaz

$$
\lambda_1(U_+)<s<\lambda_1(U_-),\qquad s<\lambda_2(U_+).
$$

Um choque de Lax da família 2 satisfaz

$$
\lambda_2(U_+)<s<\lambda_2(U_-),\qquad \lambda_1(U_-)<s.
$$

As desigualdades que faltam para as outras velocidades seguem da ordenação estrita dos autovalores. Todas as desigualdades indicadas são estritas: uma igualdade $s=\lambda_i(U_\pm)$ exige análise característica ou sônica separada.

## Proposição — Assinatura espectral de Lax

Sob as hipóteses anteriores e excluindo qualquer igualdade entre $s$ e as velocidades características dos extremos, defina

$$
n_\pm=\#\{i\in\{1,2\}:\lambda_i(U_\pm)<s\}.
$$

As condições de Lax equivalem a $(n_-,n_+)=(0,1)$ para a família 1 e a $(n_-,n_+)=(1,2)$ para a família 2.

**Demonstração.** A contagem zero coloca $s$ abaixo das duas velocidades, a contagem um o coloca estritamente entre elas e a contagem dois o coloca acima de ambas. Aplicando essas três possibilidades aos extremos, obtêm-se exatamente as desigualdades das duas famílias. A exclusão das igualdades é necessária: a contagem de valores estritamente menores não distingue todas as posições na fronteira. $\square$

## Limites dos diagnósticos implementados

Os módulos src/math/state/hugoniotSpectrum.js e hugoniotSpectralRegions.js calculam espectros, posições relativas e assinaturas para classificar os segmentos. As posições próximas das igualdades são identificadas numericamente com tolerância. A rotina laxClass2x2 agora exige os espectros completos e rejeita fronteiras sônicas e gaps de hiperbolicidade abaixo do limiar antes de classificar os interiores. O módulo shockConfiguration.js distingue os nove tipos espectrais, sem presumir conservação ou admissibilidade. Esses diagnósticos numéricos não certificam uma desigualdade contínua ou um resultado global.

Lax é um critério específico para choques hiperbólicos. Um rótulo não-Lax significa apenas que esse critério estrito não foi satisfeito; ele não resolve automaticamente outros modelos de admissibilidade. Uma classificação Lax também não substitui uma desigualdade entrópica global, a análise de Liu ao longo do ramo orientado ou a existência de perfil para uma viscosidade especificada.

A conservação seleciona a relação de salto; a orientação identifica os extremos; o critério de admissibilidade faz uma seleção adicional. Esses três passos devem permanecer explícitos ao passar entre estados, variedade e realização física.
