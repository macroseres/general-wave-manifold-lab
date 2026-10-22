# Atlas da variedade de ondas para o fluxo quadrático geral de dez parâmetros

Status: projeto de pesquisa iniciado em 20/10/2026 e reformulado para partir dos dez coeficientes livres. Este documento deduz uma estratificação exata pela possibilidade de homogeneização e uma normalização parcial por cartas. Não afirma uma classificação completa nem modifica os classificadores existentes. A subfamília de dois parâmetros aparece somente como validação.

## 1. Problema e referência

O espaço inicial é Theta=R^10, sem impor simetria, homogeneidade, hiperbolicidade ou existência de umbílico. Escrevemos

$$
F_\theta(u,v)=\begin{pmatrix}
a_{20}u^2+a_{11}uv+a_{02}v^2+a_{10}u+a_{01}v\\
b_{20}u^2+b_{11}uv+b_{02}v^2+b_{10}u+b_{01}v
\end{pmatrix}.
$$

Termos constantes não integram Theta: somar um vetor constante ao fluxo não altera a lei, o jacobiano ou Rankine–Hugoniot. Admitimos também os estratos em que o grau cai para um ou zero; eles não devem desaparecer numa divisão por um coeficiente quadrático.

Para cada theta, classificar a organização da variedade de ondas W_theta, suas estruturas distinguidas e suas projeções nos estados. O tipo da cônica espectral é apenas uma camada, e não o ponto de partida que substitui o fluxo.

Referência: Isaacson, Marchesin, Palmeira e Plohr, *A Global Formalism for Nonlinear Waves in Conservation Laws*, Communications in Mathematical Physics 146 (1992), 505–552. A introdução, pp. 508–509, organiza característica, coincidência, inflexão, sônicas, bifurcações secundárias e folheações; a seção 8 trata de ondas compostas; a seção 9 relaciona bifurcações a admissibilidade e transversalidade. A classificação aqui proposta não é um teorema desse artigo. O próprio exemplo quadrático ao fim da seção 8 deixa a estrutura da folheação composta por determinar naquele trabalho.

Separar três bases de variação: parâmetros do fluxo theta; ponto da variedade de ondas; dados de Riemann (U_L,U_R). Uma bifurcação ao variar o estado fixo de uma fibra não é automaticamente uma fronteira entre classes de fluxos.

## 2. Objeto e equivalência propostos

Nos parâmetros em que W_theta é uma variedade regular tridimensional, estudar o objeto marcado

$$
\mathfrak W_\theta=(\mathcal W,\mathcal C,\mathcal E,\mathcal I,
\mathcal S_-,\mathcal S_+,\mathcal{DS},\mathcal B_-,\mathcal B_+,
\mathcal H_-,\mathcal H_+,\mathscr R,\mathscr F_-,\mathscr F_+,
\mathscr T_-,\mathscr T_+,\pi_-,\pi_+,s)_\theta.
$$

E denota coincidência; I, inflexão; B, bifurcação secundária; H, histerese; R, folheação de rarefações; F, folheações de choque; T, folheações compostas. Aqui pi_- e pi_+ são projeções nos estados esquerdo e direito. O laboratório usa J para a inflexão. Os sinais -/+ referem-se aos extremos, não à família lenta/rápida. É necessário conferir a correspondência com L/R do artigo em cada fórmula, sem traduzir apenas pelo nome.

Proposta de equivalência geométrica: homeomorfismo estratificado entre os objetos marcados, suave nos estratos regulares, que preserve conjuntos distinguidos e leve folhas a folhas. Exigir compatibilidade com as projeções: pi'_± composto com h = a composto com pi_±, com a uma mesma mudança admissível dos estados para ambos os extremos. Preservar a ordenação das velocidades por uma transformação crescente comum. Esta definição é um alvo; existência de invariantes completos permanece aberta.

Manter duas relações distintas: equivalência algébrica por transformações do fluxo e equivalência qualitativa da geometria marcada. Modelos algebricamente não equivalentes podem pertencer à mesma classe qualitativa.

Quando W falhar em ser regular, registrar um setor singular próprio; não aplicar automaticamente os teoremas formulados para variedades suaves.

## 3. Normalização conservadora inicial

Admitir inicialmente U=AV+U0, x=alpha*xi+beta*tau, t=gamma*tau, com A invertível, alpha>0 e gamma>0. A orientação temporal e a ordem espacial ficam fixadas. O fluxo transformado, até constante aditiva, é

