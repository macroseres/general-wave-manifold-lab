# Situação do espaço de estados — 27/10/2026

## Fluxo interativo tradicional — integração de 27/10/2026

A Entrega 1 foi aprovada pelo responsável. A Entrega 2 integra os construtores existentes à ação explícita de construção, com arcos de choque separados das Hugoniot projetadas por π, conforme orientação do responsável. O encerramento histórico T01–T08 permanece delimitado e não é usado como prova de uma interface completa.

**Como usar:** em Parâmetros, defina os dez coeficientes. Em Estados, use **Posicionar no gráfico** para U_L e U_R, clique no plano e ajuste por arrasto ou coordenadas. Escolha **Construir candidatos**, selecione uma cadeia em **Cadeias** e use **Ajustar à geometria**. O painel lista ondas, famílias, estados, velocidades, resíduos RH, junções sônicas e critérios retornados pelo construtor. Quando houver mais de um resultado, **Comparar com** permite inspecionar outra cadeia. **Diagnósticos das buscas e limites** permanece disponível mesmo sem candidatos.

**Camadas independentes:** o desenho da cadeia usa os segmentos do candidato; os arcos de choque são reconstruídos pela continuação característica RH já existente, com validação numérica do extremo e da tangente. Mostram-se os dois choques de SS simultaneamente, além dos saltos internos de K. Essa camada tem controle de visibilidade próprio e não depende da projeção π selecionada nem da visibilidade das Hugoniot da variedade. As Hugoniot projetadas mantêm sua associação por π e os controles anteriores. Um arco não conectado pela continuação é identificado como inconclusivo: seus extremos são assinalados sem inventar uma corda como arco.

**Construção e atualização:** resultados só ficam disponíveis após a solicitação. Mudanças nos coeficientes ou estados invalidam a construção e a seleção anteriores; é preciso reconstruir. Zoom, pan, projeção, U* e controles de visibilidade não alteram os dados do problema nem invalidam seus candidatos. A seleção continua compartilhada com o espaço físico. O enquadramento inclui todos os leques, arcos e junções internos da cadeia.

**Busca:** `stateConstructionSearch.js` reutiliza RR, SS, RS/SR, contatos e compostas; expõe os relatórios existentes e isola falhas por grupo. Além das sementes das curvas projetadas, `stateShockBranches.js` reutiliza a continuação RH para fornecer ramos no espaço de estados, incluindo fluxos em que a carta regular não fornece curvas úteis. São até 240 passos por sentido e família, passo de 0,025 vezes a escala dos estados e raio máximo de duas vezes essa escala; as paradas são apresentadas no painel. Esses limites não são uma prova de completude. Contatos e compostas ainda não fornecem relatórios individuais de todas as tentativas; a interface declara essa limitação.

**Limitações científicas:** mantidos os 13 padrões com exemplos quadráticos positivos documentados, sem promover CK/KC/KK a padrões validados. Contatos continuam restritos à direção e velocidade constantes; K lenta usa R–S e K rápida S–R. Compatibilidade com testes necessários, violações amostradas e admissibilidade entrópica inconclusiva são apresentadas separadamente. A geometria amostrada não certifica unicidade de ramo, monotonicidade contínua, Liu global, entropia ou cinética.

**Verificação de integração:** `npm run check` passou com lint sem avisos, 837 testes aprovados e build; permanece o aviso preexistente de tamanho do bundle. As regressões novas cobrem a solicitação explícita, entradas ausentes, RR/RS/SR/SS sem curvas projetadas, conservação das amostras de choque, fechamento dos segmentos, junção sônica de KR, pontos necessários ao enquadramento e contatos separados. A renderização real do componente verifica KR com arco de choque e junção sônica, além de ausência de cadeia antes da solicitação. A inspeção interativa no navegador foi realizada para SS, RR, CC e KR, conforme os casos e evidências abaixo. Essa verificação de integração não amplia a validação matemática global.

**Inspeção gráfica reproduzível:**

