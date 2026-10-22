# Rarefação

## Definição — Campo levantado na característica

Em $\mathcal C$, com $U_z=\partial\bar U/\partial z$,

$$
\dot\tau=\det(r,U_z),\qquad \dot z=\det(T,r)=-(Q+zP)
$$

$$
D\bar U(\dot\tau,\dot z)=\det(T,U_z)r.
$$

Uma mesma órbita pode atravessar $\mathcal E$, mudando de $\mathcal C_s$ para $\mathcal C_f$ ou vice-versa sem ser interrompida.

Aqui o ponto representa $Y=0$ e a direção $r=(z,1)^T$ é própria de $DF(\bar U)$. O parâmetro da órbita será denotado por $\sigma$: ele não é, em geral, o tempo físico $t$, a coordenada de similaridade $\xi=x/t$ ou o comprimento de arco no espaço de estados.

## Proposição — Tangência da projeção

O diferencial do mapa de estados é $D\bar U(a,b)=Ta+U_zb$. A identidade de determinantes em dimensão dois fornece

$$
T\det(r,U_z)+U_z\det(T,r)=\det(T,U_z)r.
$$

Consequentemente, a projeção de uma órbita tem tangente na direção própria selecionada. Onde $\det(T,U_z)\ne0$, uma reparametrização local transforma essa projeção em curva integral de $r$. Onde esse fator se anula, a velocidade projetada pode ser zero: não se conclui que a imagem seja uma curva regular nem que a família espectral seja simples.

**Demonstração.** Expandindo as duas componentes do lado esquerdo, os termos cruzados se cancelam e resta $\det(T,U_z)r$. Aplicando a regra da cadeia à órbita, obtém-se a fórmula de projeção. A reparametrização exige que o fator escalar seja não nulo. $\square$

## Órbita, família e leque físico

Se o campo levantado é regular e não nulo no cruzamento com a coincidência, a órbita pode continuar como uma só curva, mesmo que seu rótulo lento/rápido mude. Isso não afirma que todo ponto de coincidência admita tal cruzamento: equilíbrios do campo, pontos escalares e degenerações das cartas exigem tratamento separado.

Uma órbita geométrica não é automaticamente um leque físico. É preciso selecionar o trecho, sua orientação e a monotonicidade da velocidade característica; a construção suave e suas hipóteses estão na seção “Rarefações e famílias características”. Em particular, continuar uma órbita através de $\mathcal E$ não demonstra admissibilidade de um leque que atravesse esse ponto.

## Implementação e critérios de parada

O módulo src/math/rarefaction/field.js calcula rarefactionField e devolve mapDet como $\det(T,U_z)$. O resíduo rarefactionDirectionResidual verifica o paralelismo da velocidade projetada, mas também pode ser zero se essa velocidade for nula; ele não certifica regularidade.

Em src/math/rarefaction/orbits.js, a integração usa o campo normalizado nas coordenadas de desenho $(\tau,z_{\mathrm c})$, com RK4 adaptativo. A normalização positiva preserva as órbitas onde o campo não se anula, mudando seu parâmetro. Limites de janela, número máximo de passos, campo muito pequeno ou rejeição de passos podem interromper uma trajetória numérica. O fim de uma lista de pontos não prova que a órbita matemática terminou.

O espaço de estados recebe a projeção dessa mesma órbita, sem uma segunda integração independente. A realização física usa os estados e velocidades do trecho escolhido. A referência canônica é 06-rarefaction.tex; as tolerâncias e limites de integração são definidos em src/math/numerics/policy.js.

## Fontes e procedência do exemplo

