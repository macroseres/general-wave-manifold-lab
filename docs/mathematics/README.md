# Guia da referência matemática

O objetivo é documentar as construções de Riemann no espaço de estados, seus levantamentos à Variedade de Ondas e suas realizações físicas. A direção científica está em [Objetivos e escopo](../OBJETIVOS_E_ESCOPO.md).

## Fontes e leitura

A prioridade de escrita e revisão é agora a [camada tradicional autônoma](../traditional/README.md). Seu texto-base desenvolve os objetos em leis de conservação antes de recorrer à variedade. Os 26 capítulos abaixo preservam o material existente; sua ordem no aplicativo ainda não representa essa separação em camadas. A consolidação topológica vem depois da revisão da base tradicional.

| Fonte | Responsabilidade atual |
|---|---|
| `main.tex` e seus arquivos incluídos | Referência canônica das fórmulas do núcleo, cartas, sônicas, rarefações, Hugoniot e definições de compostas |
| `01-problema-de-riemann.md` | Formulação inicial e equação de similaridade exibidas no aplicativo |
| `02-leis-conservacao.md` | Soluções fracas e dedução de Rankine–Hugoniot exibidas no aplicativo |
| `03-espectro.md` | Autovalores e classificação espectral exibidos no aplicativo |
| `04-rarefacoes.md` | Construção local de leques regulares, hipóteses e limites numéricos exibidos no aplicativo |
| `05-choques-hugoniot-lax.md` | Saltos, fibras orientadas, desigualdades estritas e limites da classificação implementada |
| `06-entropia-admissibilidade.md` | Compatibilidade entropia–fluxo, produção no salto e distinção entre critérios e evidências |
| `07-variedade-construcao.md`, `08-deducao-coordenadas.md` | Relação de salto, prolongamento da diagonal e dedução das coordenadas |
| `09-carta-finita.md`, `13-carta-reciproca.md` | Domínios regulares, velocidade, transições completas e limites das cartas |
| `10-estados-projecoes.md`, `11-fibras-hugoniot.md`, `12-projecao-hugoniot.md` | Estados locais, fibras orientadas, projeções e cobertura numérica |
| `14-coincidencia.md` | Levantamentos próprios, multiplicidade, pontos escalares e limites da detecção de raízes |
| `15-sonicas.md`, `16-inflexao-dupla-sonica.md` | Condições completas/reduzidas, interseções, genuína não linearidade e convenções de dupla sônica |
| `17-campo-rarefacao.md`, `18-separatrizes.md` | Tangência projetada, parâmetros dos campos, orientação entre cartas e aproximação de separatrizes |
| `19-ondas-compostas.md` | EDO, saturações, seleção de ramos, condições físicas e limitação do resíduo recíproco |
| `20-cadeias-riemann.md` | Cadeias, traço inicial, perfis candidatos e compatibilidade entre os três espaços |
| `21-transformacoes-afins.md` | Transporte de fluxos, dados de Riemann, direções próprias e pares de entropia |
| `22-classificacao-estados.md` | Espectro local, tipo de cônica, tolerâncias e cortes do espaço de parâmetros |
| `23-diagnosticos-numericos.md`, `24-auditoria-matematica.md` | Reprodução de experiências, escala de resíduos, critérios e limites de auditoria |
| `25-ambientes.md`, `26-guia-leitura.md` | Finalidade das vistas, sequência de desenvolvimento, fontes e pendências |
| `src/components/DocumentationContent.jsx` | Registro das 26 seções: títulos e ordem, sem cópia do texto científico |
| `../architecture/TRACEABILITY.md` | Correspondência entre definições, implementação e evidências; contém tabelas históricas identificadas |

Os 26 arquivos Markdown são consumidos diretamente pela Documentação e pela Ajuda, sem cópia do texto em JSX. A migração da referência exibida não elimina nem substitui automaticamente o LaTeX canônico. Os arquivos LaTeX não incluídos por `main.tex` precisam de revisão de procedência antes de serem tratados como parte da referência compilada.

## Critérios editoriais

Aplicar o [contrato de fundamentação e construção](../FUNDAMENTACAO_E_CONSTRUCAO.md) a cada objeto: origem analítica ou geométrica, seleção, operações intrínsecas, correspondência demonstrada, degenerações e implementação. O mapa desse documento cobre os blocos dos 26 capítulos e distingue correspondências locais de pendências globais. A construção por extensão, saturação ou interseção deve ser deduzida depois da definição de origem.

Cada enunciado deve declarar hipóteses e domínio; cada demonstração deve justificar a conclusão nesse domínio. Distinguir um resultado matemático contínuo de seu teste numérico amostrado e registrar a relação entre os três espaços quando houver construção implementada.

Resultados da literatura precisam de referência identificável e localização do resultado utilizado. Resultados próprios precisam de dedução, hipóteses e validação. O primeiro mapa bibliográfico foi criado para o capítulo de fibras de Hugoniot em [BIBLIOGRAPHY.md](../BIBLIOGRAPHY.md); os demais capítulos ainda precisam dessa revisão. A referência atual não representa uma revisão bibliográfica concluída.

O renderizador aceita títulos, parágrafos, negrito, itálico, links HTTP/HTTPS, figuras locais em /docs/, matemática entre dólares e blocos delimitados por duas linhas de dólares duplos. Enunciados usam títulos como “Definição — Nome”; demonstrações começam com “Demonstração.” em negrito. Listas, tabelas e bibliografia automática ainda não são suportadas no conteúdo exibido. Este guia é um documento do repositório e não é carregado pelo renderizador.