| Caso | Fluxo e estados | Resultado observado | Evidência |
|---|---|---|---|
| SS | F=(u²/2, v²/2+5v), U_L=(2,2), U_R=(0,0) | U_M≈(0,2), dois arcos de choque simultâneos, velocidades 1 e 6, resíduos RH compatíveis | [SS independente](evidence/state-construction/ss-independent.png) |
| RR | Mesmo fluxo, U_L=(0,0), U_R=(2,2) | U_M≈(2,0), dois arcos separados, leques de velocidades [0,2] e [5,7], legenda R1–R2 | [RR](evidence/state-construction/rr-fans.png) |
| CC | F=(u,2v), U_L=(0,0), U_R=(1,1) | U_M=(1,0), dois contatos roxos, famílias 1/2, velocidades 1/2, resíduos RH nulos | [CC](evidence/state-construction/cc-contacts.png) |
| KR | `oldWavePreset({B2:0})`, U_L=(0.9776785705503095,-1.1634795636533988), U_R=(1.1608741742799409,1.0366448287612047) | Dois leques e arco de choque, junção sônica ≈(0.99994,-0.999948), U_M≈(0.999946,0.999896); construção inteira enquadrada | [KR](evidence/state-construction/kr-sonic.png) |

Em SS, a troca π₊→π₋ preservou exatamente os atributos SVG `d` dos dois arcos; as Hugoniot projetadas estavam ocultas. O posicionamento por botão e clique foi verificado, e o arrasto alterou U_L de (2,2) para aproximadamente (1.8791545667,1.8978932234), invalidando a cadeia. O espaço físico deixou de exibir o perfil antigo e ofereceu reconstrução em Estados. A alteração dos coeficientes também invalidou a realização física. Ao navegar entre Estados e Físico sem mudar o problema, a cadeia KR permaneceu selecionada e o diagrama físico utilizou o mesmo salto e os dois leques.

Os marcadores de possíveis perdas de não linearidade genuína agora têm controle próprio em **Rarefações → Eventos infinitesimais**, inicialmente oculto. Em campos linearmente degenerados, esses eventos podem preencher toda a curva; ocultá-los não remove seus diagnósticos matemáticos. As capturas registram a inspeção, não certificação científica. Não foi feita inspeção manual de todos os 13 padrões nem de um problema com múltiplos candidatos; o controle de comparação está integrado aos mesmos dados de segmentos. Permanece uma limitação preexistente fora do desenho nos estados: o painel de expressões físicas ainda não fornece expressão por trechos para KR, embora o diagrama e os perfis amostrados sejam exibidos. Não foi acrescentada funcionalidade na Variedade de Ondas.


## Resultado da inspeção

O laboratório já possuía curvas integrais nos estados, candidatos de dois choques, cadeias mistas rarefação–choque e choque–rarefação, testes de RH, Lax estrito de extremos, evidências finitas de Liu e perfis físicos amostrados. Parte das curvas de choque ainda é obtida por projeções e cartas da variedade; isso não constitui uma implementação inteiramente independente da camada topológica.

A documentação tradicional permite ampliar o núcleo por casos delimitados. Não é necessário concluir uma classificação global para iniciar a implementação. Os requisitos de cada construtor e os resultados ainda inconclusivos devem permanecer explícitos.

## Implementado nesta etapa

**Nove interiores de salto.** `src/math/state/shockConfiguration.js` classifica os dois espectros em relação à velocidade, informa as características incidentes e separa igualdades sônicas, coincidência e dados inválidos. Os nove exemplos quadráticos de RH da referência são conferidos contra o classificador de produção. O diagnóstico direto e a janela de regiões espectrais exibem a configuração; ela não certifica seleção física.

**Correção de Lax nas fronteiras.** `laxClass2x2` passa a exigir espectros completos, gap de hiperbolicidade e distância às velocidades características conforme tolerância. Contagens isoladas ou rótulos de posição sem os autovalores não bastam. As fronteiras deixam de receber um rótulo estrito de Lax. O comportamento é compartilhado pela geometria que usa essa rotina.

**RR numérico.** `src/math/solution/rarefactionPairCandidates.js` usa interseções poligonais como sementes e corrige a interseção das curvas lenta a partir de U_L e rápida retrospectiva a partir de U_R por reintegração e Newton amortecido. Verifica ancoragem, hiperbolicidade nas amostras, crescimento estrito amostrado, compatibilidade aproximada de tangentes e separação das velocidades. Reconstrói os dois leques e registra estado intermediário, proveniência, resíduo, condicionamento e relatório de busca limitada.

Os candidatos RR são selecionáveis no espaço de estados e compartilhados com o espaço físico. O desenho nos estados usa os dois arcos, e o físico representa dois leques sem inventar choques ou resíduos de RH. A avaliação de W(ξ) interpola cada leque separadamente e mantém o patamar intermediário.

## Disponibilidade por grupo de padrões

