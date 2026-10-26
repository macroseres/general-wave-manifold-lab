# Situação do espaço de estados — 20/10/2026

## Resultado da inspeção

O laboratório já possuía curvas integrais nos estados, candidatos de dois choques, cadeias mistas rarefação–choque e choque–rarefação, testes de RH, Lax estrito de extremos, evidências finitas de Liu e perfis físicos amostrados. Parte das curvas de choque ainda é obtida por projeções e cartas da variedade; isso não constitui uma implementação inteiramente independente da camada topológica.

A documentação tradicional permite ampliar o núcleo por casos delimitados. Não é necessário concluir uma classificação global para iniciar a implementação. Os requisitos de cada construtor e os resultados ainda inconclusivos devem permanecer explícitos.

## Implementado nesta etapa

**Nove interiores de salto.** `src/math/state/shockConfiguration.js` classifica os dois espectros em relação à velocidade, informa as características incidentes e separa igualdades sônicas, coincidência e dados inválidos. Os nove exemplos quadráticos de RH da referência são conferidos contra o classificador de produção. O diagnóstico direto e a janela de regiões espectrais exibem a configuração; ela não certifica seleção física.

**Correção de Lax nas fronteiras.** `laxClass2x2` passa a exigir espectros completos, gap de hiperbolicidade e distância às velocidades características conforme tolerância. Contagens isoladas ou rótulos de posição sem os autovalores não bastam. As fronteiras deixam de receber um rótulo estrito de Lax. O comportamento é compartilhado pela geometria que usa essa rotina.

**RR numérico.** `src/math/solution/rarefactionPairCandidates.js` procura interseções das curvas amostradas lenta a partir de U_L e rápida retrospectiva a partir de U_R. Verifica ancoragem, hiperbolicidade nas amostras, crescimento estrito amostrado, compatibilidade aproximada de tangentes e separação das velocidades. Constrói dois leques, estado intermediário, proveniência e relatório de busca limitada.

Os candidatos RR são selecionáveis no espaço de estados e compartilhados com o espaço físico. O desenho nos estados usa os dois arcos, e o físico representa dois leques sem inventar choques ou resíduos de RH. A avaliação de W(ξ) interpola cada leque separadamente e mantém o patamar intermediário.

## Disponibilidade por grupo de padrões

| Grupo | Situação atual |
|---|---|
| RR | Novo construtor numérico sobre ramos amostrados; integrado às vistas de estados e física |
| RS, SR, SS | Candidatos e perfis existentes, com verificações necessárias e limitações documentadas |
| RC, SC, CR, CS, CC | Construtor de contatos com direção e velocidade constantes; perfis e seleção compartilhados nas vistas |
| RK, SK, KR, KS | Busca local com blocos K orientados e casos quadráticos verificados; perfis compartilhados |
| CK, KC, KK | Entradas da busca de blocos K implementadas, sem casos positivos validados nesta etapa |
| Seleção não clássica | Modelo de difusão–dispersão escolhido; coeficientes e cinética específica ainda por determinar |

## Limitações e sequência

RR usa interseções de poligonais e não um corretor conjunto das duas EDOs. Tangência e monotonicidade são verificadas em amostras; não há prova contínua de rarefação nem certificação entrópica geral. Uma busca sem candidatos não demonstra inexistência. Contatos e ondas de amplitude zero não são classificados como leques RR.

Os próximos blocos são o corretor conjunto e estudos de convergência de RR/RC/CR, contatos de direção variável e normalização dos segmentos para compor blocos K. O resíduo recíproco registrado em `architecture/TRACEABILITY.md` foi corrigido na terceira etapa descrita abaixo.

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


## GWML-T02 — corretor conjunto RR (ramo de revisão, 26/10/2026)

Implementação preliminar em `src/math/solution/rarefactionJointCorrector.js`. As interseções de poligonais continuam fornecendo sementes, mas as duas curvas características são reintegradas a partir de seus estados âncora e a diferença vetorial é corrigida por Newton amortecido. A busca permanece restrita aos ramos e segmentos amostrados; resultados fora desses limites são rejeitados. O construtor RR registra o resíduo e os parâmetros do refinamento.

**Estado:** alteração submetida para revisão; ainda sem execução local de lint, testes ou build neste registro. A reintegração emprega RK4 com passo limitado, sem estimativa rigorosa do erro global. O perfil físico continua interpolando estados amostrados, não um perfil reintegrado de alta precisão. Monotonicidade e admissibilidade permanecem verificações amostradas, não certificados contínuos. Estudos de convergência e exemplos curvos são pendências explícitas. Não declarar GWML-T02 concluída antes da validação.
