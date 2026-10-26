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