| Grupo | Situação atual |
|---|---|
| RR | Corretor conjunto sobre curvas reintegradas, convergência em casos curvos e diagnósticos de busca; integrado às vistas de estados e física |
| RS, SR, SS | Candidatos e perfis existentes, com verificações necessárias e limitações documentadas |
| RC, SC, CR, CS, CC | Construtor de contatos com direção e velocidade constantes; perfis e seleção compartilhados nas vistas |
| RK, SK, KR, KS | Busca local com blocos K orientados e casos quadráticos verificados; perfis compartilhados |
| CK, KC, KK | Entradas da busca de blocos K implementadas, sem casos positivos validados nesta etapa |
| Seleção não clássica | Modelo de difusão–dispersão escolhido; coeficientes e cinética específica ainda por determinar |

## Limitações e sequência

RR possui corretor conjunto das duas curvas reintegradas, com parâmetros restritos aos ramos fornecidos. Tangência e monotonicidade são verificadas em amostras; não há prova contínua de rarefação nem certificação entrópica geral. O relatório distingue falhas numéricas, tentativas inconclusivas e nenhum candidato encontrado; nenhuma dessas situações demonstra inexistência. Contatos e ondas de amplitude zero não são classificados como leques RR.

O corretor conjunto e os estudos de convergência de RR foram entregues na GWML-T02. Permanecem refinamento e convergência de RC/CR, contatos de direção variável e ampliação da normalização de segmentos e junções. Blocos K já possuem a cobertura delimitada descrita abaixo. O resíduo recíproco registrado em `architecture/TRACEABILITY.md` foi corrigido na terceira etapa. Estas pendências não definem nem iniciam a GWML-T03.

## Segunda etapa: contatos tradicionais

RC, SC, CR, CS e CC estão implementados no escopo de [contatos de direção constante](traditional/CONTATOS_DIRECAO_CONSTANTE.md). O critério é verificado nos coeficientes, não apenas pela igualdade de velocidades nos extremos. SC e CS têm uma equação afim de RH sobre a reta de contato e podem ser construídos sem curvas da variedade. Os contatos têm traços próprios e são mostrados separadamente dos choques nos perfis. A vista de estados também deixou de exigir um ponto regular da variedade para abrir.

Não há busca completa para todos os campos linearmente degenerados. Direções variáveis, amplitudes nulas e incidências não isoladas ainda exigem ampliação. RC/CR usam interseções e verificações amostradas; nenhum novo padrão recebe certificação entrópica geral.

Verificação da segunda etapa: lint, 768 testes e build passaram. A renderização automatizada inclui os contatos no espaço físico e CC no plano de estados sem carta regular. Não foi feita inspeção visual interativa no navegador nesta etapa.

## Terceira etapa: blocos compostos

A [construção de K nos estados](traditional/COMPOSTAS_NO_ESPACO_DE_ESTADOS.md) calcula parceiros sônicos pela equação quadrática de RH e conecta blocos por interseções refinadas localmente. K lento usa R–S e K rápido usa S–R. RK/KR/SK/KS têm casos quadráticos verificados; CK/KC/KK não recebem a mesma declaração de validação. Não há cobertura global nem certificação de Liu, entropia ou cinética.

O falso resíduo recíproco na fronteira foi corrigido e ganhou teste de regressão. Permanecem direções de contato variáveis, compostas de outras orientações e maior número de segmentos, junções entre blocos com margem zero, ramos não isolados e ampliação das fixtures de CK/KC/KK.

Verificação da terceira etapa: lint, 775 testes e build passaram. A renderização automatizada seleciona KR na vista real de estados e verifica os dois leques do componente físico. Não foi declarada inspeção visual interativa no navegador nem validação científica dos três padrões ainda sem caso positivo.

Os testes desta etapa incluem os nove tipos de salto, rejeição de fronteiras/coincidência, um caso RR triangular exato, ramos obtidos pelo integrador, exemplos negativos, comparação/agrupamento e renderização do componente físico. A renderização automatizada não equivale a inspeção visual interativa no navegador.

Verificação concluída: lint, 760 testes e build passaram. O build mantém o aviso preexistente de tamanho do pacote JavaScript. Não foi declarada inspeção visual interativa nesta etapa.


## GWML-T02 — corretor conjunto RR (integração das revisões, 26/10/2026)

