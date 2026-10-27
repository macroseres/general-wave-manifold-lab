# Ordenação necessária das rarefações de Riemann

Para uma rarefação centrada da família `i`, a velocidade característica `lambda_i(U)` deve aumentar da esquerda para a direita no espaço autossimilar `xi=x/t`. Ao continuar a partir de `U_L` rumo a um estado intermediário, conservamos o trecho de cada ramo em que `lambda_i` não diminui. Ao continuar de `U_R` para trás, rumo ao estado intermediário, conservamos o trecho em que `lambda_i` não aumenta. O critério é necessário, não suficiente, para construir uma solução de Riemann admissível.

Os campos e a integração permanecem os de `stateIntegralCurves.js`. `monotoneBranches.js` filtra o prefixo de cada ramo e registra as velocidades e a razão de interrupção. O filtro usa tolerância relativa e interrompe na primeira inversão resolvida; não trata automaticamente regiões não genuinamente não lineares, ondas compostas, transições sônicas, entropia de choque ou continuação através de pontos degenerados.

A notação canônica do sistema permanece `mathcal F = X mathcal G`, com `mathcal G=(DF(bar U)-sI)r` na carta finita.

## GWML-T02 — corretor conjunto RR (2026-10-26)

A auditoria da implementação anterior identificou que o construtor RR aceitava
`hit.point` da interseção de poligonais como estado intermediário. Não existia
`rarefactionJointCorrector.js`; o corretor conjunto de cadeias mistas resolve
outro problema (Rankine–Hugoniot) e não foi reutilizado para RR.

Agora as poligonais fornecem somente sementes. O módulo
`src/math/solution/rarefactionJointCorrector.js` reintegra os campos normalizados
no plano de estados a partir dos respectivos estados de origem e resolve
`R(s,t)=C_slow(s)-C_fast(t)=0` por Newton amortecido. O Jacobiano é calculado
por diferenças finitas da própria integração discretizada, com diferenças
unilaterais nos limites. O número de subpassos RK4 é `ceil(s/integrationStep)`;
assim, a discretização é suave por trechos e não se afirma convergência
quadrática universal de Newton nas mudanças desse número.

O sinal inicial vem do ramo e a orientação é propagada entre as etapas e os
passos, inclusive quando muda a convenção canônica de sinal do autovetor.
Os dois parâmetros ficam nos intervalos fechados dos ramos fornecidos;
nenhuma tentativa de Newton pode extrapolá-los. Registram-se resíduo absoluto,
resíduo dividido por `1+max(norm(C_slow),norm(C_fast))`, parâmetros, limites,
iterações, passo máximo de integração e transversalidade. O condicionamento
registrado é o número de condição em norma 2 das colunas normalizadas do
Jacobiano; a rejeição por baixa transversalidade ocorre inclusive se o resíduo
já for pequeno. Estagnação, falha de integração, de amortecimento ou limite de
iterações não produzem candidato aceito.

Os limites usam os parâmetros efetivamente integrados, registrados em
`stateIntegralCurves.js` e truncados junto aos pontos pelo filtro de monotonicidade.
Ramos legados sem parâmetros usam o comprimento acumulado das cordas como
extensão conservadora; essa aproximação pode perder uma interseção próxima
à extremidade e não identifica exatamente a parametrização da curva contínua.
O integrador também rejeita erro estimado acima da tolerância no passo mínimo.
`boundedLength:true` limita estritamente a extensão em comprimento de arco;
o padrão mantém a política histórica de parada por comprimento de cordas,
necessária à compatibilidade com os demais construtores. Portanto `maxLength`
no modo histórico continua podendo ser ultrapassado pelo último passo.

Os leques são reconstruídos das curvas reintegradas. Ambos usam a média dos
dois extremos como estado comum, com deslocamento de cada extremo limitado
à metade do resíduo de fechamento. O perfil mantém a interpolação linear por
velocidade característica. A estrutura `sampled-candidate`, os adaptadores
físicos e os controles gráficos foram preservados. `refinement` contém os novos
diagnósticos, sem duplicar as trajetórias na saída pública.

