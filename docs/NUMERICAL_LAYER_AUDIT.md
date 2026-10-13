# Camada numérica — auditoria inicial do ciclo v0.7.0

## Escopo

Este incremento **não altera a geometria, as equações, as tolerâncias efetivas nem a renderização**. Centraliza os valores padrão dos integradores e do refinamento de eventos, acrescentando testes de regressão.

## Módulos identificados

| Responsabilidade | Implementação | Situação |
| --- | --- | --- |
| Política numérica | `src/math/numerics/policy.js` | Defaults agrupados por domínio; agora inclui `integration` |
| Passo RK4 clássico | `src/math/numerics/integration.js` | Implementado; teste indireto via adaptativo |
| RK4 adaptativo por duplicação | `src/math/numerics/integration.js` | Implementado; novos testes de default e direção temporal |
| Refinamento de evento por bisseção | `src/math/numerics/integration.js` | Implementado; novos testes de raiz e ausência de bracket |
| Raízes polinomiais | `src/math/numerics/polynomialRoots.js` | Implementado; exige auditoria de escalas e multiplicidades |
| Órbitas de rarefação | `src/math/rarefaction/orbits.js` | Consome política numérica explícita |
| Separatrizes | `src/math/rarefaction/separatrices.js` e `finiteSeparatrices.js` | Consomem política numérica explícita |

## Limites da certificação

- A diferença entre um passo RK4 completo e dois meios-passos, dividida por 15, é usada como estimativa do erro local dos **dois meios-passos**; os testes acrescentados não demonstram uma cota global do erro.
- O integrador aceita um passo quando atinge `minStep`, mesmo se o erro estimado superar a tolerância. Essa decisão preexistente exige revisão de semântica e relatório de qualidade antes de declarar integração adaptativa certificada.
- A função de evento requer uma mudança de sinal ou zero nos extremos; raízes tangenciais sem mudança de sinal não são detectadas por esse método.
- Os critérios de parada em domínios físicos, os equilíbrios e a continuação de ramos ainda precisam de auditoria específica.
- Os testes não demonstram cobertura global de `\mathcal W`, nem certificam degenerescências além dos casos anteriormente estudados.

## Próxima entrega

Formalizar o resultado de cada integração (`accepted`, `field`, `rejections`, `boundary`, `stagnation`, `event`) e distinguir parada por tolerância, passo mínimo e limites do domínio. Em seguida, certificar detecção de raízes/equilíbrios e continuação.


## Diagnósticos de parada do RK4 adaptativo (etapa 4)

- `minimumStepPolicy: 'accept'` preserva a política anterior: um passo no limite mínimo pode ser aceito mesmo com `error > scale`. Agora esse caso retorna `toleranceMet: false` e `stopReason: 'minimum_step_forced'`.
- `minimumStepPolicy: 'reject'` é uma opção estrita: retorna `kind: 'failure', reason: 'minimum_step_tolerance'` sem aceitar o passo.
- Passos aceitos dentro da tolerância retornam `toleranceMet: true`, `stopReason: 'tolerance'`.
- Estimativas de erro não finitas retornam `reason: 'nonfinite_error'`.
- Nenhum chamador foi migrado automaticamente para a política estrita, evitando alterar trajetórias de produção.
- Pendente: propagação dos diagnósticos para as curvas e certificação de detecção de equilíbrios/continuação.

## Diagnósticos opcionais de integração — 2026-10-08

As funções `rarefactionOrbits`, `finiteRarefactionSeparatrices` e `infinityRarefactionSeparatrices` aceitam `onIntegrationDiagnostic(d)` opcional. O callback recebe `source`, identificação da curva, `stepIndex` e o resultado de `adaptiveRK4Step` (incluindo `kind`, `stopReason`, `toleranceMet`, `error` e `scale` quando disponíveis). Nenhuma alteração ocorre na geometria retornada quando a coleta está ativa. A interface não exibe esses dados automaticamente; a instrumentação está disponível para auditoria e futura UI.

## Certificação adicional: equilíbrios e continuação (2026-10-08)

Arquivo: `tests/equilibriumContinuationCertification.test.js` (oito testes).

- `cubicRealRoots` resolve os exemplos com três raízes simples, uma raiz dupla e uma tripla; a interface retorna raízes **distintas**, sem multiplicidade algébrica explícita.
- A redução de grau para a equação linear e a ausência de raízes reais para uma quadrática de discriminante negativo são verificadas.
- `infinityRarefactionLinearData` diferencia os casos `nonisolated` e `absent` quando o coeficiente linear em `eta` se anula. Não confundir a identificação algébrica com a classificação dinâmica completa.
- `decomposeCompositeBranches` faz correspondência um-para-um somente entre amostras consecutivas; termina um ramo ao desaparecer a raiz, respeita `maxMatchDistance` e cria novo ramo em reaparecimento.