Implementação em `src/math/solution/rarefactionJointCorrector.js`. As interseções de poligonais fornecem sementes; as duas curvas características são reintegradas a partir de seus estados âncora e a diferença vetorial é corrigida por Newton amortecido. A busca permanece restrita aos intervalos paramétricos dos ramos investigados, sem exigir permanência no segmento poligonal da semente. O construtor RR registra resíduo, parâmetros e condicionamento, e reconstrói os leques a partir das curvas reintegradas. As funções públicas da revisão paralela foram preservadas como entradas compatíveis para a implementação validada.

**Estado:** os estudos de convergência e exemplos curvos estão implementados e documentados em [Ordenação e corretor RR](architecture/RIEMANN_MONOTONE_RAREFACTIONS.md). A reintegração emprega RK4 com passo limitado, sem estimativa rigorosa do erro global. O perfil físico interpola as curvas reintegradas amostradas. Monotonicidade e hiperbolicidade permanecem verificações amostradas, sem certificação entrópica nem completude global. Na integração das revisões, lint, 807 testes (zero falhas) e build passaram; permanece o aviso de tamanho do bundle. A T02 está numericamente validada no escopo descrito, sem iniciar a T03.

**Fechamento dos diagnósticos da T02:** `searchRarefactionPairs` preserva motivos
por tentativa e condições de parada dos ramos, distingue falha numérica de
resultado inconclusivo e de nenhum candidato encontrado, e registra a parada
por limite de candidatos com os pares/sementes não examinados. O painel do
espaço de estados mostra o resumo e os motivos. O contrato das 16 cadeias e a
rastreabilidade foram atualizados. Nesta revisão, lint, 812 testes (zero falhas)
e build passaram; o aviso de tamanho do bundle permanece. A verificação da
interface foi por renderização automatizada, sem inspeção manual no navegador.

**Inspeção visual posterior:** a sessão interativa de 26/10/2026 reproduziu
os dois casos RR curvos e a atualização temporal dos perfis, mas não aprovou
integralmente a interface. Permanecem cinco achados: candidato físico desatualizado
ao mudar o fluxo sem visitar Estados, legenda RR exibida como S–R, expressão
por trechos ausente com mensagem inadequada, diagnóstico lateral sobreposto/cortado
e enquadramento incompleto da cadeia no segundo caso. Os passos de reprodução
e as evidências estão no [relatório RR](architecture/RIEMANN_MONOTONE_RAREFACTIONS.md).
O núcleo numérico mantém a validação delimitada já registrada; o fechamento
visual requer correção e nova inspeção desses achados. Nenhum código foi
modificado durante a inspeção, e a T03 não foi iniciada.

**Correções e reinspeção visual:** os cinco achados foram corrigidos e
reverificados no navegador. Ao mudar os dados, candidatos anteriores são
invalidados e a vista física oferece atualização em Estados; a legenda RR
mostra R1–R2; a expressão contém os cinco trechos; o diagnóstico fica legível
e acessível por rolagem; o ajuste da janela inclui a cadeia selecionada completa.
Os cenários com `b20=0.5` e `1` e os tempos `0.25,0.5,1` foram inspecionados.
Lint, 812 testes (zero falhas) e build passaram. As capturas e as limitações
estão no relatório RR. A aprovação visual é restrita aos cenários descritos;
não acrescenta certificação entrópica nem completude global. A T03 permanece
fora do trabalho realizado.

**Revisão complementar de 27/10/2026:** corrigida a rejeição antecipada de
sementes por verificações poligonais: essas falhas são ressalvas, e a decisão
usa a correção e os leques reintegrados. Três casos curvos antes descartados
passam a retornar um candidato, com resíduos entre 5.83e-16 e 1.71e-11 e erros
de U_M entre 3.72e-12 e 7.65e-12. A consistência dos vértices dos ramos com a
reintegração continua verificada numericamente; incompatibilidade é inconclusiva.
A média dos extremos foi preservada e recebeu diagnósticos de deslocamento e
velocidade, além de orçamento absoluto opcional. Metade do resíduo mede o
deslocamento até a média, não o erro até a interseção nem o erro do perfil.
O estudo original de 24 combinações foi reproduzido. Lint, 817 testes e build
passaram, com o aviso preexistente de tamanho do bundle. Métodos, tabelas,
limitações e reprodução estão no relatório RR acima. A T02 está validada para
encerramento em seu escopo numérico delimitado, sem completude global ou
certificação entrópica. Nenhuma outra família foi alterada; a T03 não foi iniciada.


## GWML-T03 — implementação inicial das cadeias clássicas (27/10/2026)

