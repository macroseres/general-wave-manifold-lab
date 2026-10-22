# Construção tradicional do problema de Riemann

Esta é a primeira camada da referência científica: definições e construções em leis de conservação, nos espaços de estados e físico. Inclui admissibilidade clássica e não clássica. Sua leitura não depende de cartas, fibras ou saturações da Variedade de Ondas.

O [texto-base](CONSTRUCAO_TRADICIONAL.md) organiza a sequência completa: formulação, espectro, curvas integrais, rarefações, contatos, Hugoniot, choques, entropia, Liu, sonicidade, compostas, perfis regularizados, relações cinéticas, curvas de ondas e colagem do perfil de Riemann.

O capítulo [Cadeias e admissibilidade](CADEIAS_E_ADMISSIBILIDADE.md) consolida os contratos de montagem, a tabela de padrões, a aplicação de cada critério e um procedimento de resolução. Inclui quatro padrões exatos para o mesmo fluxo triangular, uma verificação contínua de Liu nos arcos declarados, contato e junção sônica. Separa a demonstração matemática da cobertura atual do aplicativo.

## Sequência consolidada para desenvolver o solver

1. [Construção tradicional](CONSTRUCAO_TRADICIONAL.md): definições e equações.
2. [Classificação dos saltos](CLASSIFICACAO_DOS_SALTOS.md): nove interiores espectrais, fronteiras e exemplos quadráticos de RH.
3. [Resultados locais e regimes](RESULTADOS_E_REGIMES.md): teorema local, hipóteses e seleção por regularização.
4. [Cadeias e admissibilidade](CADEIAS_E_ADMISSIBILIDADE.md): composição dos blocos e realização física.
5. [Contrato das 16 combinações](IMPLEMENTACAO_16_CADEIAS.md): equações, dados, disponibilidade, evidências e etapas de implementação nos estados.

A especificação permite iniciar a implementação incremental das 16 entradas. Não promete que todas tenham solução em cada fluxo nem que os 16 construtores já estejam disponíveis. O livro de referência, a teoria local e os exemplos não resolvem automaticamente a seleção cinética e a cobertura global.

## Estado e responsabilidade

A revisão [Resultados locais e regimes](RESULTADOS_E_REGIMES.md) acrescenta a referência localizada do teorema clássico local, deduções de pequenos choques e entropia, padrões por tipo de família e o modelo de difusão–dispersão escolhido para investigação. Um perfil cúbico não clássico exato tem verificações reproduzíveis; os coeficientes da regularização do fluxo quadrático ainda precisam ser definidos.

O catálogo de cadeias inclui a matriz dos 16 pares ordenados de tipos R, S, C e K, além de regras para sequências maiores. Há exemplos exatos de contato–contato, composta–composta e rarefação–composta; os dois últimos usam um fluxo cúbico didático explicitamente fora do modelo quadrático implementado. Possibilidade formal, exemplo demonstrado e suporte no aplicativo são estados distintos.

O texto contém definições operacionais e deduções locais explícitas. Não é uma reprodução integral do livro de LeFloch, nem uma prova de solução para todo fluxo quadrático. Os enunciados globais exigem hipóteses adicionais e referências verificadas por resultado. A relação cinética para o modelo geral não está determinada: ela exige a escolha de uma regularização física.

Os capítulos atuais em `../mathematics/` continuam preservados como material de referência e como fonte da documentação exibida. A camada tradicional é um documento autônomo do repositório; ainda não substitui a navegação das 26 seções do aplicativo. O material topológico existente será consolidado como segunda camada depois da revisão desta base, com um mapa de correspondência por objeto.

## Critério de fechamento desta camada

| Parte | Estado nesta versão | Condição para fechamento científico |
|---|---|---|
| Definições e deduções elementares | Texto-base e complementos escritos; procedência identificada nos resultados utilizados | Manter revisão por resultado ao ampliar o escopo |
| Nove interiores espectrais | Tabela, exemplos quadráticos e classificador de produção; fronteiras de Lax corrigidas | Preservar as hipóteses e regressões ao ampliar os diagnósticos |
| Catálogo dos 16 pares | Contrato de implementação definido | Construir e verificar cada entrada nos regimes suportados |
| Exemplos exatos | Casos triangulares já reproduzíveis no projeto | Associar cada caso ao critério de seleção efetivamente provado |
| Teoria clássica local | Fonte localizada e deduções de choque/entropia incorporadas | Verificar as hipóteses na vizinhança de cada problema estudado |
| Teoria não clássica | Classe difusão–dispersão escolhida; estudo cúbico exato verificado | Definir B,C para o fluxo quadrático e derivar/validar a relação cinética |
| Fluxos degenerados e tipo misto | Exclusões e problemas abertos identificados | Desenvolver teoria específica; não extrapolar a região hiperbólica |
| Implementação | Módulos e estudos existentes permanecem disponíveis | Corrigir e validar as discrepâncias já registradas separadamente |

A próxima revisão científica deve avançar nesta camada. A ampliação topológica vem depois e não deve substituir uma definição tradicional ou uma seleção ainda ausente.

A implementação incremental já começou: [situação do espaço de estados](../STATE_SPACE_STATUS.md). O catálogo possui RR numérico, RS/SR/SS preexistentes e os cinco padrões com contatos de direção constante. Os padrões com compostas K e os regimes ainda não cobertos têm pendências específicas.

A segunda etapa acrescenta RC, SC, CR, CS e CC para [contatos de direção e velocidade constantes](CONTATOS_DIRECAO_CONSTANTE.md), com verificação nos coeficientes e perfis físicos próprios. Esse caso particular não representa cobertura de todas as famílias linearmente degeneradas.

A terceira etapa acrescenta a [busca de pares com K nos estados](COMPOSTAS_NO_ESPACO_DE_ESTADOS.md), em duas orientações declaradas. RK, KR, SK e KS têm casos quadráticos verificados; CK, KC e KK continuam sem fixture positiva validada. A presença das 16 entradas no catálogo não equivale a um solver global certificado.