$$
\widetilde F(V)=k A^{-1}[F(AV+U_0)-F(U_0)]-dV,
\qquad k=\gamma/\alpha>0,\quad d=\beta/\alpha.
$$

Pela regra da cadeia,

$$
D\widetilde F=kA^{-1}DF A-dI,\quad
\widetilde s=ks-d,\quad \widetilde\Delta(V)=k^2\Delta(AV+U_0).
$$

Rankine–Hugoniot, sinais espectrais, igualdades sônicas e ordem das velocidades são transportados. Transformar também dados, direções projetivas e domínio físico. A implementação transformQuadraticFlux já cobre a mudança afim de estados; escalas físicas e referencial são uma etapa adicional, não implementada por esse método.

Não chamar essa escolha de quociente completo de Schaeffer–Shearer: grupos maiores podem identificar modelos adicionais. Cada comparação deve declarar qual grupo foi usado. A forma simétrica clássica não cobre automaticamente todos os fluxos mistos do laboratório.

Não eliminar um termo linear matricial geral por uma mudança de referencial, pois esta só subtrai dI. Uma translação só produz um fluxo homogêneo se existir U0 com DF(U0)=lambda I; nesse caso o referencial remove lambda I. Se não existir tal estado, manter os termos lineares e usar outra carta de normalização. Toda normalização deve retornar a transformação, seu domínio e os denominadores que não podem se anular.

Se houver viscosidade B, transportá-la também: B_tilde=(gamma/alpha^2) A^{-1} B A. A simetria euclidiana não é preservada por A geral. Fixar a identidade depois de transformar pode mudar o problema de admissibilidade.

## 4. Decomposição geral e ação nos dez coeficientes

Escreva F(U)=LU+H(U,U)/2, onde L é uma matriz 2 por 2 e H um tensor bilinear simétrico com valores em R²:

$$
L=\begin{pmatrix}a_{10}&a_{01}\\b_{10}&b_{01}\end{pmatrix},\quad
H_1=\begin{pmatrix}2a_{20}&a_{11}\\a_{11}&2a_{02}\end{pmatrix},\quad
H_2=\begin{pmatrix}2b_{20}&b_{11}\\b_{11}&2b_{02}\end{pmatrix}.
$$

H(X,Y)=(X^T H_1 Y,X^T H_2 Y). A transformação da seção 3 dá, exatamente,

$$
\widetilde H(X,Y)=kA^{-1}H(AX,AY),\qquad
\widetilde L=kA^{-1}\bigl(L+H(U_0,\cdot)\bigr)A-dI.
$$

Essa é a ação a usar antes de escolher formas normais. Os coeficientes quadráticos transformados são metade das entradas diagonais dos dois componentes de H_tilde e as respectivas entradas mistas; os quatro lineares são as entradas de L_tilde. Assim todas as dez coordenadas continuam presentes e podem ser reconstruídas. Não há justificativa para fixar oito delas a valores de um preset.

## 5. Estratificação exata pela existência de estados escalares

Um estado é escalar quando DF(U0)=lambda I. As três condições independentes são um sistema linear nos dois estados:

$$
M_\theta U_0+\ell_\theta=0,\qquad
M_\theta=\begin{pmatrix}
a_{11}&2a_{02}\\
2b_{20}&b_{11}\\
2a_{20}-b_{11}&a_{11}-2b_{02}
\end{pmatrix},\quad
\ell_\theta=\begin{pmatrix}a_{01}\\b_{10}\\a_{10}-b_{01}\end{pmatrix}.
$$

As linhas expressam f_v=0, g_u=0 e f_u-g_v=0. Defina r=rank(M) e q=rank([M|ell]). Então:

| Condição exata | Estados escalares | Homogeneização pelo grupo escolhido |
|---|---|---|
| q>r | nenhum | impossível |
| q=r=2 | um único estado | possível, com centro único |
| q=r=1 | uma reta afim | possível, com liberdade de centro na reta |
| q=r=0 | todo o plano | fluxo escalar linear, incluindo o fluxo zero |

Prova: o critério de compatibilidade do sistema linear fornece existência; quando compatível, o conjunto de soluções tem dimensão 2-r. No último caso M=0 impõe que todos os seis coeficientes quadráticos se anulem, e ell=0 impõe L=lambda I.