Escopo aprovado: RS, SR e SS no espaço de estados; RR permanece como referência da T02.

- SS: `refineTwoShockMiddle` resolve localmente as quatro componentes de Rankine–Hugoniot em `(u_M,v_M,s_1,s_2)`, por Newton amortecido e limite de deslocamento a partir da interseção poligonal. `twoShockCandidates` mantém candidatos geométricos para diagnóstico, mas a seleção do perfil físico exige `refinement.status === 'refined-candidate'`. O corretor não garante preservação de ramo global, unicidade nem completude.
- RS/SR: `mixedSelfSimilarCandidate` reintegra o prefixo da curva característica desde a âncora, verificando a compatibilidade numérica dos vértices com o ramo fornecido. A junção continua proveniente do corretor misto local; ainda não há corretor conjunto ancorado equivalente ao RR nem estimativa rigorosa do erro de integração.
- Busca: `searchTwoShockCandidates` e `searchMixedWaveCandidates` devolvem candidatos e relatórios de interseções amostradas, correções, rejeições e limite de busca. Ausência de candidato não prova inexistência. Os relatórios estão disponíveis na camada matemática; sua exposição integral na interface ainda não foi implementada.
- Regressões: adicionados testes para correção SS, dados inválidos, diagnósticos e reconstrução do leque. A execução **CI #23**, referente ao commit `058c2d3`, foi informada como concluída com sucesso na branch `main`, após corrigir a compatibilidade do retorno de `twoShockCandidates`. O workflow executa lint, testes e build por `npm run check`. A contagem detalhada do CI #23 não foi conferida diretamente neste registro; a execução anterior #21 apresentou 825 testes aprovados e um teste reprovado, posteriormente corrigido.

**Encerramento formal GWML-T03 — 27/10/2026:** autorizado pelo responsável pelo projeto e registrado na documentação. As quatro entregas aprovadas (corretor conjunto SS, reconstrução RS/SR, diagnósticos de busca e validação automatizada) ficam encerradas **no escopo numérico delimitado**. A aprovação do CI não constitui demonstração de completude global, unicidade, certificação entrópica geral ou admissibilidade física em todos os regimes. Permanecem limitações explícitas: buscas por interseções amostradas podem perder soluções, o corretor SS é local, RS/SR não possuem certificado global de integração, e a interface ainda não expõe integralmente os relatórios de busca. Essas limitações não são incorporadas retroativamente ao escopo encerrado. Nenhuma tarefa posterior é iniciada por este registro.


## GWML-T04 — contatos de direção e velocidade constantes (27/10/2026)

**Autorização:** início da GWML-T04 conforme o plano finito T01–T08 de `ROADMAP.md`. A T05 não foi iniciada.

**Escopo fechado:** RC, SC, CR, CS e CC apenas no modelo de contato com autovetor e autovalor constantes. O construtor preexistente é `src/math/solution/contactChainCandidates.js`; sua fundamentação está em `traditional/CONTATOS_DIRECAO_CONSTANTE.md`. Contatos de direção variável e certificação entrópica geral não pertencem à T04.

**Primeira entrega:** commit `766c498`, com regressões conjuntas em `tests/contactChainCandidates.test.js` para os cinco padrões, conferindo estados de entrada/saída, estado intermediário, ordenação estrita das velocidades, verificação de cada contato pelo modelo nos coeficientes, conservação numérica e indicação explícita de ausência de certificação entrópica/completude. Acrescentado caso negativo para fluxo quadrático sem direção de contato constante.

**Validação:** captura do GitHub Actions apresentada pelo responsável em 27/10/2026 confirma **CI #26 aprovado** para o commit `766c498` (regressões dos cinco padrões) e **CI #27 aprovado** para o commit `0d66684` (registro documental), ambos em `main`. O pipeline passou; não se reivindica prova matemática global nem completude dos contatos.

**Encerramento GWML-T04 — 27/10/2026:** os cinco padrões RC, SC, CR, CS e CC possuem fixtures reproduzíveis no modelo restrito de direção e velocidade constantes, testes de fechamento, ordenação, conservação e rejeição de casos fora do modelo. **Estado: encerrada no escopo aprovado.** Permanecem fora deste marco contatos de direção variável, certificação entrópica geral e cobertura global. Nenhuma tarefa posterior foi iniciada.


## GWML-T05 — consolidação das cadeias com compostas (27/10/2026)

**Autorização:** iniciar a T05 do plano finito GWML-T01–T08. Não iniciar a T06 antes de concluir e registrar a T05.