### Reprodução e resultados numéricos

Executar `node scripts/audit-rr-convergence.js` para obter as 24 combinações
de dois fluxos, três espaçamentos-alvo de amostragem (`0.08,0.04,0.02`) e quatro
passos máximos do corretor (`0.08,0.04,0.02,0.01`). A integração-fonte é a mesma
nos três casos: RK4 adaptativo com passo inicial `0.0025`, tolerância `1e-12`
e comprimento limitado a `1`. As poligonais são obtidas por decimação: conserva-se
o primeiro ponto cuja distância paramétrica ao último conservado atinge o
espaçamento-alvo, além do extremo final. O espaçamento efetivo pode exceder o
alvo por um passo da integração-fonte; assim se varia a amostragem sem alterar
a integração-fonte. O corretor usa resíduo relativo `1e-13` neste estudo
(padrão `1e-10`).

Os fluxos são `F=(u²/2, b20*u²+v²/2+2v)`, com `b20=0.5` ou `1`,
`U_L=(0,0)` e `U_R=(0.5,0.5)`. A família lenta curva satisfaz a equação
independente `dv/du=2*b20*u/(u-2-v)`, integrada em coordenada `u` com 4096
passos RK4 para a referência. Com 8192 passos, a diferença em `v_M` foi
respectivamente `1.11e-16` e `1.67e-16`, sem constituir limite rigoroso de erro.
As referências são `(0.5,-0.0772420931221103)` e
`(0.5,-0.15865927938711646)`.

Resultados com espaçamento-alvo de amostragem `0.08`:

| b20 | passo do corretor | norma do resíduo | erro de U_M | erro máximo do perfil amostrado |
| --- | --- | --- | --- | --- |
| 0.5 | 0.08 | 6.94e-17 | 2.20e-8 | 4.32e-4 |
| 0.5 | 0.04 | 2.08e-16 | 1.83e-9 | 1.37e-4 |
| 0.5 | 0.02 | 1.94e-16 | 1.14e-10 | 3.51e-5 |
| 0.5 | 0.01 | 6.33e-16 | 7.65e-12 | 5.27e-6 |
| 1 | 0.08 | 2.77e-14 | 1.46e-8 | 9.79e-4 |
| 1 | 0.04 | 2.77e-14 | 1.02e-9 | 2.18e-4 |
| 1 | 0.02 | 2.74e-14 | 7.77e-11 | 5.31e-5 |
| 1 | 0.01 | 2.80e-14 | 5.00e-12 | 1.80e-5 |

O erro de perfil é a maior norma euclidiana em seis valores fixados de xi
(`0.137,0.25,0.413,1,2.1,2.25`), e não uma norma suprema contínua.
Os condicionamentos normalizados são aproximadamente `1.41` e `1.99`.
Variações na busca mantêm os erros de U_M na mesma escala para cada passo
do corretor. O estado converge aproximadamente com a ordem do RK4; o perfil
tem erro adicional de interpolação linear e não herda automaticamente essa ordem.

`tests/rarefactionJointCorrector.test.js` verifica esses estudos, limites dos
ramos, rejeição por condicionamento, tolerância de integração, estado comum
dos leques, patamar intermediário e perfis físicos em três tempos. Também
verifica um fluxo geral com `a02=0.1`, `b20=0.5`, com ambas as curvas não retilíneas:
dados manufaturados por integração fina a partir de `(0.4,-0.1)` são recuperados
com erro inferior a `1e-9` no estado intermediário.

### Limites científicos

