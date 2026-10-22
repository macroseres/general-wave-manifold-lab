# Contrato para implementar as 16 combinações no espaço de estados

Este documento encerra a especificação inicial do catálogo, não a investigação global de todas as soluções. É o ponto de partida da próxima etapa de código. A implementação deve depender do fluxo, de equações nos estados e do modelo de seleção; a futura camada topológica será uma representação adicional.

## 1. O que significa implementar o catálogo

Disponibilizar os 16 pares formais de blocos R, S, C e K, com disponibilidade determinada pelas hipóteses do problema. Construir candidatos onde os construtores estejam disponíveis, verificar os segmentos e apresentar conclusões qualificadas. Uma opção da interface não garante uma solução para os dados inseridos.

Registrar família, orientação, domínio, amplitude e ramos internos em cada bloco. C é contato de uma família linearmente degenerada; K é composta com segmentos explícitos e junções sônicas. Não usar K como nome genérico de dois segmentos arbitrários. Amplitudes nulas são identidades; a normalização do resultado remove blocos vazios e compara perfis equivalentes.

## 2. Construção e equações de fechamento

Para cada bloco A e estado U, o construtor retorna ramos A(α;U), estado de saída, segmentos e intervalo de velocidades. O vetor α pode ter mais de uma componente. Uma composta não deve ser forçada a ter um parâmetro escalar sem justificar sua parametrização.

Para A–B, resolver a condição de saída

$$
B(\beta;A(\alpha;U_L))=U_R,
$$

incluindo as equações internas de cada bloco. Quando as curvas progressiva de A e retrospectiva de B estiverem disponíveis, pode-se resolver A(α;U_L)=B_back(β;U_R). A construção retrospectiva deve preservar a orientação física de cada onda e seu critério, não inverter uma desigualdade de admissibilidade sem dedução.

Se o número de incógnitas exceder o número de restrições independentes, registrar uma família de candidatos ou acrescentar condições do modelo; não selecionar uma raiz arbitrária como solução única. Singularidades do jacobiano exigem continuação ou estado inconclusivo, não exclusão silenciosa do ramo.

## 3. Registro das 16 entradas

| ID | Construtor esquerdo | Construtor direito | Condição adicional a destacar |
|---|---|---|---|
| RR | R | R | Monotonicidade contínua ou evidência amostrada dos dois leques |
| RS | R | S | Borda final do leque não supera s |
| RC | R | C | Verificar degenerescência linear da família do contato |
| RK | R | K | Verificar o leque e todos os segmentos da composta |
| SR | S | R | s não supera a borda inicial do leque |
| SS | S | S | Patamar positivo exige s_esquerdo<s_direito |
| SC | S | C | Seleção do choque e curva de contato identificadas |
| SK | S | K | Seleção do choque e de cada salto dentro de K |
| CR | C | R | Contato orientado antes do início do leque |
| CS | C | S | Contato e seleção do choque separados |
| CC | C | C | Mesma velocidade exige examinar fusão; famílias distintas podem separar-se |
| CK | C | K | Contato e estados internos de K verificados |
| KR | K | R | Última velocidade de K não supera a borda inicial de R |
| KS | K | S | Última velocidade de K não supera s |
| KC | K | C | Última velocidade de K não supera a do contato |
| KK | K | K | Duas estruturas internas verificadas e fechamento pelo estado intermediário |

Em todas as linhas, exigir b_A≤a_B e resolver corretamente bordas coincidentes. No solver clássico local, as famílias e hipóteses reduzem os padrões aos descritos em `RESULTADOS_E_REGIMES.md`; as demais entradas devem explicar sua indisponibilidade nesse regime.

## 4. Dados de entrada e saída

**Entrada:** coeficientes do fluxo, U_L,U_R, domínio de estados, catálogo pedido, família de cada bloco, limites de amplitude e busca, ramos habilitados, critérios de seleção, tolerâncias com escalas e orçamento numérico. Para perfis, incluir modelo exato de difusão–dispersão e seus coeficientes. Para entropia, incluir funções ou representação verificável dos pares e domínio de convexidade.

**Saída por candidato:** identificador do padrão e dos ramos, estados externos/intermediários/internos, segmentos elementares, velocidades, resíduos, espectros, tipos dos nove interiores ou fronteiras, resultados de cada critério, limites da busca e perfil físico quando construível. Preservar as condições de parada e os trechos não explorados.