**Escopo:** RK, KR, SK, KS, CK, KC e KK, com as orientações atualmente suportadas pelo construtor `src/math/solution/compositeBlockChainCandidates.js`: K lenta à esquerda como rarefação–choque e K rápida à direita como choque–rarefação. O algoritmo opera sobre estados e curvas amostradas, com interseções corrigidas localmente e verificação das equações de parceiros sônicos. A busca é limitada e não certifica completude.

**Disponibilidade observada antes desta tarefa:** RK/KR e SK/KS possuem fixtures quadráticas positivas em `tests/compositeBlockChainCandidates.test.js`; CK/KC/KK têm entradas implementadas, mas **nenhuma fixture quadrática positiva validada**. Não transformar ausência de exemplo em inexistência matemática nem considerar uma entrada implementada automaticamente validada.

**Primeira entrega:** commit `03c6adc` acrescenta regressões para KR (estados e junção sônica explícitos, RH do salto interno, ordenação das velocidades, distinção de Liu e ausência de certificação entrópica) e para o catálogo finito de sete padrões com blocos K e busca limitada. Preservados os testes existentes de RK, KR, SK, KS e casos negativos.

**Falha e correção CI (27/10/2026):** CI #29 e #30 falharam com 829/830 testes aprovados. O log do job #122446913467 identifica a falha no teste novo `T05: KR composite has an explicit sonic junction...` (`tests/compositeBlockChainCandidates.test.js:97`): comparação exata `deepStrictEqual` de estados intermediários corrigidos numericamente, que diferem na ordem de 1e-13. Commit `0478f17` substitui **somente essa asserção** por comparação componente a componente com tolerância de 1e-6, já utilizada na suíte, sem alterar o algoritmo matemático. A validação do novo commit permanece pendente.

**Estado:** **em execução, validação CI pendente após correção**. O encerramento exige confirmar os testes, registrar a disponibilidade e as limitações dos sete padrões e manter explícita a distinção entre conservação, teste sônico não estrito e admissibilidade física. Não há obrigação de produzir fixtures positivas artificiais para CK/KC/KK.


**Complemento de correção T05 — 27/10/2026:** CI #31 e #32 também falharam com 829/830 testes. Logs dos jobs #122448504915 e #122448568530 mostram que a primeira comparação foi corrigida, mas havia **segunda comparação exata** no mesmo teste, agora na linha 97 (entrada do leque final versus estado intermediário), com diferenças da ordem de 1e-13. Commit `84dcb68` aplica a mesma tolerância numérica já usada no teste a essa segunda interface. Nenhum código de produção foi modificado. **Aguardar novo CI antes de encerrar T05.**


**Encerramento formal GWML-T05 — 27/10/2026:** captura do GitHub Actions fornecida pelo responsável confirma **CI #33 aprovado** para o commit `84dcb68` e **CI #34 aprovado** para o commit `b604ecf`, ambos na branch `main`. O escopo fechado da T05 é a validação numérica delimitada das sete entradas RK, KR, SK, KS, CK, KC e KK, com regressões positivas existentes para RK/KR/SK/KS, verificação adicional da junção KR e registros de disponibilidade para CK/KC/KK **sem fixtures positivas validadas**. Não há demonstração de existência para todas as entradas, completude da busca, seleção entrópica global ou cinética específica. **Estado: T05 encerrada no escopo aprovado; T06 não iniciada.**


## GWML-T06 — classificação e admissibilidade (27/10/2026)

**Autorização:** início da T06 no plano fechado T01–T08. A T07 não foi iniciada.

**Primeira entrega:** commit `bf9f681` acrescenta regressão às nove assinaturas espectrais de saltos com Rankine–Hugoniot, confrontando o diagnóstico direto com a classificação de Lax estrito de extremos. Apenas *one-shock* e *two-shock* correspondem às famílias Lax estritas no regime do exemplo; nenhum caso recebe certificação entrópica a partir da assinatura.

**Separação de critérios:** conservação (RH), configuração espectral, Lax estrito, Liu orientado, desigualdade de entropia com par compatível, perfil de regularização e relação cinética são evidências independentes. A ausência de modelo, arco completo ou perfil verificado exige `não avaliado`, não `aprovado`. Fronteiras sônicas e coincidências não pertencem aos nove interiores estritos.

