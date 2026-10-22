# Guia de leitura e dependências matemáticas

## Convenção editorial — Duas camadas sucessivas

A prioridade atual é a construção tradicional autônoma em docs/traditional/CONSTRUCAO_TRADICIONAL.md, com definições e deduções nos espaços de estados e físico, incluindo admissibilidade clássica e não clássica. A construção topológica será consolidada depois como segunda camada. Os capítulos atuais preservam o material já escrito; sua navegação ainda combina os assuntos e não substitui essa nova sequência de revisão.

A ordem sugerida de estudo acompanha os capítulos: problema de Riemann e fluxo quadrático geral → formulação fraca → espectro e rarefações → choques e admissibilidade → construção da Variedade de Ondas e suas cartas → superfícies e curvas especiais → campos, separatrizes e ondas compostas → cadeias de ondas → transformações e auditoria numérica.

## Convenção editorial — Coordenadas e referências internas

As definições analíticas partem de $(U_-,U_+,s)$; a construção geométrica emprega $(\bar U,X,Z,s)$, onde $(X,Z)=U_+-U_-$. As cartas locais são $(\tau,Y,z)$ e $(\eta,\widehat{Y},Z)$, conforme a seção 8 (capítulo IV, seção 2). A compactificação $z_{\mathrm c}$ é recurso de visualização, não uma terceira carta analítica. Objetos expressos na carta recíproca recebem exclusivamente o acento $\widehat{\phantom M}$, por exemplo $\widehat r,\widehat M,\widehat K,\widehat\Phi_\pm$; não se usa subscrito infinito para essa finalidade. O símbolo $\infty$ permanece apenas quando representa um limite matemático, como em perfis viscosos. Quando uma referência cita um número, ele designa a numeração global do título; a indicação entre parênteses identifica capítulo e posição dentro dele.

## Convenção editorial — Resultados e métodos

Usar construção tradicional para a formulação em leis de conservação, abrangendo as teorias clássica e não clássica de LeFloch, e construção topológica para a formulação sobre a Variedade de Ondas. Evitar clássica/topológica como oposição entre métodos. A expressão solução clássica permanece válida quando descreve regularidade de uma solução da EDP; não é um sinônimo de construção tradicional.

Definições estabelecem objetos; lemas, proposições, teoremas e corolários apresentam afirmações com hipóteses; demonstrações justificam as afirmações; observações descrevem interpretações; algoritmos e diagnósticos registram procedimentos computacionais e seus limites.

**Escopo** Os resultados demonstrados nesta referência são identidades e fatos elementares sob as hipóteses explicitadas. Não se afirma um teorema geral de existência, unicidade ou admissibilidade para todos os fluxos quadráticos e todos os dados de Riemann.

## Procedimento — Desenvolver uma construção a partir da documentação

O contrato detalhado e o mapa dos objetos estão em docs/FUNDAMENTACAO_E_CONSTRUCAO.md. A teoria de ondas deve declarar a seleção clássica ou não clássica; objetos intrinsecamente geométricos devem declarar sua própria origem. Para cada passagem à variedade, nomear a operação, definir seus mapas e demonstrar a correspondência no domínio indicado. LeFloch orienta o estudo da seleção; as referências da Variedade de Ondas orientam a construção geométrica, com seus próprios domínios de validade.

Começar pela definição, o domínio e a família de fluxos. Identificar a construção no espaço de estados e as referências que a justificam. Explicitar então seu levantamento à variedade, as projeções e as mudanças de carta necessárias. Só depois definir o algoritmo e sua realização gráfica, indicando os critérios de admissibilidade e as hipóteses ainda não demonstradas.

Para cada implementação, manter a ligação entre fórmula, módulo matemático, teste ou auditoria e representação nos três espaços. Uma mudança de equação deve atualizar essas ligações. Uma mudança de visualização deve preservar os dados científicos e ser conferida na aplicação renderizada.

## Convenção editorial — Fontes e procedência

Os arquivos Markdown são a fonte dos textos exibidos na Documentação e na Ajuda. A referência LaTeX reunida em main.tex continua sendo a base canônica das fórmulas do núcleo; a migração de formato não equivale a encerrar sua revisão científica. O guia README.md de docs/mathematics descreve as responsabilidades das fontes, e docs/architecture/TRACEABILITY.md relaciona fórmulas, código e evidências.

As referências bibliográficas e a localização dos resultados da literatura ainda precisam de consolidação. Até isso ser feito, este texto não deve ser apresentado como uma revisão bibliográfica completa ou como prova de originalidade das construções na variedade. Resultados da literatura, deduções expostas no projeto e hipóteses de pesquisa devem ter sua procedência identificada individualmente.

## Pendências científicas e de verificação

A documentação registra limitações concretas: a barreira de Lax para fronteiras e coincidências já foi corrigida e testada; o resíduo recíproco de compostas perto de $Z=0$ também foi corrigido e ganhou regressão; rótulos algébricos de dupla sônica incluem convenções distintas sobre salto nulo. Esses itens estão detalhados na rastreabilidade e nos capítulos correspondentes. Registrá-los não corrige os algoritmos.

A migração dos 26 textos para Markdown está concluída. Permanecem a revisão bibliográfica, a inspeção visual dos ambientes e a ampliação das validações por classe de fluxo, degeneração e sequência de ondas. O objetivo de representar todas as soluções na variedade exige declarar a cobertura alcançada e os casos ainda abertos.

## Mapa final desta etapa editorial

docs/DOCUMENTATION_COVERAGE.md relaciona os 26 capítulos, sua procedência, exemplos e limites. Os estudos de caso agora incluem choque, rarefação, dois choques, conexão composta degenerada, perfil viscoso isolado, separatrizes, degenerações da cônica e transformação afim. Os dados e scripts estão em docs/examples/README.md.

docs/NOTACAO.md consolida os símbolos, os usos distintos de P, D, Z e A e as convenções que precisam ser traduzidas ao comparar artigos. O glossário do aplicativo usa $\Delta$ para o discriminante e identifica as sônicas pelo extremo correspondente, evitando confundi-las com o sinal da velocidade.

O fechamento editorial significa que cada bloco tem uma responsabilidade identificada e suas limitações foram registradas. Ele não significa encerramento da investigação, revisão bibliográfica exaustiva, inspeção visual aprovada ou correção dos algoritmos apontados como pendentes.
