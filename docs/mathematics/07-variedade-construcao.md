# Variedade de Ondas: construção e projeções

Na etapa anterior, as rarefações foram obtidas a partir da equação característica nas regiões contínuas, enquanto os choques foram descritos pela condição de Rankine–Hugoniot. Para resolver o problema de Riemann, porém, não basta estudar um salto isolado: precisamos organizar  **todos os pares de estados que podem ser ligados por um choque** , juntamente com suas velocidades, e acompanhar como essas conexões se relacionam com as famílias características.

É essa necessidade que motiva a construção da  **Variedade de Ondas**  $\mathcal W$. Ela fornece um espaço geométrico comum para estudar as relações de choque, suas fibras de Hugoniot, as projeções nos estados e os lugares especiais como a característica e as sônicas.

## Definição — Representação fora da diagonal

Fora da diagonal $U_-=U_+$, um ponto é representado pelos dois estados e pela velocidade de propagação, $P=(U_-,U_+,s)$, sujeitos à relação de Rankine–Hugoniot. Nas coordenadas de estado médio e salto, o mesmo dado é escrito $P=(\bar U,X,Z,s)$, com

$$
\bar U=\frac{U_-+U_+}{2},\qquad (X,Z)=U_+-U_-,\qquad U_\pm=\bar U\pm\frac12(X,Z).
$$

Essas são duas representações do mesmo ponto; a velocidade $s$ é parte dos dados. Na diagonal de salto nulo, a relação de Rankine–Hugoniot não determina sozinha uma velocidade, razão pela qual a desingularização deve guardar a direção característica.

Na variedade prolongada, usamos também a direção projetiva do salto. Em uma carta, escrevemos o salto como $Y r$ e impomos $(DF(\bar U)-sI)r=0$, inclusive quando $Y=0$. Assim, a diagonal prolongada guarda uma direção própria e sua velocidade. As triplas de estados e velocidade, sozinhas, não distinguem necessariamente todos esses pontos: quando o jacobiano é escalar, por exemplo, várias direções próprias têm a mesma velocidade.

O termo variedade refere-se às regiões regulares dessa construção. Degenerações do fluxo ou das cartas exigem análise própria; não se presume uma variedade suave global para todos os dez coeficientes.

## Definição — Relação de Rankine–Hugoniot

Considera-se o conjunto das triplas $(U_-,U_+,s)$ que satisfazem

$$
F(U_+)-F(U_-)=s(U_+-U_-).
$$

Os estados $U_-$ e $U_+$ são, respectivamente, os estados à esquerda e à direita do salto; $s$ é sua velocidade.

Fora da diagonal $U_-=U_+$, o vetor salto possui uma direção projetiva. Para o fluxo quadrático estudado, essa direção permite desingularizar a relação de salto e construir as cartas locais da variedade $\mathcal W$. Na diagonal, a equação de Rankine–Hugoniot torna-se trivial; por isso a variedade desingularizada não deve ser confundida simplesmente com o conjunto bruto das triplas que satisfazem a equação.

## Definição — Projeções nos espaços de estados

Em um ponto $P\in\mathcal W$, definem-se

$$
\pi_-(P)=U_-(P),\qquad\pi_+(P)=U_+(P).
$$

Fixar uma dessas projeções produz uma fibra de Hugoniot, que descreve os choques conectados ao estado fixado na orientação correspondente.

## Lema — Simetria dos estados

Se $(U_-,U_+,s)$ satisfaz Rankine–Hugoniot, então $(U_+,U_-,s)$ também satisfaz.

**Demonstração.** A troca dos estados muda simultaneamente o sinal de ambos os lados da equação de salto. $\square$

## Corolário — Involução e troca das projeções

A involução canônica $\dagger$ permuta os estados locais e, portanto,

$$
\pi_-\circ\dagger=\pi_+,\qquad\pi_+\circ\dagger=\pi_-.
$$

Na carta simétrica utilizada no laboratório, $\dagger:(\tau,Y,z)\mapsto(\tau,-Y,z)$.

## Definição — Pré-imagem, levantamento e saturação por fibras

Seja $\pi:\mathcal W\to\Omega$ uma das projeções de estados. Para $A\subset\Omega$, a pré-imagem $\pi^{-1}(A)$ é o conjunto de todas as conexões cujo extremo selecionado pertence a A. Um levantamento escolhido de A é uma aplicação $\ell:A\to\mathcal W$ tal que $\pi\circ\ell=\operatorname{id}_A$; pode não existir globalmente e não precisa ser único.

Para $B\subset\mathcal W$, definimos a saturação por fibras de $\pi$ por

$$
\operatorname{Sat}_{\pi}(B)=\pi^{-1}(\pi(B)).
$$

Essa operação reúne fibras inteiras que encontram B, sem escolher orientação física ou critério entrópico. Trata-se de saturação por fibras, não de saturação de ideais algébricos.

## Proposição — Propriedades da saturação

Vale $B\subset\operatorname{Sat}_{\pi}(B)$ e $\operatorname{Sat}_{\pi}(\operatorname{Sat}_{\pi}(B))=\operatorname{Sat}_{\pi}(B)$. Se $B\subset D$, então $\operatorname{Sat}_{\pi}(B)\subset\operatorname{Sat}_{\pi}(D)$.

**Demonstração.** Todo ponto de B tem projeção em $\pi(B)$. Além disso, $\pi(\pi^{-1}(\pi(B)))=\pi(B)$, pois cada valor de $\pi(B)$ já tem um representante em B. A idempotência segue ao tomar novamente a pré-imagem. A inclusão das imagens e depois das pré-imagens prova a monotonicidade. $\square$

## Definição — Interseção de condições e extensão

A interseção $A\cap D$ impõe simultaneamente as condições de A e D no mesmo ambiente. Em uma região tridimensional regular, duas superfícies suaves com normais independentes têm interseção local unidimensional, pelo teorema da função implícita. Sem essa hipótese, a interseção pode ter outra dimensão ou ser singular.

Neste texto, extensão deve sempre indicar o procedimento: fecho no ambiente especificado, continuação de um campo ou prolongamento de uma equação reduzida. Não se identificam automaticamente esses procedimentos. Por exemplo, retirar um fator de salto nulo altera o conjunto de zeros na característica; o conjunto reduzido prolongado precisa ser definido e comparado com o conjunto original, como no capítulo de sônicas.

Uma definição geométrica não assegura admissibilidade. Primeiro se constrói o conjunto de conexões; depois se demonstram sua correspondência com o objeto analítico e as condições de seleção dos ramos físicos. As próximas seções deduzem as coordenadas $(\tau,Y,z)$ e apresentam a característica, as sônicas e os campos geométricos que permitem organizar as ondas elementares e compostas.

## Relação com a implementação

As fórmulas do núcleo estão em 02-wave-manifold.tex e 03-charts.tex. O módulo src/math/manifold/waveState.js reconstrói o estado na carta finita regular e fornece resíduos de Rankine–Hugoniot e da equação própria. Ele não escolhe uma solução entrópica a partir dos dados de Riemann. A representação de todos os ramos de uma solução exige ainda as construções e critérios descritos nos capítulos seguintes.