**Validação da primeira entrega:** captura do GitHub Actions apresentada pelo responsável em 27/10/2026 confirma **CI #36 aprovado** para `bf9f681` e **CI #37 aprovado** para `33443f7`, ambos em `main`. A regressão dos nove interiores, RH e Lax passou; isso **não valida** Liu contínuo, desigualdades de entropia para pares especificados, existência de perfil viscoso ou relação cinética.

**Estado:** **em execução; primeira entrega validada pelo CI**. A T06 não está encerrada: falta consolidar a rastreabilidade dos diagnósticos de admissibilidade e os seus limites no escopo previsto. A T07 não foi iniciada.


**Consolidação final da GWML-T06 — 27/10/2026:** commit `1fe3dc8` acrescenta em `traditional/CADEIAS_E_ADMISSIBILIDADE.md` a matriz operacional dos oito canais de evidência (RH, configuração espectral, Lax estrito, Lax sônico fraco, Liu, entropia, perfil regularizado e cinética), estados de avaliação e limites. A regressão de nove assinaturas RH/Lax foi validada nos CI #36–37. Não foi implementado certificador universal de admissibilidade, pois Liu contínuo, pares de entropia, regularização e cinética requerem dados/hipóteses que o fluxo quadrático isolado não fixa.

**Validação final:** captura do GitHub Actions fornecida pelo responsável em 27/10/2026 confirma **CI #39 aprovado** (commit `1fe3dc8`) e **CI #40 aprovado** (commit `cb8fb92`), ambos em `main`. Somam-se aos CI #36–38 já aprovados. **Estado: GWML-T06 formalmente encerrada no escopo delimitado de diagnóstico e documentação.** A aprovação do pipeline não constitui certificação entrópica, Liu contínuo, perfil viscoso ou relação cinética geral. **A T07 não foi iniciada.**


## GWML-T07 — reconstrução no espaço físico (27/10/2026)

**Autorização:** T07 iniciada; T08 não iniciada.

**Escopo:** a mesma cadeia selecionada nos estados determina o perfil autossimilar `U(x,t)=W(x/t)`. `riemannSelfSimilarCandidate.js` avalia o candidato e `riemannCandidatePhysical.js` produz leques, traços de choques e contatos, raios e amostras. Compostas são desdobradas em segmentos elementares. A convenção no salto é o traço direito.

**Primeira entrega:** commit `3667c5d` acrescenta regressões KR com dois tempos, verificação de `x=s t`, traços do salto interno, dois leques, invariância autossimilar e rejeição de dados inconclusivos ou tempo inválido.

**Limites:** CK, KC e KK permanecem sem exemplos positivos quadráticos validados; não são reconstruídos artificialmente. Perfis amostrados não certificam admissibilidade entrópica.

**Validação e encerramento — 27/10/2026:** captura do GitHub Actions fornecida pelo responsável confirma **CI #42 aprovado** (commit `3667c5d`) e **CI #43 aprovado** (commit `d48e207`), ambos na branch `main`. A regressão de reconstrução KR, os traços de salto, a autossimilaridade e a rejeição de entradas inconclusivas passaram no pipeline. **Estado: GWML-T07 formalmente encerrada no escopo numérico aprovado.** Não há certificação geral de admissibilidade nem exemplos positivos validados para CK/KC/KK. **A T08 não foi iniciada.**


## GWML-T08 — auditoria integrada final (27/10/2026)

**Autorização:** última tarefa do conjunto fechado GWML-T01–T08; nenhuma T09 está prevista. Este relatório audita a **cobertura delimitada**, não reivindica um solver universal ou certificação de entropia.

### Matriz das 16 combinações