Se o sistema é compatível, escolher um centro U0 e lambda=tr(DF(U0))/2. Com A=I, k=1 e d=lambda, o fluxo transformado é exatamente H(V,V)/2. Reciprocamente, L_tilde=0 implica DF(U0)=(d/k)I, logo o sistema é compatível. Isso demonstra a necessidade e a suficiência sob o grupo declarado, incluindo qualquer A invertível.

Os postos r e q são invariantes desse grupo: as partes sem traço de DF são transformadas por conjugação e escala invertíveis, com translação do argumento; a dimensão da imagem linear e a dimensão de seu invólucro linear afim permanecem iguais. A identificação de um estado como escalar também é preservada. Esses estratos não são ainda classes completas de ondas.

No setor r=2, q=3 temos uma obstrução genuína à homogeneização. Não substituir esse setor pela forma normal homogênea de Schaeffer–Shearer. Mesmo no setor homogêneo, a existência de centro escalar único não garante hiperbolicidade fora do centro; as hipóteses da forma clássica devem ser verificadas separadamente.

## 6. Normalização parcial por cartas no setor de posto dois

Escolher duas linhas I de M cujo menor 2 por 2 seja invertível. Resolver

$$
U_I=-M_I^{-1}\ell_I.
$$

As duas componentes selecionadas da parte sem traço do jacobiano se anulam nesse centro. Na terceira linha j, sobra

$$
\rho_I=\ell_j+M_jU_I.
$$

Retirar a velocidade média lambda_I=tr(DF(U_I))/2 por d=lambda_I. Isso dá um representante com traço linear zero e duas das três componentes sem traço zeradas. Se rho_I=0, a parte linear inteira desaparece; se rho_I diferente de zero, ela deve ser mantida.

Pode-se ainda escolher A=I e k=1/|rho_I|, d=k*lambda_I, normalizando o resíduo a +1 ou -1. Esse passo multiplica também todos os coeficientes quadráticos por k. O valor e o sinal de rho_I são coordenadas da carta, não invariantes absolutos sob todo o grupo. Não assumir que os dois sinais definem classes diferentes antes de examinar as equivalências residuais.

Essa construção cobre todo o setor r=2 com três cartas candidatas, uma para cada par de linhas. Ela não normaliza ainda a ação residual de GL(2), nem fornece representantes únicos das órbitas. No limite rho_I=0, abandonar a divisão por rho_I. Quando o menor escolhido se anula, trocar de carta ou entrar no setor r<2.

Para r=1, resolver uma equação independente sem dividir por menores de ordem dois e transportar a liberdade na direção do núcleo; se q>r, guardar a obstrução restante. Para r=0, M=0 implica H=0: resta classificar a matriz L por similaridade, escala positiva e adição de escalar. Esse estrato linear exige tratamento próprio e pode violar as hipóteses de regularidade da variedade de ondas.

## 7. Camada espectral derivada dos dez parâmetros

Defina os vetores de três componentes, nas coordenadas homogêneas (u,v,1):

$$
p=(2a_{20}-b_{11},a_{11}-2b_{02},a_{10}-b_{01}),\quad
q=(a_{11},2a_{02},a_{01}),\quad
r=(2b_{20},b_{11},b_{10}).
$$

Aqui q e r são vetores auxiliares, distintos dos postos da seção 5. O discriminante geral é

$$
\Delta(U)=(p\cdot w)^2+4(q\cdot w)(r\cdot w)
=w^T C_\Delta w,\quad
C_\Delta=pp^T+2(qr^T+rq^T),\quad w=(u,v,1)^T.
$$

Isso deriva a cônica dos dez coeficientes, sem introduzir parâmetros independentes fictícios. Analisar o conjunto real de zeros, os sinais nas regiões e os estados escalares do sistema anterior. Não confundir elipse/hipérbole/parábola da cônica com tipo elíptico/hiperbólico/coincidente do jacobiano. Na coincidência, separar a matriz escalar da matriz de Jordan não escalar. A equação Delta=0 não basta para distinguir essas fibras próprias.

Sob a transformação da seção 3, C_Delta_tilde=k² T^T C_Delta T, com T=[[A,U0],[0,0,1]]. A congruência é consequência da transformação afim dos estados, mas uma mudança arbitrária que normalize uma cônica não necessariamente normaliza o fluxo para uma forma prescrita. Preservar os dez coeficientes e as demais estruturas ao fazer essa operação.

