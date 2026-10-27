# Atlas global dos fluxos quadráticos de dez parâmetros

Escopo: atlas algébrico de órbitas de fluxos, sob mudanças afins dos estados, referencial e escala positiva de velocidades. O fechamento abaixo é relativo a esse grupo. Não classifica ainda folheações, conexões globais, admissibilidade ou soluções de Riemann. A construção matemática trata coeficientes reais exatos; o normalizador implementado é numérico, com condições e limitações na seção 9.

Este capítulo substitui a árvore aberta do capítulo 28 por uma cobertura dos setores excepcionais. Não afirma ser uma classificação inédita da literatura: é uma dedução para o grupo e as convenções do laboratório, apresentada aqui com provas e verificações reproduzíveis.

## 1. Grupo e representação sem perda dos dez coeficientes

Escreva F(U)=LU+H(U,U)/2, omitindo apenas a constante aditiva irrelevante. O grupo é

$$
\widetilde F(V)=kA^{-1}[F(AV+u)-F(u)]-dV,
\quad A\in GL(2,\mathbb R),\quad u\in\mathbb R^2,\quad k>0,\quad d\in\mathbb R.
$$

Introduza a covariável t(U)=tr(H_U), e o cúbico binário P(U)=det(U,H(U,U)). Com U=(x,y), escreva P=Ax³+Bx²y+Cxy²+Dy³; as letras A,B,C,D nesta expressão são escalares e não a matriz de transformação. Nos coeficientes originais,

$$
t=(2a_{20}+b_{11},\ a_{11}+2b_{02}),\qquad
(A,B,C,D)=(2b_{20},\ 2b_{11}-2a_{20},\ 2b_{02}-2a_{11},\ -2a_{02}).
$$

Não houve perda de informação: com J=[[0,-1],[1,0]],

$$
H(U,U)=\frac23t(U)U+\frac13J\nabla P(U).
$$

Demonstração: o determinante de U com o primeiro termo é zero e det(U,J grad P)=U·grad P=3P. O primeiro termo tem divergência 2t e o segundo tem divergência zero. Alternativamente, substituindo os seis coeficientes acima, a identidade reproduz as duas componentes de H(U,U), termo a termo. Portanto o par (t,P) determina exatamente os seis coeficientes quadráticos.

Para a parte quadrática, absorver k em C0=kA. Então

$$
t\mapsto tC_0,\qquad P(U)\mapsto\frac{P(C_0U)}{\det C_0}.
$$

Assim classificamos (t,P) sob uma única ação de GL(2). A liberdade de k>0 reaparece depois, na matriz linear. Translações não alteram H.

## 2. Todas as famílias com t diferente de zero

Escolha uma base em que t=(1,0). Por exemplo, se t=(t1,t2), as colunas (t1,t2)/(t1²+t2²) e (-t2,t1) têm determinante 1 e fazem essa normalização. As mudanças restantes são

$$
C_0=\begin{pmatrix}1&0\\s&r\end{pmatrix},\quad r\ne0,
\qquad f(z)=P(1,z)\mapsto f(s+rz)/r.
$$

O grau de f é preservado. Eis a lista completa, sem equivalências adicionais entre os parâmetros indicados:

| Família | P canônico | Parâmetros | Estabilizador de H |
|---|---|---|---|
| T3 | q x³+p x²y+delta y³ | delta=±1, p real, q>=0 | identidade se q>0; {I,diag(1,-1)} se q=0 |
| T2 | r0 x³+x y² | r0 real | identidade |
| T1 | b x²y | b real diferente de zero | diag(1,r), r diferente de zero |
| T0 | x³ | nenhum | [[1,0],[s,1]], s real |
| TR | 0 | nenhum | [[1,0],[s,r]], r diferente de zero |

Demonstração e algoritmos: se D diferente de zero, usar s=-C/(3D), r=sign(q0)/sqrt(|D|), com r positivo quando q0=0. Os parâmetros são delta=sign(D), p=B-C²/(3D), q=|q0|sqrt(|D|), q0=A-BC/(3D)+2C³/(27D²). Se D=0,C diferente de zero, usar s=-B/(2C), r=1/C e r0=AC-B²/4. Se D=C=0,B diferente de zero, usar s=-A/B, r=1. Se apenas A é diferente de zero, usar s=0,r=A. O polinômio zero já está normalizado.