| Cadeia | Construção / exemplo quadrático | Reconstrução física | Evidência principal |
|---|---|---|---|
| RR | Exemplo positivo validado no escopo T02 | Candidato autossimilar com dois leques | `rarefactionPairCandidates.js`, `riemannSelfSimilarCandidate.js`; T02 |
| RS | Exemplo positivo validado no escopo T03 | Leque + salto | `riemannSelfSimilarCandidate.js`; T03 |
| RC | Positivo, contato de direção e velocidade constantes | Leque + contato | `contactChainCandidates.js`, `contactChainCandidates.test.js` |
| RK | Positivo quadrático em fixture | Leque + K desdobrada | `compositeBlockChainCandidates.js`, `compositeBlockChainCandidates.test.js` |
| SR | Exemplo positivo validado no escopo T03 | Salto + leque | `riemannSelfSimilarCandidate.js`; T03 |
| SS | Exemplo positivo validado no escopo T03 | Dois saltos e patamar | `riemannSelfSimilarCandidate.js`; T03 |
| SC | Positivo, contato constante | Salto + contato | `contactChainCandidates.test.js` |
| SK | Positivo quadrático em fixture | Salto + K desdobrada | `compositeBlockChainCandidates.test.js` |
| CR | Positivo, contato constante | Contato + leque | `contactChainCandidates.test.js` |
| CS | Positivo, contato constante | Contato + salto | `contactChainCandidates.test.js` |
| CC | Positivo, duas famílias linearmente degeneradas | Dois contatos | `contactChainCandidates.test.js` |
| CK | Entrada no construtor, **sem fixture quadrática positiva validada** | Não demonstrada | `compositeBlockChainCandidates.js`; T05 |
| KR | Positivo quadrático em fixture | K desdobrada + leque; traço interno testado | `compositeBlockChainCandidates.test.js`; T05/T07 |
| KS | Positivo quadrático em fixture | K desdobrada + salto | `compositeBlockChainCandidates.test.js` |
| KC | Entrada no construtor, **sem fixture quadrática positiva validada** | Não demonstrada | `compositeBlockChainCandidates.js`; T05 |
| KK | Entrada no construtor, **sem fixture quadrática positiva validada** | Não demonstrada | `compositeBlockChainCandidates.js`; T05 |

**Contagem:** 16 padrões especificados; 13 com casos positivos quadráticos documentados no escopo atual; 3 com entrada de construção, mas sem caso positivo quadrático validado. **Não** interpretar a contagem como cobertura de todos os dados iniciais, todos os fluxos ou todos os regimes. Em CK/KC/KK, não se pode afirmar existência nem inexistência a partir de buscas limitadas.

### Rastreabilidade por objetivo

1. **Espaço de estados:** definição e fechamento em `traditional/IMPLEMENTACAO_16_CADEIAS.md`; construtores R/S, `contactChainCandidates.js` e `compositeBlockChainCandidates.js`; regressões das tarefas T02–T05. Estados intermediários, ramos e segmentos internos das compostas são preservados nos candidatos suportados.
2. **Classificação e admissibilidade:** nove interiores e fronteiras em `traditional/CLASSIFICACAO_DOS_SALTOS.md`; `directShockDiagnostic.js`, `twoShockFamilyEvidence.js`, `shockConfiguration.js`; regressões `traditionalShockSignatures.test.js`; matriz dos oito canais em `traditional/CADEIAS_E_ADMISSIBILIDADE.md`. RH e Lax não certificam Liu, entropia, perfil viscoso ou cinética.
3. **Espaço físico:** `riemannSelfSimilarCandidate.js` e `riemannCandidatePhysical.js` derivam perfil `U(x,t)=W(x/t)`, raios, leques e traços **do mesmo candidato**. Regressões de contatos e compostas, incluindo KR em dois tempos, sustentam o escopo numérico. Perfis não são produzidos para candidatos inconclusivos.

### Limites e decisão de encerramento

Permanecem fora do escopo concluído: contatos de direção variável; validação positiva quadrática de CK/KC/KK; completude global, existência e unicidade para dados arbitrários; fluxos degenerados e regiões não hiperbólicas em geral; certificação contínua de Liu, pares entrópicos não especificados, perfis de difusão–dispersão sem coeficientes e relação cinética não definida. Fronteiras sônicas, velocidades coincidentes e amplitudes nulas exigem interpretação específica, não promoção automática a soluções físicas. A aprovação dos testes não constitui teorema.

**Histórico de CI confirmado pelo responsável:** T02–T07 concluídas em escopo delimitado; para T07, CI #42 e #43 verdes. **Validação da T08 e decisão final (27/10/2026):** captura do GitHub Actions apresentada pelo responsável confirma **CI #45 aprovado** (commit `5e88056`, matriz e auditoria) e **CI #46 aprovado** (commit `0ef9911`, alinhamento do ROADMAP), ambos na branch `main`. **GWML-T08 formalmente encerrada no escopo aprovado. FASE TRADICIONAL GWML-T01–T08 CONCLUÍDA (8/8).** Permanecem expressamente as limitações científicas e de cobertura descritas acima; nenhuma tarefa GWML-T09 é prevista. A investigação geométrica/topológica na Variedade de Ondas é fase distinta, sem autorização de implementação por este registro. Nenhuma nova tarefa GWML-T será criada para tratar limitações científicas externas ao escopo.
