# Da teoria de ondas à construção na variedade

## Direção científica

A execução do contrato passa a ocorrer em duas camadas sucessivas: primeiro a [construção tradicional autônoma](traditional/README.md), depois a construção topológica. A primeira deve definir os objetos e sua realização física sem depender da variedade. O mapa abaixo orienta a segunda camada e a correspondência futura; não exige misturar as duas durante a apresentação inicial.

Todo objeto deve ter uma definição matemática antes de sua fórmula de carta ou algoritmo. Para ondas, partir da construção tradicional em leis de conservação, com a teoria clássica ou não clássica escolhida; em seguida, desenvolver sua construção topológica na Variedade de Ondas e demonstrar a correspondência. Para objetos intrinsecamente geométricos, declarar essa origem e justificar sua relação com as ondas, sem inventar uma definição tradicional equivalente.

## Convenção terminológica do projeto

**Construção tradicional** designa a formulação em leis de conservação, incluindo tanto a teoria clássica quanto a não clássica de LeFloch. **Construção topológica** designa a construção sobre a Variedade de Ondas por levantamentos, fibras, extensões, saturações e interseções. Essa denominação não dispensa argumentos analíticos, diferenciais ou algébricos para justificar a construção.

A comparação entre métodos é tradicional/topológica. A distinção clássica/não clássica pertence à teoria de admissibilidade dentro da formulação tradicional e deve ser transportada à representação topológica da mesma onda. Extensão geométrica, singularidade de carta e falha de Lax não definem, isoladamente, uma onda não clássica. A expressão técnica solução clássica, quando usada para uma função diferenciável que satisfaz a EDP pontualmente, conserva seu significado de regularidade e deve ser identificada pelo contexto.

## Contrato de cada objeto

1. **Origem e definição:** fluxo, domínio, regularidade, orientação dos estados, família e condições definidoras. Identificar fonte, versão, seção e resultado efetivamente consultado; adaptações exigem dedução própria.
2. **Seleção:** indicar o critério clássico ou não clássico e suas hipóteses. Quando não houver onda física associada, registrar que admissibilidade não se aplica ao objeto isolado.
3. **Construção intrínseca:** definir o ambiente e os mapas; especificar levantamento, pré-imagem, saturação, interseção ou extensão utilizados.
4. **Correspondência:** demonstrar as duas implicações quando se reivindica equivalência. Distinguir igualdade de conjuntos, projeção sobrejetiva, correspondência local e representação que esquece dados. Registrar multiplicidades e exclusões.
5. **Degenerações:** declarar o que ocorre na diagonal, coincidência, perda de posto, fronteira de carta e junção sônica. Um conjunto prolongado pode conter ramos sem interpretação física demonstrada.
6. **Realização física:** recuperar estados, velocidades e perfil; verificar conservação, ordenação e admissibilidade da cadeia completa.
7. **Implementação e evidência:** apontar módulos, tolerâncias, testes e cobertura. Um objeto definido ainda pode estar sem representação computacional; um candidato calculado ainda pode estar sem admissibilidade demonstrada.

## Operações geométricas e obrigações de prova

Para uma projeção π, a pré-imagem de A contém todos os pontos cujos estados projetados pertencem a A. A saturação por suas fibras é π⁻¹(π(B)); não é uma escolha de um único ramo por estado. Um levantamento escolhido é uma aplicação ℓ com π∘ℓ igual à identidade no domínio declarado; sua existência, unicidade e regularidade precisam de hipóteses.

Interseção significa impor simultaneamente condições. Sua dimensão e suavidade exigem análise de posto ou transversalidade; desenhar duas superfícies não prova que sua interseção seja uma curva regular.

Extensão precisa nomear o procedimento: fecho topológico no ambiente indicado, continuação de um campo, extensão suave de uma equação reduzida ou transformação estrita após desingularização. Esses procedimentos não são intercambiáveis. Dividir uma equação por um fator nulo pode retirar componentes; prolongar o fator restante precisa de justificativa independente. A saturação por fibras utilizada aqui não é a saturação de ideais da geometria algébrica.