A busca continua local e incompleta, condicionada à existência de sementes
poligonais e aos ramos fornecidos. O resíduo de Newton mede fechamento das
EDOs discretizadas e não limita o erro de integração. Hiperbolicidade e
monotonicidade são verificadas em amostras/etapas; não há prova contínua de
ausência de inversões ou degenerações entre elas. Os testes não demonstram
existência ou unicidade global, admissibilidade entrópica nem correção para
todos os fluxos quadráticos. `entropyCertified:false` e `search.complete:false`
permanecem explícitos. GWML-T03 não faz parte desta atividade.

### Verificação e entrega

Em 2026-10-26, `npm run lint` passou, `npm run test` passou com 806 testes
(800 existentes e seis novos, zero falhas) e `npm run build` passou.
O build mantém o aviso de bundle superior a 500 kB. A suíte inclui renderização
dos componentes RR/contatos e os demais construtores; não foi feita inspeção
manual da interação em navegador. `git diff --check` não indicou erros de
espaçamento. A GWML-T02 está implementada e numericamente validada nos casos
descritos, com os limites científicos acima; alterações locais na `main`, sem
nova branch ou Pull Request.

Arquivos afetados: `src/math/solution/rarefactionJointCorrector.js`,
`src/math/solution/rarefactionPairCandidates.js`,
`src/math/rarefaction/stateIntegralCurves.js`,
`src/math/rarefaction/monotoneBranches.js`,
`tests/rarefactionJointCorrector.test.js`, `scripts/audit-rr-convergence.js`
e este documento existente.

A integração da revisão paralela preservou também os pontos de entrada
`refineRarefactionIntersection`, `sampledArcLength` e
`integrateCharacteristicLength`, agora apoiados nos mesmos limites e na mesma
reintegração do corretor validado. O teste adicional cobre a interseção triangular,
os índices inválidos, a proveniência e a rejeição de extrapolação na API auxiliar.
Após a integração, lint, 807 testes (zero falhas) e build passaram; o aviso de
tamanho do bundle permanece. O registro de status em `docs/STATE_SPACE_STATUS.md`
foi atualizado para refletir esses resultados.

### Relatório de busca RR e alinhamento da especificação

`searchRarefactionPairs(states,branches,p,options)` retorna `{candidates,report}`.
O relatório permanece disponível quando `candidates` está vazio. A entrada
existente `rarefactionPairCandidates` continua retornando um array; cada candidato
inclui o mesmo relatório em `search.report`, sem referência circular. O espaço
de estados usa a entrada com relatório e mostra o diagnóstico no laboratório
numérico, incluindo os motivos de tentativas rejeitadas ou inconclusivas.

O campo `status` distingue `invalid-input`, `incompatible-branches`,
`no-candidates-found`, `inconclusive`, `numerical-failure` e `candidates-found`.
`incompatible-branches` significa que os dados fornecidos não contêm um par
elegível ancorado lenta/esquerda e rápida/direita; não é prova de incompatibilidade
matemática do problema. Se houver candidatos e também falhas, o resumo permanece
`candidates-found` e as falhas continuam nos diagnósticos individuais.

Cada tentativa registra o par de ramos, os índices da semente, etapa, motivo e
classificação. Falhas do corretor preservam seu resultado, incluindo resíduo e
transversalidade quando disponíveis. Mau condicionamento, estagnação, limite de
iterações e falha de amortecimento são inconclusivos; falha de reintegração é
uma falha numérica. Rejeições dos leques ou da ordenação são incompatibilidades
nas verificações amostradas, sem prova de inexistência de outro candidato.

`report.branches` preserva identificador local, família, lado, orientação,
elegibilidade/motivo de exclusão, quantidade de pontos, extensão paramétrica e
condições de parada do traçado e do filtro. `report.pairs` distingue pares
`examined`, `partially-examined` e `not-explored`; registra quantas sementes foram
encontradas e examinadas e, no par interrompido, os índices das sementes restantes.
Para pares ainda não explorados, a quantidade de sementes é desconhecida (`null`).