## 8. Subfamília de validação, sem redução da família geral

Somente para conferir as fórmulas gerais, considerar o corte já documentado no laboratório, B2=0 e a=0:

$$
F_{B,c}(u,v)=((B+1)u^2/2+v^2/2,\ uv+cu).
$$

Nos coeficientes do código: a20=(B+1)/2, a02=1/2, b11=1, b10=c, demais coeficientes zero. Usar oldWavePreset({B1:B,B2:0,a:0,c}) explicitamente; o preset padrão tem B2 diferente de zero.

Derivando o jacobiano, obtemos exatamente

$$
\Delta=B^2u^2+4v(v+c)=B^2u^2+4(v+c/2)^2-c^2.
$$

| Estrato espectral | Coincidência | Estados e fibras próprias |
|---|---|---|
| B diferente de 0, c diferente de 0 | elipse | interior elíptico, exterior hiperbólico; jacobiano não escalar na fronteira |
| B diferente de 0, c=0 | ponto (0,0) | hiperbólico fora da origem; jacobiano escalar na origem, com todas as direções próprias |
| B=0, c diferente de 0 | retas v=0 e v=-c | faixa entre retas elíptica, exterior hiperbólico; jacobiano não escalar nas retas |
| B=0, c=0 | reta dupla v=0 | hiperbólico fora da reta; jacobiano escalar em toda a reta |

Prova: completar quadrados fornece os zeros e sinais. As entradas fora da diagonal do jacobiano são v e v+c; ambas só se anulam se c=0 e v=0. A igualdade diagonal adicional é Bu=0. Isso distingue pontos escalares dos demais pontos de coincidência.

Esses quatro estratos não são quatro classes completas de ondas. O sinal de B, invisível em Delta, continua no fluxo e pode distinguir geometrias. Ainda é preciso testar se uma equivalência admissível o elimina. Usar sementes (B,c)=(2,1),(-2,1),(2,0),(-2,0),(0,1),(0,0) e c negativo para verificar o transporte residual.

Para c diferente de zero, U=|c|V seguido de k=1/|c| normaliza c a sign(c), mantendo B. A mudança A=diag(1,-1) identifica c e -c nessa família: A^{-1}F_{B,c}(AV)=F_{B,-c}(V). Portanto pode-se escolher c=1 no setor não nulo. Este transporte é singular quando c tende a zero; o estrato c=0 exige tratamento separado. B permanece um parâmetro a investigar.

Nesse corte, M tem linhas (0,1), (0,1), (B,0), e ell=(0,c,0). Para B diferente de zero, r=2; para B=0, r=1. O sistema só é compatível quando c=0. Assim os quatro casos da tabela verificam os estratos gerais de compatibilidade, sem substituir a análise dos dez parâmetros.

## 9. Primeiros invariantes adicionais

Para cada fluxo geral e representante normalizado, levantar C e sua projeção, localizar pontos escalares e não escalares, singularidades da rarefação e seu tipo local quando houver classificação justificada. Escolher amostras nos estratos (r,q), e não apenas no preset. Calcular I/J e as duas sônicas, com análise de posto. Na carta regular do laboratório,

$$
\Phi_-=Y\det M-2K,\quad \Phi_+=Y\det M+2K,
\quad \mathcal J_{cand}=\{Y=0,K=0\},
\quad\mathcal{DS}=\{Y\ne0,K=0,\det M=0\}.
$$

M=D²F[r,·] e K=tr(adj(DF(Ubar)-sI)M). Essas fórmulas já são deduzidas em 16-inflexao-dupla-sonica.md. Não contar Y=0 como choque duplamente sônico. A interpretação de J como inflexão espectral requer as condições de regularidade e simplicidade já documentadas.

Registrar componentes, dimensões, postos, incidências, tangências, tipos locais das singularidades e conexões de separatrizes. Contagens e grafos de incidência são invariantes candidatos, não invariantes completos. Comparar cartas finita e recíproca: direção projetiva infinita não é o mesmo que estado indo ao infinito.

## 10. Fronteiras candidatas no espaço de parâmetros

Para um conjunto definido por G_theta(w)=0, procurar perda do posto esperado de D_w G; para contato de uma folha X com g=0, impor g=0 e dg(X)=0, juntamente com as equações da variedade. A relevância como fronteira precisa de análise local e transversalidade da família.

