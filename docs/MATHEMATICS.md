# General Wave Manifold Lab — matemática v0.4.0

## Fluxo
\[
f=a_{20}u^2+a_{11}uv+a_{02}v^2+a_{10}u+a_{01}v,
\qquad
g=b_{20}u^2+b_{11}uv+b_{02}v^2+b_{10}u+b_{01}v.
\]

## Carta direcional
A coordenada global experimental `theta` foi removida. Trabalhamos na carta
\[
r=(z,1),\qquad Z=1/z,
\]
e usamos apenas para visualização
\[
\hat z=\frac2\pi\arctan z.
\]

## Variedade característica
Para fluxos quadráticos, Rankine–Hugoniot dá
\[
[DF(\bar U)-sI](U_+-U_-)=0.
\]
Com
\[
U_+-U_-=Y(z,1),
\]
a eliminação de `s` produz
\[
P(z)\bar u+Q(z)\bar v+R(z)=0,
\]
com
\[
P=2b_{20}z^2+(b_{11}-2a_{20})z-a_{11},
\]
\[
Q=b_{11}z^2+(2b_{02}-a_{11})z-2a_{02},
\]
\[
R=b_{10}z^2+(b_{01}-a_{10})z-a_{01}.
\]

Se `D=P^2+Q^2>0`, adotamos a seção geral
\[
U^0=-\frac{R}{D}(P,Q)
\]
e o vetor tangente não normalizado
\[
T=(-Q,P).
\]
Logo
\[
\bar U=U^0+\tau T.
\]

Os estados são
\[
U_\pm=\bar U\pm\frac{Y}{2}(z,1).
\]

A velocidade é calculada por
\[
s=\frac{r^TDF(\bar U)r}{r^Tr},\qquad r=(z,1).
\]

## Superfície característica e coincidência
A superfície característica é `\mathcal C = {Y=0}`. Nela, `U_-=U_+=\bar U`.

O locus de coincidência é `\mathcal E\subset\mathcal C` e satisfaz adicionalmente
\[
\Delta(\bar U)=0,
\qquad
\Delta=(A-D)^2+4BC,
\]
para `DF=[[A,B],[C,D]]`.

## Sônicas
As folhas não triviais são
\[
\mathcal S^-:\det(DF(U_-)-sI)=0,
\qquad
\mathcal S^+:\det(DF(U_+)-sI)=0.
\]
Escrevendo `M_r=D(DF)[r]` e `A=DF(\bar U)-sI`, temos
\[
DF(U_\pm)-sI=A\pm\frac{Y}{2}M_r.
\]
Como `det A=0` sobre a característica,
\[
\det(A+tM_r)=tK+t^2\det M_r,
\]
onde
\[
K=A_{11}(M_r)_{22}+(M_r)_{11}A_{22}-A_{12}(M_r)_{21}-(M_r)_{12}A_{21}.
\]
Retirando o fator trivial `Y=0`, as equações implícitas são
\[
\Psi_-=Y\det M_r-2K=0,
\qquad
\Psi_+=Y\det M_r+2K=0.
\]

## Preset do app original
Para
\[
f=\frac{B_1+1}{2}u^2+\frac12v^2+au,
\qquad
g=uv+cu-\frac{B_2}{2}v^2+av,
\]
a equação característica reduz-se a
\[
B_1z\bar u+(1+B_2z-z^2)\bar v-cz^2=0,
\]
que é a carta usada no `wave-manifold-app`.

A seção `U^0` escolhida no app geral é canônica (pé ortogonal). No app particular antigo a origem de `t` era uma seção especial ligada à coincidência. Portanto `tau` e o antigo `t` podem diferir por uma translação dependente de `z`, embora os estados físicos e as sônicas sejam os mesmos.


## Ramos lento e rápido da característica

Em cada ponto regular de `\mathcal C`, a direção `r=(z,1)` seleciona a velocidade característica `s`. A segunda velocidade é