Para obter os estabilizadores, comparar os quatro coeficientes de f(s+rz)/r com f(z) em cada linha. No grau três, o termo quadrático força s=0, o cúbico força r²=1 e o constante exige q/r=q. No grau dois, o coeficiente quadrático força r=1 e o linear força s=0. Nos demais graus, as condições produzem exatamente os grupos da tabela. Isso prova existência e unicidade dos parâmetros e lista toda a liberdade residual.

Com t=(1,0), a matriz bilinear canônica é reconstruída por

$$
H_1=\begin{pmatrix}(2-B)/3&-C/3\\A&(1+B)/3\end{pmatrix},\qquad
H_2=\begin{pmatrix}-C/3&-D\\(1+B)/3&C/3\end{pmatrix}.
$$

Usar F_quad=H(U,U)/2. Os parâmetros destas famílias não devem ser identificados automaticamente com os da forma normal de Schaeffer–Shearer.

## 3. Todas as famílias com t=0

Se P=0, H=0 pela identidade da seção 1: é o setor linear, tratado na seção 7. Para P diferente de zero, a configuração das três raízes em RP¹ ou CP¹ dá quatro famílias:

| Família | P canônico | Raízes projetivas | Estabilizador de H |
|---|---|---|---|
| Z3 | xy(x-y) | três reais distintas | seis matrizes geradas por [[0,1],[1,0]] e [[0,-1],[1,-1]] |
| Z1 | x(x²+y²) | uma real e duas conjugadas | {I,diag(-1,1)} |
| Z2 | x²y | uma dupla e uma simples | diag(1,r), r diferente de zero |
| ZT | x³ | uma tripla | [[a,0],[s,a²]], a diferente de zero |

Prova de cobertura: uma mudança projetiva real leva três raízes reais distintas a {0,1,infinito}; uma raiz real e um par conjugado a {infinito,i,-i}; duas raízes de multiplicidades distintas aos dois eixos; uma raiz tripla ao eixo x=0. Esses mapas podem ser construídos com as colunas dadas pelas direções das raízes, e, no caso complexo, por suas partes real e imaginária. Depois, uma mudança escalar C0=cI multiplica P por c e ajusta qualquer coeficiente restante a 1, inclusive seu sinal. Logo não resta parâmetro de amplitude.

Prova dos estabilizadores: uma matriz preservadora deve permutar as raízes, respeitando realidade e multiplicidade. No caso distinto real há seis permutações projetivas, cada uma com um único levantamento que satisfaz P(C0U)=det(C0)P(U); os dois geradores da tabela realizam todas. No caso complexo, só são possíveis identidade e troca do par conjugado. No caso duplo, os eixos não podem ser trocados, e a igualdade de coeficientes força a primeira entrada diagonal a 1. No triplo, o eixo x=0 deve ser preservado; escrevendo C0=[[a,0],[s,r]], a igualdade força r=a². Isso esgota as matrizes possíveis.

A decisão algébrica das raízes usa

$$
\mathcal D=18ABCD-4B^3D+B^2C^2-4AC^3-27A^2D^2.
$$

Se Dcal>0, família Z3; se Dcal<0, Z1. Para Dcal=0, o Hessiano com coeficientes (3AC-B²,9AD-BC,3BD-C²) separa raiz tripla (três coeficientes zero) de dupla. P=0 é separado primeiro. Essas condições são homogêneas e incluem raízes no infinito.

Para reproduzir o mapa com raízes afins, escolher primeiro uma direção e2 com P(e2) diferente de zero. Entre (0,1),(1,0),(1,1),(1,-1), ao menos uma serve: um cúbico não nulo não tem quatro zeros projetivos distintos. Completar e2 para uma base. Então P(1,z) tem grau três e todas as raízes são finitas; normalizar suas direções conforme a tabela, e ajustar o coeficiente por C0=cI.

## 4. A parte linear como quociente, não como descarte

Após normalizar H, retirar tr(L)I/2 e definir S_x=H_x-t(x)I/2. Translações permitem somar S_u à parte sem traço. Portanto o dado linear é

$$
[L_0]\in V_H=\mathfrak{sl}_2(\mathbb R)/\{S_u:u\in\mathbb R^2\}.
$$

A dimensão é 3-rank(M), onde M é a matriz do capítulo 27. Sob o estabilizador D0 de H e uma escala k>0,