`stopReason:'candidate-limit'` e `candidateLimitReached:true` registram a parada
pelo orçamento. `seedSearchExhausted` indica somente se todas as sementes dos
pares fornecidos foram examinadas; pode ser verdadeiro quando o limite coincide
exatamente com a última semente. `complete:false` permanece em todos os casos,
pois não há completude global das curvas nem da busca. `tolerances` registra os
parâmetros da busca e do corretor inclusive quando não há candidatos.

As seções de status, o contrato das 16 cadeias e a rastreabilidade foram alinhados
com a T02, removendo as declarações de ausência do corretor RR. As pendências de
RC/CR, contatos variáveis e outros padrões continuam fora desta entrega. A
especificação geral dos critérios ainda é um contrato mais amplo: este relatório
não implementa uma certificação entrópica ou todos os critérios das 16 cadeias.

Validação deste fechamento: `npm run lint`, `npm run test` (812 testes, zero
falhas) e `npm run build` passaram. Os cinco novos testes de busca cobrem
entradas inválidas, ausência de pares elegíveis, busca sem sementes, resultados
inconclusivos, falhas de integração, metadados de parada, limites com pares ou
sementes pendentes, esgotamento exato no limite e compatibilidade da API de arrays.
O teste de renderização existente cobre o novo painel, inclusive os motivos
de mau condicionamento e a parada por limite. Não houve inspeção manual no
navegador; permanece o aviso preexistente de bundle superior a 500 kB.

### Inspeção visual interativa — 26/10/2026

Foi inspecionado o aplicativo em `http://192.168.50.73:5173/`, no navegador
integrado, com viewport de aproximadamente 1304 × 884 pixels. Foram usados os
controles públicos de coeficientes, coordenadas de Riemann, seleção de cadeia,
ajuste da janela, diagnóstico e tempo; nenhum dado interno foi injetado na página.

Casos positivos: `F=(u²/2,b20*u²+v²/2+2v)`, `U_L=(0,0)`,
`U_R=(0.5,0.5)`, com `b20=0.5` e `1`. A interface exibiu respectivamente
`U_M=(0.50000,-0.077242)` e `(0.50000,-0.15866)`, compatíveis com as referências
na precisão mostrada. No primeiro caso, o relatório registrou um candidato,
zero pares pendentes e zero falhas/casos inconclusivos. A seleção no plano foi
compartilhada com a vista física; apareceram dois leques azuis, patamar
intermediário e perfis contínuos. As bordas mostradas foram `[0,0.5]` e
`[1.9228,2.5]`. Os controles atualizaram os perfis em `t=0.25,0.5,1`.
Essas observações não medem o erro contínuo do perfil nem substituem os estudos
numéricos anteriores.

Caso negativo: mantendo `b20=0.5`, alterou-se `U_R` para `(0.5,-0.5)`.
A árvore de acessibilidade registrou zero candidatos e a mensagem
“Nenhum candidato encontrado na busca limitada”, preservando a ressalva de
que isso não demonstra inexistência. A leitura visual desse diagnóstico teve
o problema de acesso descrito abaixo. Limite de candidatos, falha de integração
e mau condicionamento não foram induzidos pela interface nesta sessão; sua
evidência permanece nos testes automatizados.

**Resultado: inspeção concluída, aprovação visual integral pendente.** Foram
reproduzidos cinco problemas, sem corrigir o código nesta sessão:

