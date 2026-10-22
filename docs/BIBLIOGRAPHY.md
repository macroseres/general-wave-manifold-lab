# Bibliografia e mapa de procedência

Este índice registra fontes primárias consultadas para os blocos de ondas e dinâmica. O [mapa dos 26 capítulos](DOCUMENTATION_COVERAGE.md) separa essas fontes das deduções algébricas expostas no projeto e dos contratos editoriais. Uma fonte citada não valida automaticamente uma implementação ou uma generalização de seu resultado; a revisão bibliográfica exaustiva por resultado continua aberta.

## WM-01 — Variedade e fibras de Hugoniot

Cesar S. Eschenazi, Wanderson J. Lambert, Marlon M. López-Flores, Dan Marchesin, Carlos F. B. Palmeira e Bradley J. Plohr. *Solving Riemann Problems with a Topological Tool (Extended version)*. arXiv:2312.17377, **versão 2, 13/09/2024**. [Texto consultado](https://arxiv.org/html/2312.17377v2).

| Localização | Uso neste projeto | Restrição |
|---|---|---|
| §2.1, equações 2.1–2.2 | Identificação do modelo estudado | Caso IV simétrico especificado pelos autores; não cobre automaticamente os dez parâmetros |
| §2.2, equações 2.3–2.8 | Relação de salto, blow-up e estados fixados | Traduzir orientação do salto e convenções de coordenadas |
| §2.4, equações 2.14 e 2.18 | Exemplo de parametrização adaptada | A coordenada longitudinal do app usa outra base/tangente; comparar estados reconstruídos |
| §4.1, equações 4.1 e 4.3–4.5, definição 4.1 | Construção por direções próprias, levantamento e escolha de arcos monótonos | Não importar a EDO específica nem sua classificação global para outro fluxo |
| §4.4, definição e equações 4.17–4.18 | Relação de compostas com rarefações levantadas | Transporte de notação e orientação; as fórmulas específicas não foram copiadas para o exemplo triangular |

O uso neste capítulo é conceitual e localizado. O exemplo triangular, suas contas e os testes foram construídos para a documentação do projeto e não são apresentados como exemplo extraído desse artigo. Não se reivindica originalidade científica do exemplo.

## RP-01 — Lugar de Hugoniot no espaço de estados

David I. Ketcheson, Randall J. LeVeque e Mauricio J. del Razo. *Riemann Problems and Jupyter Solutions: Theory and Approximate Solvers for Hyperbolic PDEs*. SIAM, 2020. [Página dos autores](https://www.clawpack.org/riemann_book/). Capítulo [Shallow water](https://www.clawpack.org/riemann_book/html/Shallow_water.html), subseções **Shock waves**, **All-shock Riemann solutions** e **The entropy condition**.

Uso: referência didática para lugar de Hugoniot, condições de salto e distinção entre conexões conservativas e seleção de ondas. O modelo é de águas rasas; suas fórmulas não foram transferidas ao fluxo quadrático do app. A edição HTML é consultada como recurso dos autores; não se atribui um número de página da edição impressa.

Para o capítulo de rarefação, foi consultada também a subseção **Rarefaction waves / Integral curves**; para a cadeia, **All-shock Riemann solutions**. Elas fundamentam a comparação conceitual entre conexões nos estados. As fórmulas exatas do leque triangular e da cadeia foram deduzidas na documentação, sem copiar as soluções específicas de águas rasas.

## Procedência das partes do capítulo-modelo

| Parte | Procedência | Evidência e limite |
|---|---|---|
| Fibra como pré-imagem de um estado | WM-01 §2.2, na convenção explícita do projeto | Correspondência de definições; não importa a classificação global do artigo |
| Fórmula geral via P,Q,R | Dedução exposta na referência do projeto | Conferência com `src/math/state/fibers.js` |
| Fluxo triangular e ponto selecionado | Exemplo de verificação escolhido no projeto | Contas exatas e teste do exemplo |
| Interface física e Lax 2 no ponto | Avaliação e demonstração explícitas | Conservação e desigualdades nos extremos; sem certificação global de entropia |
| Figura nos três espaços | Dados gerados pelo núcleo, plotados com Matplotlib | Trecho finito e ponto destacado; não representa toda a fibra |

Os exemplos adicionais estão em `17-campo-rarefacao.md` e `20-cadeias-riemann.md`, com dados em `docs/examples/wave-patterns-reference.json`. O primeiro deduz uma órbita exata de velocidade crescente; o segundo verifica dois saltos ordenados e demonstra, pelo diferencial de RH, que a falha da carta do primeiro salto não é uma singularidade da relação de salto. Os testes não demonstram unicidade ou classificação global.

## ODE-01 — Variedades estável e instável

William M. Feldman. *MATH 6410: Ordinary Differential Equations*, Fall 2024, University of Utah. [Slides consultados](https://www.math.utah.edu/~feldman/ODE-slides/ODE-slides5v2024.pdf#page=7), slides 3–7, teorema no slide 7. Uso: existência local e tangência para uma linearização hiperbólica. Isso não justifica extensão global das separatrizes calculadas. O campo recíproco e seus valores -8 e 7 foram calculados para o preset declarado, não retirados do exemplo de pêndulo das notas.

## Procedência dos demais exemplos

O caso composto duplamente sônico e seu perfil viscoso B=I são verificados por substituição explícita no capítulo 19. A classificação do capítulo 22 decorre de completar quadrados no discriminante do preset. A transformação afim do capítulo 21 usa as identidades demonstradas no próprio capítulo. Esses exemplos não são apresentados como teoremas globais da literatura, nem como resultados científicos originais.

Próximas referências devem ser incorporadas por resultado, com versão, seção ou número de teorema, hipóteses e correspondência de notação. Referências apenas mencionadas por outro artigo ainda precisam de consulta direta. Em particular, não foi feita uma pesquisa exaustiva de prioridade ou originalidade para todos os objetos da variedade.

## LF-01 — Teoria clássica e não clássica: referência de trabalho

Philippe G. LeFloch. *Hyperbolic Systems of Conservation Laws: The Theory of Classical and Nonclassical Shock Waves*. Birkhäuser, 2002. [Página editorial e sumário](https://link.springer.com/book/10.1007/978-3-0348-8150-0).

Consulta nesta etapa: metadados e sumário editorial. Localizadores de estudo: *Fundamental Concepts and Examples*, pp. 1–26; *The Riemann Problem*, parte de sistemas, pp. 139–166; capítulos *Classical Entropy Solutions of the Cauchy Problem* e *Nonclassical Entropy Solutions of the Cauchy Problem*. Não foi feita leitura integral nem conferência de números de definições e teoremas. LF-01 orienta a organização; não serve ainda como atestado de cada enunciado do projeto.

## LF-02 — Seleção por relação cinética

Philippe G. LeFloch. *Kinetic relations for undercompressive shock waves. Physical, mathematical, and numerical issues*. arXiv:1002.2950v1, 15/02/2010. [Registro e resumo consultados](https://arxiv.org/abs/1002.2950v1).

Uso localizado: distinção conceitual entre conservação/entropia e seleção adicional de choques subcompressivos por relação cinética. O resumo não fornece uma relação cinética para o fluxo quadrático geral do aplicativo. Não foi importado um teorema de existência ou unicidade. A derivação por regularização e a localização de resultados no texto completo permanecem pendentes.

Consulta adicional de LF-02 para a camada tradicional: [texto HTML da versão 1](https://arxiv.org/html/1002.2950v1), §§2.1–2.3 (seleção e relação cinética), §4.4 (sistemas), §§5.1 e 5.3 (perfis). Essa consulta complementa o resumo; não importa as fórmulas escalares nem uma função cinética universal para o fluxo do app. Os números de teoremas do livro LF-01 continuam sem conferência integral.

O contrato de revisão e as correspondências a demonstrar estão em [FUNDAMENTACAO_E_CONSTRUCAO.md](FUNDAMENTACAO_E_CONSTRUCAO.md). A primeira camada está em [traditional/README.md](traditional/README.md).

## CW-01 — Teorema clássico local

Gui-Qiang Chen e Dehua Wang. *The Cauchy Problem for the Euler Equations for Compressible Fluids*. Preprint de 2002 para o *Handbook of Mathematical Fluid Dynamics*, vol. 1. [PDF consultado](https://www.math.ntnu.no/conservation/2002/001.pdf#page=21), §6.1, proposições 6.1–6.3 e teoremas 6.1–6.2, pp. impressas 20–22 (índices de PDF 19–21). Aplicação e hipóteses descritas em [Resultados locais e regimes](traditional/RESULTADOS_E_REGIMES.md). A fonte foi consultada diretamente; não se atribui ao projeto uma prova original do teorema.

LF-02: consulta complementar ao §5.2 para contextualizar relações cinéticas geradas por perfis. O perfil cúbico explícito de RESULTADOS_E_REGIMES.md é demonstrado por substituição no próprio documento; não se usa o teorema 5.2 como uma classificação do fluxo quadrático 2×2.

## IMG-01 — Tabela fornecida pelo usuário

Imagem intitulada “Table 1”, anexada nesta conversa: nove configurações características de uma interface. Obra, autoria, edição e página não identificadas. As desigualdades foram transcritas para [CLASSIFICACAO_DOS_SALTOS.md](traditional/CLASSIFICACAO_DOS_SALTOS.md), com prova independente da contagem. Não se atribui a tabela ao livro de LeFloch sem confirmar sua origem. Os exemplos quadráticos foram construídos no projeto e verificados separadamente.