$$
[L_0]\mapsto k[D_0^{-1}L_0D_0].
$$

Isto decorre diretamente do grupo da seção 1 e de D0^-1 S_u D0=S_(D0^-1u). Não é permitido trocar o critério de viscosidade ou os dados de Riemann nessa operação sem transportá-los.

## 5. Fechamento residual em posto dois

Aqui V_H é uma reta. O determinante da conjugação em sl2 é 1, e o determinante de sua restrição à imagem de S é det(D0)^-1, pois S é injetiva. Portanto a ação na reta quociente é multiplicação por det(D0).

Consequência: se o estabilizador tem um elemento de determinante negativo, há só dois casos, zero e não zero. Caso contrário, há três, zero, positivo e negativo, após fixar a orientação da coordenada quociente.

| Família de posto dois | Classes lineares residuais |
|---|---|
| T3 com q>0 | 0,+,- |
| T3 com q=0, exceto o caso de posto um abaixo | 0,1 |
| T2 | 0,+,- |
| T1, b diferente de 1/2 e -1 | 0,1 |
| T0 | 0,+,- |
| TR | 0,1 |
| Z3, Z1, Z2 | 0,1 |

A coordenada e o representante são escolhidos explicitamente assim: escrever S_e1,S_e2 e L0 nas coordenadas (x,y,z) de [[x,y],[z,-x]]. Escolher o menor 2 por 2 de maior módulo das duas colunas S, com desempate por ordem fixa. A translação única que zera essas duas coordenadas deixa somente a terceira. Esta terceira coordenada define o sinal; uma escala positiva a reduz a ±1. Onde sinais são identificados, aplicar uma das reflexões da tabela de estabilizadores antes de repetir a redução. Assim a palavra sinal tem uma convenção reproduzível e não depende de uma orientação tácita.

Mudanças de pivô são costuras de carta, não bifurcações de ondas. Em cada carta, todo fluxo tem representante e a regra de transição é a ação do grupo descrita na seção 4.

## 6. Todos os setores de posto um

Calculando os menores das colunas S_e1,S_e2 nas formas das seções 2–3, os únicos casos quadráticos de posto um são os quatro tipos abaixo. Nenhum H quadrático não nulo tem posto zero: as condições M=0 forçam todos os seus seis coeficientes a zero, como no capítulo 27.

### 6.1. T3 com p=1/2 e q=0, delta=±1

Aqui H_e1=I/2 e H_e2=J_delta=[[0,-delta],[1/2,0]]. Um complemento à imagem de S é gerado por E=diag(1,-1) e K_delta=[[0,delta],[1/2,0]]. Escreva N=xE+uK_delta. O único estabilizador não trivial é diag(1,-1), que leva (x,u) a (x,-u).

Representantes: N=0 ou N=alpha E+sqrt(1-alpha²)K_delta, com -1<=alpha<=1. Prova: usar a reflexão para u>=0 e a escala positiva para x²+u²=1. O sinal de x não pode ser removido. Esta é uma subfamília excepcional contínua que uma lista apenas de sinais perderia.

### 6.2. T1 com b=1/2

A imagem de S é a reta gerada por E21. Escolher N=[[x,y],[0,-x]]. O estabilizador diag(1,r) age por (x,y)→(x,ry), além da escala positiva comum.

Seis representantes: 0; E12; E; -E; E+E12; -E+E12. Prova: se x=0, separar y=0 de y diferente de zero; se x diferente de zero, fixar x=±1 e separar y=0 de y diferente de zero. O parâmetro r remove módulo e sinal de y.

### 6.3. T1 com b=-1

A imagem de S é a reta diagonal. Escolher N=[[0,y],[z,0]]. O estabilizador age por (y,z)→(ry,z/r), além da escala positiva comum.

Cinco representantes: 0; E12; E21; E12+E21; E12-E21. Prova: separar as duas coordenadas nulas, cada eixo não nulo e, fora dos eixos, o sinal de yz. Esse sinal é preservado e o módulo é eliminado pela escala positiva.

### 6.4. ZT

H_e1=E21 e H_e2=0. Escolher N=[[x,y],[0,-x]]. O estabilizador [[a,0],[s,a²]] age, no quociente, por

$$
(x,y)\mapsto(x+ys/a,\ ay),
$$