| Prioridade | Problema observado | Reprodução e resultado esperado |
| --- | --- | --- |
| Alta | A vista física conserva candidato de outro fluxo | Calcular RR em Estados com `b20=1`; em Parâmetros mudar para `0.5`; ir diretamente a Físico. O valor continua `v_M=-0.15866`, embora o correto para o fluxo atual seja aproximadamente `-0.077242`. Visitar Estados e voltar a Físico atualiza o candidato. Deve haver recomputação ou invalidação explícita antes de mostrar um perfil para outro fluxo. |
| Média | Legenda do plano classifica RR como S–R | Selecionar “Cadeia 1 · RR”. A legenda inferior mostra `U_L →S U_M →R U_R`. Deve mostrar duas rarefações, coerentes com a cadeia selecionada. |
| Média | Expressão física ausente com justificativa incorreta | Abrir Físico para RR. O painel afirma que estados/velocidades são insuficientes ou não ordenados, apesar dos dois leques ordenados e dos perfis desenhados. Deve representar os cinco trechos de RR ou declarar a limitação específica do gerador de expressões. |
| Média | Diagnóstico sobreposto e cortado no painel lateral | Em Estados → Inspeção → Informações e diagnósticos adicionais → Construção e verificação das cadeias, o cabeçalho sobrepõe título e texto. A rolagem tentada sobre o painel não expõe o diagnóstico RR inferior no viewport testado, embora o texto exista na acessibilidade. O conteúdo deve ficar legível e acessível por rolagem. |
| Média | Ajuste da janela não enquadra a cadeia completa | Com `b20=1`, selecionar RR e acionar “Ajustar à geometria”. O estado intermediário de ordenada `-0.15866` e parte final do arco ficam abaixo da área visível. O ajuste deve incluir os arcos e o estado intermediário da cadeia selecionada. |

As mensagens de não certificação entrópica permaneceram visíveis. O console
capturado não apresentou erro de execução; houve um aviso de depreciação de
`THREE.Clock`, sem atribuí-lo ao corretor RR.

As capturas locais estão em `.cache/gwml-t02-visual/`: `state-rr.png`,
`state-rr-b20-1.png`, `physical-rr.png`, `diagnostic-layout.png`,
`parameters-restored.png` e `physical-stale.png`. São evidências de trabalho
locais, sem inclusão obrigatória no Git. A sessão terminou na vista física do
caso `b20=0.5`, com dados positivos e `t=0.5`, após visitar Estados para atualizar
o candidato. Não foram reexecutados lint/test/build, pois somente este registro
e o status documental foram alterados nesta inspeção. A GWML-T03 não foi iniciada.

### Correções e segunda inspeção visual — 26/10/2026

Os cinco achados acima foram corrigidos e seus caminhos de reprodução foram
repetidos no mesmo navegador e viewport. A primeira inspeção permanece como
registro histórico; a conclusão atual é aprovação dos cinco cenários visuais
delimitados, sem declaração de cobertura global ou certificação entrópica.

1. **Candidato de outro fluxo:** `App.jsx` associa o conjunto publicado de
   candidatos aos dados da construção (`p`, estados de Riemann, intervalo de tau
   e estado fixado). Dados diferentes invalidam o conjunto durante a renderização,
   sem aguardar um efeito ou uma visita ao plano. `PhysicalSpaceDialog.jsx` oculta
   os perfis anteriores e mostra a ação “Atualizar cadeias em Estados”. Não foi
   introduzida recomputação automática do solver no ambiente físico. Na repetição
   `b20=1 → Parâmetros → b20=0.5 → Físico`, o candidato antigo não apareceu.
   O botão de recuperação levou a Estados e o candidato atualizado mostrou
   `v_M=-0.077242`, substituindo `-0.15866`.
2. **Legenda RR:** a cadeia selecionada é representada por
   `U_L →R_1 U_M →R_2 U_R`; o rótulo S–R foi eliminado para RR.
3. **Expressão física:** `PhysicalSolutionExpressions.jsx` passou a representar
   os cinco trechos: estado esquerdo, primeiro leque, patamar intermediário,
   segundo leque e estado direito. Os intervalos são derivados dos dois leques;
   velocidades não finitas, inversões internas ou sobreposição de leques continuam
   impedindo a apresentação da fórmula. R1 e R2 são perfis numéricos, sem fórmula
   fechada ou nova afirmação de admissibilidade.