Eliminar w por resultantes ou bases de Gröbner gera candidatos algébricos, não uma lista automaticamente correta: filtrar soluções reais, componentes triviais, denominadores de carta e raízes no infinito. Conexões globais e mudanças assintóticas podem escapar a uma lista de discriminantes locais.

A ausência de degenerescências detectadas numa janela não prova estabilidade global. Uma prova entre parâmetros exige controlar estratos, folheações e projeções; isotopia dos conjuntos definidos por equações, sozinha, não classifica as folhas. No infinito, usar compactificação com extensão verificada ou delimitar explicitamente uma classificação relativa a um domínio compacto.

## 11. Registro reproduzível

Cada amostra deve guardar: coeficientes originais; parâmetros e convenções; transformação normalizadora e inversa; domínio/cartas; estruturas calculadas; resíduos e tolerâncias; postos e condicionamento; incidências; comportamento de borda; versão do código e nível de evidência.

Níveis: exato demonstrado; numérico com verificação de convergência; candidato; não investigado. Igualdade de assinaturas amostradas não equivale a uma demonstração de equivalência. Lista vazia não certifica inexistência. A classificação de todos os problemas de Riemann exige ainda conexões, ordenação de velocidades e admissibilidade.

## 12. Integração e próximos entregáveis

| Etapa | Base existente | Critério de conclusão |
|---|---|---|
| A. Estratificação dos dez parâmetros | novos diagnósticos puros a partir de M e ell | compatibilidade, dimensão do lugar escalar e casos de queda de grau, com diagnóstico numérico separado do exato |
| B. Atlas de normalização | flux/affineClassification.js como base | cartas de posto dois, setores de posto menor, transporte inverso e equivalências residuais |
| C. Camada espectral geral | flux/conicClassification.js e C_Delta | cônica, sinais, fibras escalares e não escalares; amostras nos diversos estratos |
| D. Assinatura característica e sônica | characteristic/; rarefaction/; sonic/ | singularidades, incidências, J e DS, postos e cartas recíprocas auditados |
| E. Atlas de geometrias candidatas | parameterDiagram.js como referência de interface | mapa distinguindo tipo espectral, assinatura geométrica e nível de evidência |
| F. Ondas compostas e admissibilidade | state/compositeTrace.js e módulos de solução | regras de seleção declaradas; viscosidade incluída se usada |

Entrega atual: partida explícita em R^10, ação exata das transformações no tensor quadrático e na matriz linear, critério necessário e suficiente de homogeneização, estratos por postos, normalização parcial por cartas e discriminante geral. São deduções matemáticas neste documento; os novos diagnósticos e normalizadores ainda não estão integrados ao aplicativo. Formas normais completas, assinaturas de ondas, mapa geométrico, correspondência com os casos I–IV e teoremas de completude permanecem por construir. Não reutilizar as cores do atual diagrama de cônicas como rótulos de classes de ondas.

Atualização de implementação: o módulo puro `src/math/flux/scalarStratification.js` agora classifica exatamente o lugar escalar e o setor linear, e devolve um representante homogêneo quando possível. Sua integração visual e as normalizações residuais continuam pendentes.

Avanço residual: [capítulo 28](28-forma-normal-generica.md) deduz uma forma normal de órbitas no setor quadrático genérico, com dois parâmetros contínuos e um sinal linear residual. A implementação está em `genericNormalForm.js`. Os setores excepcionais da árvore desse capítulo ainda requerem formas normais próprias; a classificação global de ondas continua aberta.

Fechamento posterior do atlas de fluxos: o [capítulo 29](29-atlas-global-fluxos.md) cobre os setores excepcionais pelo par traço/cúbico binário e resolve os quocientes lineares de postos dois, um e zero. As pendências de formas normais registradas acima e na seção 14.3 descrevem o estágio anterior; são substituídas pelo capítulo 29. Permanecem abertas a classificação das estruturas globais de ondas, regularidade de W e admissibilidade. `globalFluxAtlas.js` implementa a cobertura numérica e `quadraticAtlasData` fornece os testes algébricos exatos de entrada.

## 13. Verificação reproduzível da reformulação