além da escala positiva comum. Quatro representantes: 0; E; -E; E12. Se y diferente de zero, s elimina x e a elimina o sinal de y; se y=0, resta o sinal de x. Após a conjugação, retirar novamente a componente E21 por uma translação: ela pode reaparecer no representante matricial, embora sua classe quociente seja zero.

### 6.5. Prova de exaustividade dos postos

Em t=(1,0), as colunas S em coordenadas (x,y,z) são

$$
((1-2B)/6,-C/3,A)^T,\qquad(-C/3,-D,(1+B)/3)^T.
$$

Na família T3, C=0,D=delta diferente de zero, e o posto cai exatamente se a primeira coluna é zero: p=1/2,q=0. Em T2, C=1 torna independentes as colunas. Em T1, as colunas são diagonais em coordenadas diferentes, e o posto cai exatamente em b=1/2 ou b=-1. Em T0 e TR, os menores dão posto dois. Para t=0, posto um implica H(x,y)=l(x)l(y)v para uma covariável l e um vetor v: a simetria de H força esse fatoramento quando os operadores H_x são proporcionais. A condição de traço zero força l(v)=0, logo det(U,H(U,U)) é múltiplo de l(U)^3. Portanto o caso é precisamente ZT. Isso esgota todas as quedas de posto.

## 7. O setor linear

Se H=0, usar as quatro formas do capítulo 27: matriz zero, diag(1,-1), [[0,-1],[1,0]] e E12. Translações são irrelevantes. A classificação é por similaridade real, escala positiva e referencial; as quatro formas são distintas e exaustivas.

## 8. Teorema de cobertura e equivalências

Para cada fluxo real de dez coeficientes, existe uma sequência finita de transformações do grupo da seção 1 que o leva a um dos representantes das seções 2–7, com parâmetros e convenções de carta declarados.

Prova: separar t diferente de zero e t=0 é invariante. No primeiro caso, a redução do polinômio de grau no máximo três dá exatamente T3,T2,T1,T0,TR. No segundo, a configuração projetiva das raízes dá Z3,Z1,Z2,ZT ou o setor linear. A identidade da seção 1 reconstrói H, logo nenhuma parte quadrática foi omitida. Para cada H, calcular seu estabilizador esgota as equivalências restantes de H. A parte linear é exatamente o quociente da seção 4. Se o posto é dois, a seção 5 esgota as órbitas; todas as exceções de posto um estão na seção 6; o posto zero é linear. Portanto não resta outro setor de fluxos sob o grupo escolhido.

Dois fluxos são equivalentes se, e somente se, suas formas quadráticas correspondem à mesma linha e aos mesmos parâmetros das tabelas, e suas classes lineares residuais coincidem, incluindo alpha na semicircunferência. O sinal de posto dois deve ser comparado na mesma carta de pivô, ou transportado pela transição explícita. A necessidade decorre da lista completa dos estabilizadores e suas ações; a suficiência decorre da construção dos representantes. Essa afirmação é algébrica; rótulos numéricos próximos das fronteiras não são certificados por esse teorema.

O resultado fecha o atlas algébrico relativo a este grupo. Não declara que todas as órbitas distintas tenham geometrias de ondas distintas; equivalência qualitativa das folheações pode reunir várias órbitas algébricas. Também não prova regularidade de W nos estratos degenerados.

## 9. Implementação, condicionamento e evidência

`src/math/flux/globalFluxAtlas.js` realiza a redução e retorna família, parâmetros, representante de dez coeficientes, classe linear e transformação completa (A,u,k,d). Retorna também a matriz inversa dos estados. O resultado não é integrado à interface neste estágio.

O retorno inclui `canonicalQuadraticPair` e `canonicalQuadraticCoefficients`, este último com frações racionais que preservam exatamente as identidades estruturais do par canônico nos parâmetros aproximados retornados. Não recalcular a família por testes exatos sobre os seis coeficientes de ponto flutuante: por exemplo, representações decimais independentes de 1/3 e 1/6 podem perder uma identidade de traço zero. Usar o par declarado ou os coeficientes racionais estruturados para esses diagnósticos.

`quadraticAtlasData` em `scalarStratification.js` determina t=0, P=0, sinal do discriminante, multiplicidade projetiva e grau da carta de traço por aritmética racional dos decimais fornecidos. Frações exatas e strings são aceitas nesse diagnóstico; o normalizador global requer números finitos e usa raízes e operações matriciais em ponto flutuante.