4. **Painel de diagnóstico:** a região de inspeção recebeu a mesma superfície
   de rolagem dos demais painéis, com altura limitada à célula da janela. O
   conteúdo interno pode crescer e o cabeçalho científico deixa de herdar o layout
   horizontal do cabeçalho principal. Título e texto ficaram separados; a rolagem
   alcançou o relatório RR legível. Na observação do DOM, a região tinha altura
   de 818 px para conteúdo de 4561 px e efetivamente alterou sua posição de rolagem.
5. **Enquadramento:** “Ajustar à geometria” inclui todos os estados e pontos dos
   leques da cadeia selecionada, sem aplicar a eles o recorte por quantis usado
   para a geometria de fundo. No caso `b20=1`, o arco completo e o estado
   `U_M=(0.5,-0.15866)` passaram a ficar dentro da janela.

A vista física foi novamente inspecionada em `t=0.25,0.5,1`, com atualização
dos perfis e preservação dos dois leques e do patamar. A sessão terminou no caso
`b20=0.5`, em `t=0.5`. As evidências adicionais locais estão na mesma pasta:
`state-rr-fixed.png`, `physical-rr-fixed.png`, `physical-invalidation-fixed.png`
e `diagnostic-layout-fixed.png`.

`stateSpaceChainsRendering.test.js` ganhou regressões para a legenda RR,
presença dos dois leques na expressão, rejeição de velocidades fora de ordem
e ocultação de candidatos invalidados com ação de recuperação. A verificação
da invalidação entre ambientes, rolagem e enquadramento foi também interativa,
sem confundi-la com uma prova científica. `npm run lint`, `npm run test`
(812 testes, zero falhas) e `npm run build` passaram após as correções.
O aviso preexistente de tamanho do bundle permanece.

Arquivos destas correções: `src/App.jsx`,
`src/components/PhysicalSpaceDialog.jsx`,
`src/components/PhysicalSolutionExpressions.jsx`,
`src/components/StateSpaceDialog.jsx`, `src/styles/workspace-layout.css`,
`src/styles/workspace-panel-content.css`, `tests/stateSpaceChainsRendering.test.js`
e os dois registros documentais da T02. O corretor e suas tolerâncias não foram
alterados nesta etapa. Não foram criados branch ou PR nem iniciada a GWML-T03.

### Revisão complementar — 27/10/2026

Foi confirmado um defeito: a rejeição dos leques poligonais antes do Newton
eliminava sementes recuperáveis das curvas características reintegradas. Essa
verificação passou a produzir `sampled-fan-warning`, sem veto antecipado. A
aceitação continua exigindo correção dentro dos intervalos dos ramos, verificações
dos leques reconstruídos e ordenação das velocidades. Não se ampliou a busca
para ramos não fornecidos nem se demonstrou completude.

Para evitar aceitar dados de ramo inconsistentes, o corretor compara os vértices
fornecidos com a reintegração nos respectivos parâmetros, cobrindo o prefixo
corrigido e o segmento da semente. `sourceBranchTolerance=2e-4` limita o desvio
por `tolerância*(1+norma do vértice)`. A incompatibilidade é inconclusiva, e falha
de integração tem diagnóstico próprio. É uma verificação numérica amostrada,
sem certificação contínua. Ramos legados sem parâmetros usam comprimentos de
cordas; sua subestimação do arco pode tornar dados grosseiros inconclusivos.
Esse limite não deve ser interpretado como inexistência da interseção.

Reprodução: `node scripts/audit-rr-convergence.js --supplemental`.
O fluxo é `F=(u²/2, k*u²+v²/2+2v)`, com estados `(0,0)` e `(0.5,0.5)`.
Os ramos são integrados inicialmente com passo 0.0025 e decimados preservando
os parâmetros de arco. A referência usa uma EDO independente parametrizada por u.