\[\lambda_{\mathrm{other}}=\operatorname{tr}DF(\bar U)-s.\]

Fora de `\mathcal E`, adotamos

\[\mathcal C_s:\ s<\lambda_{\mathrm{other}},\qquad \mathcal C_f:\ s>\lambda_{\mathrm{other}}.\]

Em `\mathcal E` as duas velocidades coincidem, portanto a distinção lento/rápido desaparece. Essa classificação é espectral e não depende do sinal de `z`.

## Campo de rarefação em Y=0

Na superfície característica, escreva

\[\bar U(\tau,z)=U^0(z)+\tau T(z),\qquad T=(-Q,P).\]

As curvas de rarefação no plano de estados são tangentes ao autovetor característico \(r=(z,1)\). Com \(U_\tau=T\) e \(U_z=\partial_z\bar U\), um levantamento dessingularizado é

\[\boxed{\dot\tau=\det(r,U_z),\qquad \dot z=\det(T,r)=-(Q+zP).}\]

De fato, pela identidade bidimensional,

\[D\bar U(\dot\tau,\dot z)=\det(T,U_z)r.\]

Logo, onde \(\det(T,U_z)\neq0\), as curvas integrais projetam exatamente nas curvas de rarefação, salvo reparametrização. Para a compactificação

\[\hat z=\frac{2}{\pi}\arctan z,\]

temos

\[\boxed{\dot{\hat z}=\frac{2}{\pi(1+z^2)}\dot z.}\]
\n\n## Singularidades finitas do campo de rarefação\n\nNa carta finita \((\\tau,z)\), as singularidades satisfazem\n\n\\[\\dot\\tau=0,\\qquad \\dot z=0.\\]\n\nComo\n\n\\[\\dot z=-(Q+zP)\\]\n\nnão depende de \\(\\tau\\), o algoritmo localiza primeiro as raízes reais de \\(Q+zP=0\\) e, em cada direção regular, resolve a equação afim \\(\\dot\\tau=0\\).\n\nA classificação é feita no sistema visual \\(\\tau,\\hat z\\) pelo Jacobiano\n\n\\[J_{\\mathcal R}=D(\\dot\\tau,\\dot{\\hat z}).\\]\n\nSe \\(\\det J_{\\mathcal R}<0\\), o ponto é uma sela. As separatrizes finitas são iniciadas nas direções próprias de \\(J_{\\mathcal R}\\) e integradas pelo campo de rarefação.\n\nA fronteira \\(\\hat z=\\pm1\\) **não** é classificada por simples avaliação numérica de \\(z\\to\\infty\\). A análise de singularidades no infinito deve ser feita na carta complementar \\(Z=1/z\\), com a dessingularização correspondente ao campo nessa carta.\n
## Carta complementar Z e o infinito da rarefação

Para estudar `z=∞` não avaliamos numericamente a carta `z`. Usamos `Z=1/z` e a direção `r_Z=(1,Z)`. Definimos

`P_Z(Z)=Z²P(1/Z)`, `Q_Z(Z)=Z²Q(1/Z)`, `R_Z(Z)=Z²R(1/Z)`.

A coordenada de fibra regular no infinito é

`η = τ/Z² = τ z²`, 

pois `(-Q(z),P(z)) = Z^{-2}(-Q_Z(Z),P_Z(Z))`. Assim

`Ubar = U0_Z(Z) + η(-Q_Z,P_Z)`

permanece regular em `Z=0` sempre que `P_Z²+Q_Z² != 0`.

O campo de rarefação nesta carta é

`ηdot = det((1,Z), ∂_Z Ubar)`,

`Zdot = det(∂_η Ubar,(1,Z)) = -(P_Z+Z Q_Z)`.