**Limitações ainda abertas:** a rotina de raízes não devolve multiplicidades; a classificação de equilíbrio próximo a discriminantes nulos depende das tolerâncias; a continuação por amostras discretas pode perder eventos entre amostras e não possui certificação intervalar nem preditor-corretor global. Raízes tangenciais não são detectadas por simples mudança de sinal. Não se alterou a implementação de produção nesta certificação.

## Root multiplicity and continuation event diagnostics (v0.7.0)

`src/math/numerics/rootDiagnostics.js` adds **opt-in, diagnostic-only**
`polynomialRootDiagnostics(coefficients, { tolerance })` for real roots of
polynomials of degree at most three. It reports distinct root values, residuals,
estimated multiplicities, and even-multiplicity (tangential) status. Critical
points are inspected independently of sign changes. The input is ordered from
highest to lowest degree. These estimates are tolerance-dependent and are not
certified interval enclosures, particularly near clustered roots or poorly
scaled coefficients.

`continuationEventDiagnostics(samples)` reports changes in the number of
candidate roots between successive samples. It **does not** classify a
bifurcation or connect branches across gaps. Production root solvers and
composite branch continuation are unchanged. See `tests/rootDiagnostics.test.js`.

Next: decide whether to integrate these diagnostics into the scientific
inspection UI, after validating numerical scaling and branch-identity tracking.

## Sensibilidade de raízes próximas (diagnóstico não invasivo)

`rootStabilityDiagnostics` compara o número de raízes distintas do polinômio original com os resultados de perturbações positivas e negativas do termo constante. O resultado `countSensitive` sinaliza mudanças observadas nessa varredura; `no-count-change-observed` **não certifica estabilidade** sob perturbações gerais. `polynomialContinuationDiagnostics` anota cada amostra e informa eventos de mudança na contagem, sem identificar ramos nem classificar bifurcações. A varredura depende das tolerâncias, da amplitude de perturbação e da precisão de ponto flutuante; raízes muito próximas podem ser fundidas pelo resolvedor. Essas funções são apenas diagnósticas e não modificam a continuação ou a renderização de produção.

## Auditoria opcional da continuação de curvas compostas

`auditCompositeContinuation(trace, options)` em `src/math/state/compositeTrace.js`
executa o mesmo `decomposeCompositeBranches` de produção e retorna
`{ branches, diagnostics }`. O resultado geométrico não é alterado.
Os diagnósticos registram mudanças no número de interseções sônicas
por amostra e casos em que duas candidatas possuem distâncias locais
muito próximas da posição anterior. A proximidade não prova troca de
identidade do ramo; eventos são classificados como `unresolved`.
O limiar `ambiguityTolerance` é um critério de alerta, não de conexão.
A auditoria não substitui análise de tangências nem continuação com
preditor-corretor certificado. Testes: `tests/compositeContinuationAudit.test.js`.


## Integração da auditoria ao pipeline geométrico das compostas

`buildCompositeSceneData(..., { auditContinuation: true })` coleta os diagnósticos
de `auditCompositeContinuation(trace)` em cada órbita amostrada, antes da certificação
dos pontos. A geometria continua usando os ramos originais do algoritmo de produção.
Os resultados são agregados em `minus/plus.diagnostics.continuation` com `traces`,
`samples`, `events` (cada um com `traceIndex`) e `ambiguousMatches`.
A UI solicita a auditoria ao gerar objetos compostos visíveis, mas ainda não
exibe automaticamente os eventos. A opção desligada mantém a saída anterior.
Eventos `unresolved` não são provas de bifurcação ou de identidade global dos ramos.

Cobertura: `tests/compositeSceneContinuationIntegration.test.js`.

### Exibição científica da auditoria de continuação
O painel `ContinuationAuditPanel` lê somente `diagnostics.continuation` retornado pelo pipeline geométrico. Exibe trajetórias, amostras, mudanças de contagem de raízes e correspondências ambíguas. Uma auditoria ausente é distinta de uma auditoria com zero eventos. Os eventos permanecem não classificados; não se inferem bifurcações. O painel não modifica os ramos, os parâmetros numéricos ou o renderer Three.js.