Executar `node scripts/verify-parameter-atlas.mjs`. O script compara as expressões de M e ell com as entradas do jacobiano, a forma matricial da cônica com o discriminante do núcleo, a transformação tensorial com a avaliação direta do fluxo e a identidade Delta_tilde=k² Delta com o fluxo transformado. A auditoria usa 24 fluxos de dez coeficientes livres, três mudanças de base invertíveis e três estados por fluxo, totalizando 72 comparações de estados. Resultado em 20/10/2026: todas passaram. Isso confere a consistência numérica das fórmulas; não substitui as demonstrações nem verifica a completude da futura classificação.

## 14. Camadas com classificação completa e limites do resultado

### 14.1. Os seis estratos de homogeneização

Para todos os dez coeficientes, existem exatamente seis pares de postos possíveis:

| r | q | Lugar escalar | Homogeneizável |
|---|---|---|---|
| 0 | 0 | plano | sim |
| 0 | 1 | vazio | não |
| 1 | 1 | reta afim | sim |
| 1 | 2 | vazio | não |
| 2 | 2 | ponto | sim |
| 2 | 3 | vazio | não |

Completude desta camada: M tem duas colunas, logo 0<=r<=2; adicionar uma coluna aumenta o posto em zero ou um. A seção 5 determina o lugar escalar em todos esses casos. Os testes dão exemplos de todos os pares, logo nenhum dos seis é apenas formal. Essa completude é quanto a esse invariante, não quanto às órbitas ou à geometria de ondas.

`classifyScalarStratum` retorna os postos, a origem e uma base de direções do lugar escalar, além da matriz e do vetor definidores. Se compatível, retorna a translação U0, a velocidade escalar lambda e os dez coeficientes de F(U0+V)-F(U0)-lambda V. Isso não elimina a liberdade de mudança linear residual.

A aritmética interna é racional com inteiros BigInt, sem tolerância de posto. Aceita números finitos, strings decimais, notação científica e frações de inteiros. Um número JavaScript é interpretado pela representação decimal String(value); coeficientes provenientes de cálculos arredondados continuam representando dados arredondados. Para coeficientes matematicamente exatos como 1/3, fornecer a string `1/3`. Esse contrato distingue exatidão algébrica dos dados fornecidos de certificação de dados aproximados.

### 14.2. As quatro classes completas do setor linear

Se os seis coeficientes quadráticos são zero, F(U)=LU. Sob similaridade real, escala positiva k e deslocamento escalar dI, há quatro classes:

| Condição | Representante do jacobiano | Código |
|---|---|---|
| L escalar | matriz zero | scalar |
| Delta>0 | diag(1,-1) | real-distinct |
| Delta<0 | [[0,-1],[1,0]] | complex-pair |
| Delta=0 e L não escalar | [[0,1],[0,0]] | jordan |

Demonstração: retirar tr(L)/2 elimina a parte escalar. No caso real distinto, diagonalização e escala normalizam os autovalores a ±1. No caso complexo, a forma real de Jordan e uma escala positiva normalizam o módulo da parte imaginária; uma reflexão identifica as duas orientações. No caso de autovalor duplo não escalar, resta um bloco nilpotente não nulo, cujo coeficiente e sinal são normalizados por similaridade. Tipo de autovalores e propriedade de ser escalar distinguem as quatro classes. Aqui a classificação é completa para os fluxos lineares sob o grupo declarado; não afirma regularidade da construção de W em todos esses casos.

### 14.3. O que impede declarar a classificação geral encerrada

Nos setores genuinamente quadráticos, faltam as órbitas e estabilizadores residuais do par (H,L), formas normais que cubram os setores singulares e invariantes completos das folheações marcadas. Também faltam controle global no infinito, conexões de separatrizes, singularidades das compostas e admissibilidade segundo uma regra declarada. São problemas matemáticos adicionais; testes e discretizações não substituem suas demonstrações.

Portanto não se declara uma classificação completa da variedade de ondas dos dez parâmetros. As duas camadas acima são fechadas; a camada espectral possui o classificador numérico de cônicas já existente; a camada global de ondas permanece um programa de pesquisa. Uma lista de cores ou de sinais não supre essa lacuna.

Verificação: `node --test tests/scalarStratification.test.js tests/affineClassification.test.js tests/conicClassification.test.js` passou em 25 testes, incluindo todos os seis pares de postos, obstruções arbitrariamente pequenas, transporte do representante homogêneo, transformações afins e as quatro classes lineares.