Um resultado numérico normalizado é evidência computacional, não certificado exato da órbita. A correção de 21/10/2026 substitui decisões absolutas dos resíduos lineares por razões relativas à escala do quociente. Uma coordenada calculada diferente de zero, mas pequena em relação às outras, não recebe rótulo de eixo: o retorno é `ill-conditioned`, motivo `residual-axis-unresolved`, sem classe residual ou representante normalizado. Uma coordenada calculada exatamente zero pode usar o caso de eixo. Isso não certifica zeros de dados previamente arredondados: transformações mal condicionadas e cancelamento exigem análise adicional.

A reprodução (x,y)=(1,1e-10) na família T1, b=1/2, antes rotulada em duas classes após multiplicar a parte linear por 100, agora é inconclusiva nas duas escalas. Os testes verificam esse comportamento entre 1e-12 e 1e12 e preservam classes resolvidas e eixos exatos. Uma transformação arredondada pode alterar um estrato exato dos dados fornecidos. `ill-conditioned` não significa família ausente do atlas. Para certificação em fronteiras, é necessária avaliação algébrica/intervalar adicional.

Os testes cobrem as nove famílias quadráticas, as quatro formas lineares, as duas famílias semicirculares, todas as seis/cinco/quatro classes discretas de posto um, reconstrução do fluxo e discriminante, mudanças de base com determinante negativo, translações e escalas positivas. Os testes não são a prova da cobertura: a prova é a divisão exaustiva das seções anteriores.

`node scripts/verify-global-flux-atlas.mjs` verifica simbolicamente, com coeficientes inteiros exatos, as identidades P(D0U)=det(D0)P(U) para todos os geradores dos estabilizadores listados. A condição tD0=t nas famílias T é direta da primeira linha das matrizes. O script também verifica o menor não nulo que exclui queda de posto em T2. Isso audita as identidades usadas nas provas, sem confundir existência dos geradores com a prova de que eles esgotam os estabilizadores.

## 10. Próxima etapa científica

Com os setores do atlas explicitados, investigar a regularidade da variedade prolongada W em cada família e, nos setores regulares, classificar a característica e sua folheação de rarefações. A lista de famílias acima pode organizar essa investigação, mas não fornece por si só uma solução do problema de Riemann.

## 11. Referência e procedência