## Sequência de consolidação

1. Bloco introdutório migrado: formulação, soluções fracas, espectro, rarefações, choques/Lax e entropia. Permanecem pendentes a revisão bibliográfica e a inspeção visual no navegador.
2. Bloco da variedade migrado: construção, cartas finita/recíproca, estados locais e projeções de Hugoniot. Deduções alinhadas aos módulos indicados, com exclusões de regularidade e cobertura explícitas; revisão bibliográfica e inspeção visual permanecem pendentes.
3. Bloco de rarefação, separatrizes e compostas migrado: projeção e seus pontos singulares, fator de orientação entre cartas, EDO e saturação, limites de seleção e resíduo recíproco. A validação global e a revisão bibliográfica permanecem pendentes.
4. Bloco de cadeias e classificação migrado: condições de solução fraca, traço inicial limitado, limites dos perfis candidatos, invariância afim e separação entre espectro local e diagramas de parâmetros. A cobertura global e a revisão bibliográfica permanecem pendentes.
5. Consolidar referências bibliográficas e a classificação por parâmetros sem atribuir cobertura global a cortes numéricos.

O bloco de coincidência, sônicas, inflexão e dupla sônica já foi migrado, com distinção dos determinantes completos e fatores reduzidos, dedução da relação entre K e a derivada própria e qualificação dos rótulos numéricos. As seções finais de diagnósticos, auditoria, ambientes e guia de leitura também foram migradas. A migração de formato está concluída; a revisão bibliográfica e a validação científica global não estão.

Após cada bloco: conferir as fórmulas e hipóteses, testar interpretação e renderização matemática, executar os checks do projeto e inspecionar a apresentação no navegador antes de declarar validação visual.

## Verificação da migração — 20/10/2026

As 26 seções estão em Markdown e são carregadas pelo mesmo registro em Documentação e Ajuda. O teste de renderização importa esse registro completo, verifica a ordem e as fontes, interpreta os textos e renderiza suas expressões matemáticas. Convenções editoriais, procedimentos e critérios de auditoria recebem o mesmo agrupamento semântico dos demais enunciados.

Nesta etapa, lint, 738 testes e build passaram; o build mantém o aviso de tamanho do pacote JavaScript. Isso valida os checks executados, não todas as afirmações científicas. A inspeção visual permanece pendente: o navegador integrado não apresentou este projeto no endereço local do servidor durante a tentativa de verificação. Não foi declarada aprovação visual.

As próximas frentes são consolidar a bibliografia com localização dos resultados utilizados, conferir a apresentação em navegador e tratar separadamente as correções matemáticas e numéricas registradas em TRACEABILITY.md. A migração não encerra essas pendências.

## Primeiro capítulo de referência completo

[11-fibras-hugoniot.md](11-fibras-hugoniot.md) reúne definições, dedução, fontes consultadas com escopo, exemplo triangular exato, figura nos três espaços e testes reproduzíveis. Os [dados e comandos](../examples/README.md) permitem reconstruir o ponto, o ramo e a figura. O exemplo verifica uma solução fraca estritamente Lax 2 nos extremos; não demonstra classificação global ou unicidade.

A figura exportada foi inspecionada como imagem. Isso não substitui a inspeção visual da página no navegador. A validação automatizada desta etapa cobre as fórmulas do exemplo e os novos links/figuras do renderizador.

## Estudos adicionais de referência

### Atlas algébrico dos parâmetros

Os capítulos de pesquisa [27 — dez parâmetros e homogeneização](27-atlas-parametros-variedade-ondas.md), [28 — carta genérica](28-forma-normal-generica.md) e [29 — atlas global dos fluxos](29-atlas-global-fluxos.md) documentam a normalização sob o grupo declarado. O capítulo 29 fornece a cobertura das partes quadráticas, estabilizadores e classes lineares residuais, incluindo os setores excepcionais. São documentos do repositório, separados das 26 seções registradas na interface. O fechamento do atlas de fluxos não fecha a classificação das estruturas globais de ondas.

O [mapa dos 26 capítulos](../DOCUMENTATION_COVERAGE.md) fornece o estado consolidado de procedência, exemplos e pendências. Os estudos avançados completam os blocos de compostas, separatrizes e classificação com dados reproduzíveis e limites explícitos.

[17-campo-rarefacao.md](17-campo-rarefacao.md) inclui um leque rápido exato, sua órbita na característica, orientação nas cartas e comparação com a interpolação do aplicativo. [20-cadeias-riemann.md](20-cadeias-riemann.md) inclui uma cadeia exata de dois choques, seu estado intermediário e uma falha de cobertura da parametrização atual demonstrada explicitamente. Ambos têm figuras, fixtures, comandos de reprodução e testes em `wavePatternsReference.test.js`; o mapa bibliográfico registra as partes consultadas e os exemplos deduzidos no projeto.

[19-ondas-compostas.md](19-ondas-compostas.md) acrescenta um ramo duplamente sônico, sua junção física e um perfil viscoso exato para o choque isolado. [18-separatrizes.md](18-separatrizes.md) apresenta a fronteira estável exata e a integração de quatro metades; [22-classificacao-estados.md](22-classificacao-estados.md) deriva quatro tipos de cônica; [21-transformacoes-afins.md](21-transformacoes-afins.md) inclui um transporte reproduzível. Esses casos são conferidos por `advancedReference.test.js`.
