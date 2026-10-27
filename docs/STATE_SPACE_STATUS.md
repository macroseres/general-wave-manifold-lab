# Situação do espaço de estados — 20/10/2026

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
- Regressões: adicionados testes para correção SS, dados inválidos, diagnósticos e reconstrução do leque. **Ainda não foram executados nesta sessão**: não declarar lint, testes ou build aprovados até execução real e revisão de eventuais falhas.

Estado da T03: **implementação preliminar no GitHub, validação pendente**. Não há certificação entrópica geral, completude global nem encerramento formal.