A decomposição de uma multiplicação comutativa bidimensional em traço e cúbico binário torcido é conhecida: Rausch de Traubenberg e Slupinski, *Polynomial invariants and moduli of generic two-dimensional commutative algebras*, [arXiv:1612.05737, proposição 3.5](https://arxiv.org/html/1612.05737). A parametrização real usada aqui e a redução da matriz linear são deduzidas nas seções anteriores; não atribuímos a esse artigo a classificação do fluxo não homogêneo ou das ondas. O grupo e os fatores de normalização devem ser conferidos ao comparar convenções.

## 12. Continuidade do estudo e integração em Parâmetros — 27/10/2026

O painel Parâmetros passou a apresentar três camadas independentes: geometria
espectral da cônica, estrato de estados escalares/homogeneização e raízes
projetivas do cúbico da parte quadrática. O resumo do fluxo atual e o resumo
expansível do ponto inspecionado usam o mesmo adaptador
`src/math/flux/parameterClassification.js`, sem modificar os classificadores.
A apresentação está em `src/components/ParameterClassification.jsx`.

A geometria da cônica usa ponto flutuante e tolerância relativa de 1e-9.
`classifyScalarStratum` e `quadraticAtlasData` usam aritmética racional dos
decimais fornecidos. A interface declara essa procedência e não converte
exatidão dos dados fornecidos em certificação de dados físicos arredondados.
Direções incluem a reta projetiva inteira; uma raiz no infinito não é omitida.
Uma direção cúbica não equivale automaticamente a um equilíbrio, e nenhum
resultado dessas camadas certifica admissibilidade ou conexões globais.

O mapa colorido continua representando tipos de cônicas. Não foram adicionadas
curvas de bifurcação, classes de singularidades ou mudanças no construtor RR.
As funções de arraste, zoom, inspeção e aplicação explícita continuam separadas.

### Resultados gerais obtidos na análise, para prosseguimento

Para os dez coeficientes livres, escreva

$$
\alpha=(2a_{20}-b_{11},a_{11}-2b_{02},a_{10}-b_{01}),\quad
\beta=(a_{11},2a_{02},a_{01}),\quad
\gamma=(2b_{20},b_{11},b_{10}).
$$

Então a matriz homogênea da cônica é
`C_Delta = alpha alpha^T + 2(beta gamma^T + gamma beta^T)` e

$$
\det C_\Delta=-4\det[\alpha;\beta;\gamma]^2.
$$

A identidade decorre de `C_Delta = S^T K S`, com linhas de S iguais a
alpha, beta, gamma e `K=[[1,0,0],[0,0,2],[0,2,0]]`, cujo determinante é -4.
O sistema escalar aumentado do capítulo 27 tem as mesmas linhas, a menos de
permutação. Portanto cônica não degenerada equivale ao estrato de postos
(2,3), não homogeneizável pelo grupo declarado.

Na carta finita, use os P,Q,R de `charts/zChart.js`, `D=P²+Q²>0` e
`(u0,v0)=-R(P,Q)/D`. O campo levantado de `rarefaction/field.js` tem a forma

$$
\dot\tau=a(z)\tau+b(z),\qquad\dot z=g(z),\qquad
a=zP'+Q',\quad b=zv_0'-u_0',\quad g=-Q-zP=-\Psi(z,1).
$$

Para raiz real de g em carta regular: se a não se anula, o equilíbrio é
`tau=-b/a`; se a=0 e b diferente de zero, não há equilíbrio nessa direção;
se a=b=0, há uma linha de equilíbrios. No equilíbrio isolado a linearização
é triangular com autovalores a e g'. Isso fornece critérios locais de sela,
nó, perda de hiperbolicidade e autovalor repetido. Não se inferem focos ou
Hopf desse campo; os campos sônicos do laboratório são outros objetos.
Essas condições gerais ainda não foram implementadas neste painel.

As falhas D=0 exigem distinguir P=Q=0,R diferente de zero (fibra ausente) de
P=Q=R=0 (plano de estados na direção). Falha da parametrização não prova
singularidade da superfície de incidência; verificar seu diferencial.
A carta Z=1/z é obrigatória: passagem pelo infinito pode ser apenas troca
de carta, sem bifurcação geométrica.

Entre raízes de g, as folhas satisfazem a equação linear
`d tau/dz = (a/g) tau + b/g`. O estudo global deve analisar as soluções,
conexões entre separatrizes, transições entre cartas e setores excepcionais.
Não foi demonstrado que as condições locais esgotam as fronteiras globais.

Verificação transitória da análise geral: 160 fluxos inteiros com dez
coeficientes variados; identidade dos determinantes com erro observado zero;
3336 avaliações do campo com erro normalizado máximo 2.97e-15; 240 equilíbrios
com resíduo escalado máximo 9.64e-14; 30 avaliações na direção infinita com erro
máximo 3.56e-15. São evidências numéricas de consistência, não a prova das
identidades nem certificação de completude. Os ensaios foram executados sem
criar arquivos de produção adicionais.

### Ponto de retomada no ChatGPT

Partir dos dez coeficientes e das equivalências dos capítulos 27–29. Não
substituir o problema geral pela família (B,c), que serve apenas como exemplo.
Próximas entregas científicas: auditar simbolicamente os critérios locais
acima; cobrir raízes múltiplas e fibras excepcionais nas duas cartas;
estudar as condições globais de conexão; só depois determinar quais
fronteiras podem ser sobrepostas aos cortes bidimensionais do mapa.
O setor homogêneo clássico deve ter suas hipóteses verificadas antes de
importar classificações de Schaeffer–Shearer. Preservar a distinção entre
órbitas algébricas, tipos locais, folheações globais e admissibilidade física.
A integração visual desta seção não inicia a GWML-T03.

Verificação da integração visual: `npm run lint`, `npm run test` (822 testes,
zero falhas) e `npm run build` passaram. Permanece o aviso de tamanho do bundle.
Cinco regressões novas verificam cônicas iguais com direções diferentes,
homogeneização, setores de raízes múltiplas/cúbico nulo, coeficientes gerais e
entrada inválida. A interface foi conferida no navegador para o fluxo atual e
a seleção inspecionada, incluindo a expansão dos critérios e das ressalvas.