Logo `Z=0` é uma direção singular do campo projetivo somente quando `P_Z(0)=2 b20=0`. Quando a singularidade é isolada, o app resolve também `ηdot=0` e classifica o Jacobiano em `(η,Z)`. Esta classificação é feita na carta regular e não pela aparência da borda compactificada `zhat=±1`.
\n\n## Separatrizes da sela no infinito\nQuando a singularidade em `Z=0` é uma sela, os autovetores do Jacobiano do campo `(etaDot,ZDot)` definem quatro ramos locais. Cada ramo é iniciado em `(eta_inf,0)+/- eps v_i` e integrado na carta Z, nunca diretamente em `z=+/-infinito`. Para exibição usa-se\n\n`tau = eta Z^2`, `z=1/Z`, `zc=(2/pi) atan(z)`.\n\nAssim, ramos com `Z>0` chegam ao bordo `zc=+1` e ramos com `Z<0` ao bordo `zc=-1`. Esses dois bordos são cópias do mesmo ponto projetivo criado pelo corte da compactificação. A separação visual não cria singularidades adicionais.\n

## Carta ativa e separatrizes no infinito
Para `|zc| >= 0.90`, a interface identifica `Z=1/z` como a carta ativa de inspeção. As separatrizes da sela em `Z=0` são integradas exclusivamente no campo regular `(eta,Z)`, com `eta=tau/Z^2`, e transportadas para `(tau,zc)` apenas para renderização. Os quatro semirramos `W^s_±, W^u_±` são mantidos separados; setas mostram a orientação. Os dois bordos `zc=±1` representam o mesmo ponto projetivo.


## Organização do retrato de fase (v0.5.5)

A visualização separa as curvas integrais genéricas de $\mathcal R$ das variedades invariantes das selas. Para cada sela finita, os ramos associados a autovalores negativos são mostrados como $W^s_{\rm fin}$ e os associados a autovalores positivos como $W^u_{\rm fin}$. Na carta complementar $(\eta,Z)$, a mesma convenção define $W^s_\infty$ e $W^u_\infty$.

As singularidades são selecionáveis. Ao selecionar uma sela finita, a interface destaca somente seus quatro semirramos e mostra a carta, o Jacobiano, autovalores e autovetores. A sela projetiva no infinito pode ser selecionada por qualquer uma de suas duas representações nos bordos $\hat z=\pm1$; ambas correspondem ao mesmo ponto em $Z=0$.


## Conexões heteroclínicas
Se um ramo instável de uma sela $p$ alcança outra sela $q$ e coincide com seu ramo estável, a órbita é única: $\gamma\subset W^u(p)\cap W^s(q)$. O renderer detecta a chegada a outra sela, fecha a curva exatamente no ponto singular e suprime a cópia obtida pela integração estável inversa.

## Papéis dos estados e saturações (dev.24.15)

Os símbolos de estado têm papéis distintos e não devem ser identificados globalmente.

- `U*` é um estado genérico de exploração em `U`; ele não é intrinsecamente esquerdo nem direito. Portanto possui as duas fibras `pi_-^{-1}(U*)` (forward) e `pi_+^{-1}(U*)` (backward).
- `(U_L,U_R)` são os dados globais do problema de Riemann. A orientação inicial seleciona `pi_-^{-1}(U_L)` para ondas que saem de `U_L` e `pi_+^{-1}(U_R)` para ondas que chegam a `U_R`.
- `(U_-(P),U_+(P))=(pi_-(P),pi_+(P))` são estados locais móveis associados a cada ponto `P in W`. Eles podem tornar-se estados intermediários numa sequência de ondas.

Para uma curva `Gamma subset W`, definimos as sementes das saturações por

`Sat_forw(Gamma) = union_{P in Gamma} pi_-^{-1}(U_-(P))`,

`Sat_back(Gamma) = union_{P in Gamma} pi_+^{-1}(U_+(P))`.

O núcleo desta versão formaliza a curva de estados fixos que indexa cada união. A discretização/meshing da superfície saturada não é feita no renderer e será implementada separadamente.