## Mapa dos objetos e estado das correspondências

| Objeto | Ponto de partida | Construção na variedade | Obrigação e estado atual |
|---|---|---|---|
| Fluxo, solução fraca e perfil de Riemann, §§1–2 | Lei de conservação e formulação distribucional | Dados e projeções das ondas que compõem o perfil | Correspondência por segmento; não há cobertura global demonstrada |
| Espectro e característica, §§3, 14 | Equação própria em cada estado | Incidência estado–direção–velocidade sobre salto nulo | Correspondência local em família simples; multiplicidade em pontos escalares |
| Rarefações, §§4, 17 | Curvas integrais e velocidade crescente para o leque orientado | Levantamento à folha característica | Derivadas projetadas verificadas no domínio regular; exclusões explícitas |
| Choques e Hugoniot, §§5, 11–12 | Rankine–Hugoniot fora da diagonal | Fibras de π₋ ou π₊ e projeção pelo outro extremo | Manter velocidade e direção; fibras completas não são curvas de choques já selecionados |
| Entropia e seleção, §6 | Pares de entropia, critérios clássicos ou relação cinética especificada | Restrição das conexões pelos mesmos critérios avaliados nos extremos | Não há certificador entrópico geral nem relação cinética geral implementados |
| Variedade e cartas, §§7–10, 13 | Relação de salto e direção projetiva | Desingularização, atlas e mapas de estados | Quadraticidade usada na identidade do estado médio; regularidade global não presumida |
| Sônicas, §15 | Velocidade de choque própria em um extremo | Pré-imagem da condição espectral; folha reduzida prolongada | Condição completa e fator reduzido são distintos na diagonal |
| Inflexão e dupla sônica, §16 | Derivada própria nula; sonicidade nos dois extremos | Restrição à característica ou interseção das condições sônicas | Exigir família simples para a relação de inflexão; declarar inclusão/exclusão do salto nulo |
| Separatrizes, §18 | Variedades invariantes de equilíbrios hiperbólicos | Órbitas do campo levantado nas cartas | Teoria local não demonstra destino global dos ramos numéricos |
| Compostas, §19 | Conexão sônica vinculada a uma rarefação e EDO implícita | Saturação da rarefação e interseção com a folha correspondente | Equivalência local condicionada; admissibilidade é seleção posterior |
| Cadeias, §20 | Estados intermediários e velocidades ordenadas | Incidências entre extremidades das ondas levantadas | Igualdade de estados não basta: verificar perfil e seleção de cada conexão |
| Equivalência afim e classificação, §§21–22 | Transporte do fluxo e invariantes definidos | Transporte dos estados, direções, fibras e conjuntos especiais | Classificação espectral, geométrica e de admissibilidade têm escopos diferentes |
| Diagnósticos e ambientes, §§23–26 | Procedimentos numéricos e editoriais | Amostragem e apresentação das construções | Não são novas classes de solução; respeitar os contratos anteriores |

## Base bibliográfica e pendências

LeFloch, *Hyperbolic Systems of Conservation Laws: The Theory of Classical and Nonclassical Shock Waves* (2002), é a referência de trabalho para organizar a teoria de ondas. O sumário editorial distingue o problema de Riemann para sistemas (pp. 139–166) e soluções entrópicas clássicas e não clássicas. Esses localizadores foram conferidos no sumário; não representam leitura integral nem conferência de teoremas do livro.

A revisão de LeFloch de 2010 fundamenta a distinção conceitual sobre seleção por relação cinética. WM-01 fundamenta as construções geométricas nos domínios específicos estudados pelos autores. As fontes e seus limites estão em [BIBLIOGRAPHY.md](BIBLIOGRAPHY.md).

A prioridade de revisão passa a ser preencher este contrato por resultado, começando por admissibilidade, sônicas e compostas; depois cobrir os demais objetos e suas degenerações. Este mapa fixa o método e identifica lacunas; não declara todas as equivalências provadas.
