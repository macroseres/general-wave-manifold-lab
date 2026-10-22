# Transformações afins: resultados de invariância

## Definição — Mudança afim dos estados

Considere $U=AV+U_0$, com $A\in GL(2,\mathbb R)$, e defina $F^{A}(V)=A^{-1}F(AV+U_0)$.

## Teorema — Invariância da classificação espectral

O jacobiano do fluxo transformado é semelhante ao jacobiano original no estado correspondente. Consequentemente, traço, determinante, autovalores e sinal do discriminante espectral são preservados.

$$
DF^{A}(V)=A^{-1}DF(AV+U_0)A,\qquad\Delta^{A}(V)=\Delta(AV+U_0).
$$

**Demonstração.** A regra da cadeia fornece a primeira identidade. Matrizes semelhantes têm o mesmo polinômio característico; logo, os respectivos discriminantes coincidem. $\square$

## Corolário — Correspondência das regiões

A transformação afim leva bijetivamente as regiões hiperbólicas, parabólicas e elípticas do fluxo transformado às regiões correspondentes do fluxo original.

## Proposição — Covariância de Rankine–Hugoniot

Se $U_\pm=AV_\pm+U_0$ e $A$ é invertível, a condição de salto do fluxo original é equivalente à condição de salto do fluxo transformado, com a mesma velocidade.

$$
F(U_+)-F(U_-)=s(U_+-U_-)\iff F^{A}(V_+)-F^{A}(V_-)=s(V_+-V_-).
$$

**Demonstração.** Multiplicando a identidade de Rankine–Hugoniot por $A^{-1}$ e substituindo $U_+-U_-=A(V_+-V_-)$, obtemos a identidade transformada. A implicação inversa segue multiplicando por A. Uma constante aditiva em $F^{A}$ desaparece na diferença dos fluxos. $\square$

## Corolário — Correspondência das fibras e das sônicas

A aplicação entre pares de estados induz uma correspondência bijetiva entre os conjuntos de Rankine–Hugoniot, preservando a velocidade de choque. Nas regiões regulares, leva fibras de Hugoniot a fibras correspondentes. Como os autovalores também são preservados, as condições $s=\lambda_i(U_-)$ e $s=\lambda_i(U_+)$ são invariantes.

## Proposição — Covariância das curvas de rarefação

Se $r_i(U)$ é uma direção própria de $DF(U)$, então $A^{-1}r_i(AV+U_0)$ é uma direção própria do jacobiano transformado. As curvas integrais correspondem após uma reparametrização, quando necessária.

**Demonstração.** A identidade de similaridade implica $DF^{A}(V)A^{-1}r_i(U)=\lambda_i(U)A^{-1}r_i(U)$. Se $U(\alpha)$ é uma curva integral, $V(\alpha)=A^{-1}(U(\alpha)-U_0)$ satisfaz a EDO do campo transformado com essa escolha de normalização. $\square$

**Consequência geométrica** O sobrescrito A identifica uma transformação afim de estados, e não a carta recíproca; reservamos o chapéu exclusivamente para os objetos dessa carta. A transformação preserva as relações intrínsecas entre rarefações, fibras e sônicas, inclusive a construção de ondas compostas por saturação e interseção, desde que os conjuntos sejam transportados integralmente. As coordenadas de uma carta particular e a malha numérica não precisam permanecer iguais.

Variar livremente coeficientes não é o mesmo que aplicar uma transformação afim; a área Parâmetros deve distinguir essas duas operações.

## Proposição — Transporte do problema de Riemann

Se $U=AV+U_0$, os dados iniciais transformados são $V_L=A^{-1}(U_L-U_0)$ e $V_R=A^{-1}(U_R-U_0)$. Mantendo as coordenadas físicas $(x,t)$, a função $V(x,t)=A^{-1}(U(x,t)-U_0)$ satisfaz a lei transformada se, e somente se, $U$ satisfaz a original, tanto classicamente quanto na formulação fraca correspondente.

**Demonstração.** Como $A$ e $U_0$ são constantes, $U_t=AV_t$ e $F(U)_x=A(F^A(V))_x$. Multiplicando a equação por $A^{-1}$, obtemos a lei transformada. A mesma transformação linear nas identidades integrais leva os dados iniciais aos valores indicados. $\square$

Na variedade prolongada, a direção própria transforma-se por $[r]\mapsto[A^{-1}r]$, junto aos estados e à velocidade preservada. Pode ser necessário trocar de carta: uma direção finita antes da transformação pode passar a exigir coordenadas recíprocas. A correspondência intrínseca não significa igualdade das coordenadas $(\tau,Y,z)$ nem da malha desenhada.

## Proposição — Transporte de um par de entropia

Se $(\eta,q)$ é um par de entropia do fluxo original, defina $\eta^A(V)=\eta(AV+U_0)$ e $q^A(V)=q(AV+U_0)$. Então $Dq^A=D\eta^A DF^A$. A convexidade é preservada, pois $D^2\eta^A=A^T(D^2\eta)A$ no estado correspondente.

**Demonstração.** A regra da cadeia fornece $Dq^A=Dq\,A=D\eta\,DF\,A$, enquanto $D\eta^A DF^A=D\eta\,A A^{-1}DF\,A$. As expressões coincidem. A fórmula da Hessiana preserva sua semidefinição positiva sob uma matriz invertível. $\square$

Esse resultado transporta um par previamente conhecido; não constrói automaticamente uma entropia convexa para um fluxo arbitrário.

## Relação com a implementação

O módulo src/math/flux/affineClassification.js implementa transformQuadraticFlux. Ele recupera os dez coeficientes do fluxo transformado por avaliações do polinômio quadrático e retorna separadamente o termo constante. Subtrair esse termo constante não altera a derivada espacial, o jacobiano nem as diferenças de Rankine–Hugoniot.

O código rejeita determinantes não finitos ou de módulo inferior a um limiar absoluto. Uma matriz matematicamente invertível, mas muito próxima desse limiar ou mal condicionada, exige cuidado numérico: a invariância exata não garante a mesma precisão após o transporte. A implementação também não classifica todas as órbitas de fluxos sob o grupo de transformações afins.

## Exemplo — Um transporte reproduzível

Para o fluxo triangular dos exemplos, use $A=\begin{pmatrix}1&1\\0&1\end{pmatrix}$ e $U_0=(1,-1)$. Assim, $U=(V_1+V_2+1,V_2-1)$, e $\det A=1$. O fixture avançado registra esses dados. O teste confere em estados distintos tanto a igualdade do discriminante quanto a reconstrução do fluxo transformado incluindo o termo constante devolvido pelo código.

Esse ensaio é uma verificação amostrada da implementação; a justificativa para todos os estados é a identidade algébrica de similaridade demonstrada acima. Transportar os dados iniciais e a direção própria continua sendo necessário para comparar soluções físicas, mesmo quando os coeficientes e a cônica foram transportados corretamente.