**Saída sem candidato:** distinguir hipótese incompatível, construtor não implementado, ausência demonstrada em escopo delimitado, nenhum candidato encontrado na busca limitada e falha numérica. Nenhum candidato amostrado não prova inexistência.

## 5. Resultados dos critérios

Usar registros separados para conservação, hiperbolicidade, classificação do salto, crescimento dos leques, Lax, Liu, entropia, perfil, cinética, ordenação e fechamento. Cada registro deve conter estado, fundamento, domínio, tolerância e motivo.

Estados mínimos: `not-applicable`, `not-evaluated`, `inconclusive`, `violation-detected`, `numerically-compatible`, `proved-in-scope`. Esses nomes são um contrato proposto, não uma API já existente. Reservar prova para um resultado matemático ou método certificado com suas hipóteses, não para um resíduo abaixo de tolerância.

O resumo de admissibilidade é uma agregação dos critérios exigidos pelo modelo. Uma violação exigida rejeita o candidato segundo esse modelo; um requisito inconclusivo mantém a seleção inconclusiva. Critérios opcionais ausentes não rejeitam uma solução segundo outro modelo declarado. `not-applicable` nunca é sinônimo de aprovado.

## 6. Ordem de desenvolvimento e correções prévias

1. Classificação das fronteiras de Lax corrigida e nove interiores implementados com testes; manter os eventos sônicos separados ao ampliar o solver.
2. Consolidar construtores de R, S e C no espaço de estados e seus contratos de domínio. Cobrir primeiro RR, RS, SR, SS, RC, SC, CR, CS e CC onde as hipóteses permitirem.
3. Resolver estados intermediários por ramos e acrescentar ordenação, perfil físico e deduplicação pela cadeia normalizada.
4. Consolidar K por suas equações tradicionais, sem depender de um resíduo regularizado que se anula artificialmente na fronteira de carta; cobrir RK, SK, CK, KR, KS, KC e KK.
5. Acrescentar perfis e cinética somente para o modelo parametrizado e estudado. A escolha atual é difusão–dispersão; os coeficientes específicos continuam dados a definir.

Essa sequência não exige terminar a camada topológica antes da busca nos estados. A discrepância do resíduo recíproco e a classificação de fronteiras registradas na rastreabilidade foram corrigidas nesta sequência e receberam testes de regressão. Preservar essas verificações ao ampliar as cadeias.

## 7. Verificação necessária para declarar suporte

Cada ID tem um estado de disponibilidade independente: especificado, construtor disponível, candidatos calculados ou verificado em casos delimitados. Acrescentar exemplos negativos: ondas fora de ordem, leque invertido, contato sem degenerescência linear, igualdade indevidamente rotulada como Lax, ramos desconectados, salto não conservativo e requisito cinético ausente.

Os exemplos triangulares existentes cobrem casos de RR, RS, SR e SS; o fluxo linear F=(u,2v) fornece CC e o fluxo F=(u²/2,3v) fornece RC. Os exemplos cúbicos de KK e RK verificam o conceito, mas não são testes de suporte do modelo quadrático. Para os padrões ainda sem caso quadrático demonstrado, registrar a ausência de fixture e pesquisar exemplos; não inventar um resultado para completar os 16 indicadores.

As verificações de classificação em `traditional-shock-signatures.mjs` são exemplos quadráticos de saltos individuais e não fixtures das 16 cadeias. Testar a classificação separadamente da busca e da admissibilidade.

## 8. Condição de passagem para implementação

O [estado de implementação](../STATE_SPACE_STATUS.md) registra o início desta sequência: nove interiores e barreira estrita de Lax implementados; RR numérico integrado às vistas, ao lado de RS, SR e SS existentes. RC, SC, CR, CS e CC foram acrescentados para contatos com direção e velocidade constantes; campos de direção variável permanecem pendentes. Uma busca limitada de K em duas orientações foi acrescentada, com RK/KR/SK/KS verificados e CK/KC/KK sem casos positivos validados. RR ainda usa interseção de poligonais sem corretor conjunto de EDOs.

A nomenclatura, as equações de fechamento, as condições de seleção e os resultados inconclusivos estão definidos. É possível iniciar uma implementação incremental e revisável. Permanecem pesquisas científicas específicas: cinética do fluxo quadrático, cobertura de grandes amplitudes e classificação global. Elas devem constar da disponibilidade e dos relatórios do aplicativo, sem impedir a construção dos casos que já têm base matemática.
