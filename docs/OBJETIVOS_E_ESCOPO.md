# Objetivos científicos e escopo do aplicativo

Este documento registra a direção científica do projeto, confirmada em 20/10/2026. Deve orientar o roadmap, a documentação matemática e as decisões de implementação. Não é uma declaração de que todos os objetivos já foram alcançados.

## Objetivo central

Construir e visualizar soluções do problema de Riemann na Variedade de Ondas, estabelecendo sua correspondência com as construções no espaço de estados e suas realizações no espaço físico. A variedade é o eixo científico do laboratório: o objetivo de pesquisa é representar nela todas as soluções do espaço de estados dentro de um escopo matemático explicitamente definido.

As construções conhecidas na literatura para o espaço de estados fornecem referências para a implementação e comparação. Seu levantamento à variedade deve ser desenvolvido e justificado; uma representação gráfica semelhante não demonstra equivalência matemática.

## Fluxo e classificação

O ponto de partida implementado é o fluxo quadrático geral de dois estados e dez coeficientes reais, definido em `mathematics/01-flux.tex` e `src/math/flux/quadraticFlux.js`. A intenção de estudar um fluxo geral não implica suporte atual a fluxos diferenciáveis arbitrários.

O laboratório deve permitir estudar classificações segundo os parâmetros, incluindo regiões espectrais, degenerações, geometria das ondas e regimes das construções de Riemann. Deve distinguir classificação em cada estado, exploração de cortes do espaço de parâmetros e classificação global por invariantes ou equivalências demonstradas. Um preset ou corte numérico não representa toda a família.

## Correspondência entre os três espaços

- **Estados:** dados iniciais `U_L`, `U_R`, estados intermediários, curvas de ondas, orientação e condições de conexão.
- **Variedade de Ondas:** levantamentos dessas construções, projeções `pi_-` e `pi_+`, cartas, fibras, sônicas, rarefações e compostas, com identificação dos ramos e degenerações.
- **Físico:** realização da mesma cadeia em `(x,t)`, com velocidades, saltos, leques e perfis autossimilares quando aplicáveis.

Cada construção deve explicitar como os dados nos três espaços se relacionam, quais projeções são usadas e onde a correspondência deixa de ser regular ou única. Não se presume uma bijeção global entre curvas no espaço de estados e objetos na variedade. Trocas de carta e fronteiras projetivas precisam de tratamento próprio.

## Significado de cobertura das soluções

“Todas as soluções” é uma meta de pesquisa. Cada resultado de cobertura deve declarar a classe de fluxos, o domínio de parâmetros e estados, as sequências de ondas consideradas, o critério de admissibilidade e as exclusões ou degenerações ainda abertas. Não se presume existência ou unicidade global, especialmente em regimes de tipo misto.

O software deve distinguir construção matemática, aproximação numérica, candidato e solução validada sob hipóteses declaradas. Resíduos pequenos, Lax, Liu amostrado e testes de convergência são evidências específicas; não constituem isoladamente prova de completude ou admissibilidade entrópica global.

## Documentação como base de desenvolvimento

A terminologia distingue construção tradicional em leis de conservação, que abrange as teorias clássica e não clássica de LeFloch, e construção topológica sobre a Variedade de Ondas. A passagem entre construções deve preservar a admissibilidade escolhida, com correspondência demonstrada no domínio declarado.

A estrutura obrigatória é definição na teoria de origem → admissibilidade quando aplicável → construção intrínseca na variedade → demonstração da correspondência → degenerações → realização física → algoritmo e evidência. O contrato e o mapa dos objetos estão em [Fundamentação e construção](FUNDAMENTACAO_E_CONSTRUCAO.md). A teoria clássica e não clássica deve preceder a seleção geométrica; uma extensão na variedade não define por si só uma onda não clássica.

Para cada objeto ou construção, registrar:

1. Definição, notação, domínio e hipóteses.
2. Referência bibliográfica precisa para resultados da literatura; dedução e hipóteses para adaptações ou resultados desenvolvidos no projeto.
3. Construção no espaço de estados, levantamento à variedade e realização física, quando disponíveis.
4. Algoritmo, tolerâncias, critérios de parada, singularidades e casos inconclusivos.
5. Implementação, testes e evidências de validação correspondentes.
6. Estado explícito: planejado, em investigação, implementado numericamente ou validado em escopo delimitado.

A referência matemática em LaTeX e a documentação exibida no aplicativo ainda coexistem. As 26 seções exibidas no aplicativo usam Markdown como fonte compartilhada entre Documentação e Ajuda, sem texto científico duplicado no registro JSX. A referência LaTeX continua com responsabilidade canônica própria. A migração deve preservar as hipóteses e vincular as fórmulas à referência canônica, evitando versões científicas divergentes.

## Estado observado e sequência de trabalho

Ordem de desenvolvimento científico confirmada: primeiro consolidar integralmente a construção tradicional nos espaços de estados e físico, incluindo seleção clássica e não clássica; depois acrescentar a camada topológica na Variedade de Ondas. O ponto de entrada é [traditional/README.md](traditional/README.md). O material topológico existente permanece preservado para revisão posterior, sem ser requisito de leitura da primeira camada.

Já existem o fluxo quadrático, cartas e projeções, rarefações, fibras de Hugoniot, construções numéricas de compostas, cadeias candidatas de Riemann e diagnósticos físicos e de admissibilidade. Sua existência não encerra a validação global das construções.

A sequência de trabalho é consolidar a documentação e a rastreabilidade atuais; organizar as construções conhecidas no espaço de estados com referências; explicitar e validar seus levantamentos à variedade; conectar as realizações físicas; e ampliar a cobertura e classificação por parâmetros com hipóteses e limitações registradas. A documentação acompanha cada etapa, antes de sua apresentação como resultado validado.