O levantamento das curvas características é discutido em [Eschenazi e colaboradores, versão 2, seção 4.1](https://arxiv.org/html/2312.17377v2#S4.SS1), após a construção da variedade. O modelo e as coordenadas daquele artigo têm hipóteses próprias; não se transporta sua classificação global ao fluxo escolhido abaixo. Para a construção tradicional por curvas integrais nos estados, a referência didática é [Riemann Problems and Jupyter Solutions, Rarefaction waves](https://www.clawpack.org/riemann_book/html/Shallow_water.html#Rarefaction-waves), cujo fluxo é diferente.

O exemplo triangular seguinte foi escolhido no projeto e deduzido explicitamente para testar as três representações. Não é apresentado como resultado científico original ou como exemplo retirado dessas fontes. O mapa bibliográfico está em docs/BIBLIOGRAPHY.md.

## Exemplo — Uma rarefação rápida com fórmula exata

Usamos o mesmo fluxo do capítulo de Hugoniot,

$$
F(u,v)=\left(\frac{u^2}{2},\frac{v^2}{2}+\frac34u\right),\qquad
DF(u,v)=\begin{pmatrix}u&0\\3/4&v\end{pmatrix}.
$$

Agora os dados são $U_L=(0,-3/4)$ e $U_R=(1,1/4)$. Considere a curva de estados

$$
U(\alpha)=(\alpha,\alpha-3/4),\qquad 0\leq\alpha\leq1.
$$

Nessa curva, os autovalores ordenados são $\lambda_1=\alpha-3/4$ e $\lambda_2=\alpha$, separados pelo intervalo constante $3/4$. O vetor $r_2=(1,1)^T$ satisfaz $DF(U)r_2=\alpha r_2$, e $U'(\alpha)=r_2$. A velocidade rápida cresce estritamente com derivada igual a um. Portanto, o arco define um leque regular da família 2, sem coincidência espectral nem perda de monotonicidade.

## Exemplo — O mesmo arco na variedade

Na característica temos $Y=0$, e a direção $(1,1)$ corresponde a $z=1$. Para este fluxo,

$$
P=-1,\quad Q=1,\quad R=3/4,\quad
U^0=(3/8,-3/8),\quad T=(-1,-1).
$$

Logo o levantamento exato é

$$
\gamma(\alpha)=(\tau,Y,z)=(3/8-\alpha,0,1),\qquad
\pi_-(\gamma)=\pi_+(\gamma)=U(\alpha).
$$

A carta é regular, pois $N=2$. O campo calculado por rarefactionField nesse arco satisfaz

$$
\dot\tau=-3/4,\qquad\dot z=0,\qquad\det(T,U_z)=3/4.
$$

Assim, a coordenada auxiliar do campo obedece $\alpha=3\sigma/4$ quando começa em $\alpha=0$ no parâmetro $\sigma=0$. O arco termina em $\sigma=4/3$, embora a velocidade característica varie apenas de zero a um. Isso mostra concretamente por que o parâmetro da órbita e a coordenada $\xi$ não devem ser confundidos.

Na carta recíproca, $Z=1$, $\eta=\tau$ e $\Upsilon=0$. O representante rarefactionFieldZ tem $\dot\eta=3/4$ e $\dot Z=0$: sua orientação é oposta à do representante finito nesse arco, conforme $Dh\,V_z=-zV_Z$. Os pontos geométricos e a orientação física selecionada pelo crescimento de $\lambda_2$ permanecem bem definidos.

## Exemplo — Realização física e verificação direta

Como $\xi=\lambda_2(U(\alpha))=\alpha$, o perfil é

$$
V(\xi)=\begin{cases}(0,-3/4),&\xi\leq0,\\(\xi,\xi-3/4),&0<\xi<1,\\(1,1/4),&\xi\geq1.\end{cases}
$$

No interior do leque, $V'=(1,1)^T$ e

$$
(DF(V)-\xi I)V'=\begin{pmatrix}0&0\\3/4&-3/4\end{pmatrix}\binom11=0.
$$

O perfil é contínuo nas bordas. A função $U(x,t)=V(x/t)$ satisfaz a lei de conservação em cada região e é solução fraca para $t>0$, sem salto nas bordas do leque. Sendo limitada e igual aos estados externos fora de um intervalo finito de velocidades, possui o traço inicial de Riemann pelo argumento do capítulo 20.

A conclusão aqui é uma rarefação clássica expansiva e uma solução fraca exata para esses dados. Não demonstramos unicidade global nem fornecemos uma classificação de todos os fluxos ou uma construção geral de entropias convexas.

![Rarefação rápida: arco de estados, levantamento em Y=0 e leque físico entre x=0 e x=t. A figura abre em tamanho completo.](/docs/rarefaction-reference.svg)

## Reprodução, testes e limite da interpolação

Os dados estão em docs/examples/wave-patterns-reference.json, que reutiliza os coeficientes do fixture de Hugoniot. node scripts/wave-patterns-reference.mjs --json gera 41 amostras da órbita exata, projeta-as pelo núcleo e usa rarefactionSolutionCandidate e rarefactionStateAtXi. O script de figura lê o relatório gerado; não reintegra outra curva.

O teste tests/wavePatternsReference.test.js confere as componentes do campo, o determinante da projeção, a mudança recíproca, a equação de similaridade e os valores do perfil. Neste exemplo, os estados são afins na velocidade, de modo que a interpolação linear do aplicativo reproduz o perfil exato até arredondamento. Esse fato não vale para uma rarefação curva genérica e não altera a qualificação numérica do algoritmo.

Também é importante separar regularidade da carta de regularidade de uma fibra de estado fixado: aqui $Pz+Q=0$ em $z=1$, mas o mapa da carta tem $N=2$ e a órbita característica acima é regular. Um denominador de uma parametrização de Hugoniot não deve ser usado para rejeitar essa rarefação.