| k | Espaçamento da amostragem | Candidatos antes → depois | Resíduo de fechamento | Erro de U_M |
| --- | --- | --- | --- | --- |
| 0.5 | 1 | 0 → 1 | 1.22534e-15 | 7.65062e-12 |
| 0.5 | 0.4 | 0 → 1 | 1.71020e-11 | 3.72004e-12 |
| 1 | 1 | 0 → 1 | 5.82867e-16 | 4.97716e-12 |

Os parâmetros corrigidos permanecem em `[0,1]` nos três casos. Uma regressão
adicional usa `F_1=u²/2+0.1v²`, com ambas as curvas curvas, e interseção
manufaturada `(0.4,-0.1)`; o erro fica abaixo de 1e-9. Entradas com vértices
inconsistentes e orientação invertida não geram candidatos nesses testes.

Para extremos reintegrados A e B e `rho=norma(A-B)`, mantém-se
`U_M=(A+B)/2`. Em aritmética real, cada deslocamento tem norma `rho/2`, a
menor distância máxima possível aos dois extremos. Isso não limita o erro
até a interseção exata. O diagnóstico `junction` registra extremos,
deslocamentos, `halfResidual`, velocidades nos extremos e na média, e suas
diferenças assinadas. `roundoffAllowance` é uma margem prática de arredondamento,
sem certificado rigoroso. O orçamento absoluto opcional `joinStateTolerance`
(padrão `null`, desativado) limita o deslocamento da junção separadamente da
tolerância relativa de fechamento e da tolerância de agrupamento de candidatos.
Se excedido, o resultado é inconclusivo; não há iterações adicionais automáticas.

Para k=0.5 e espaçamento 0.2:

| Tolerância de fechamento | Resíduo | Maior deslocamento até a média | Erro de U_M | Diferença amostrada do perfil |
| --- | --- | --- | --- | --- |
| 1e-10 (padrão) | 5.31282e-14 | 2.65798e-14 | 7.62002e-12 | 2.81165e-14 |
| 1e-4 (ensaio de tolerância relaxada) | 9.89105e-7 | 4.94552e-7 | 6.04732e-7 | 5.23396e-7 |

As mudanças assinadas das velocidades são `(8.77076e-15,-2.50910e-14)`
e `(1.64378e-7,-4.66435e-7)`, respectivamente. A comparação do perfil usa
10009 valores de xi (malha e fronteiras) contra uma reconstrução auxiliar com
A e B separados. Essa referência auxiliar não é uma solução RR fechada.
O resultado mede o efeito numérico da junção e da reinterpolação por velocidade;
não é erro contra solução exata, supremo contínuo nem limite por `rho/2`.
No padrão, o erro de integração domina o deslocamento até a média.

O estudo original foi repetido com passos de amostragem 0.08, 0.04 e 0.02,
e integração 0.08, 0.04, 0.02 e 0.01 (24 combinações). Para amostragem 0.08,
o erro de U_M diminui de 2.19834e-8 para 7.65094e-12 em k=0.5 e de
1.46031e-8 para 5.00108e-12 em k=1. Os resíduos correspondentes variam de
6.94e-17 a 6.33e-16 e de 2.77e-14 a 2.80e-14. A estabilidade frente à
amostragem nesses exemplos não prova independência global da geração de sementes.

Validação: `npm run lint`, `npm run test` (817 testes, zero falhas) e
`npm run build` passaram; permanece o aviso preexistente de tamanho do bundle.
Os cinco testes novos cobrem sementes grosseiras, duas curvas não retilíneas,
junção/perfil, orçamento absoluto e inconsistência dos ramos. A renderização
automatizada distingue ressalvas poligonais de rejeições. Não houve nova inspeção
visual interativa nesta revisão. A T02 pode ser encerrada no escopo numérico
delimitado: permanecem busca local dependente de sementes, erros de integração
e interpolação sem estimativa rigorosa e verificações amostradas, sem prova
contínua de monotonicidade, completude global ou certificação entrópica.
A GWML-T03 não foi iniciada.
