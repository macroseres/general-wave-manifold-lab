# Cobertura editorial e científica da referência

Este mapa cobre os 26 capítulos exibidos. “Revisado” significa texto organizado com hipóteses e limites identificados; não significa validação global do software ou demonstração de todos os regimes. Os exemplos são casos delimitados, não uma base completa de soluções.

| Capítulo | Base / procedência | Evidência ou exemplo | Limite principal |
|---|---|---|---|
| 1. Formulação de Riemann | Definição e dedução por regra da cadeia | Equação de similaridade renderizada | Ansatz não demonstra existência/unicidade |
| 2. Soluções fracas | Dedução por integração por partes | Rankine–Hugoniot nos exemplos de choques | Regularidade e traços declarados |
| 3. Espectro | Polinômio característico 2×2 | Fluxos dos fixtures e diagnósticos do núcleo | Separar sinal exato de tolerância |
| 4. Leques | Regra da cadeia e função inversa | Leque exato do capítulo 17 | Derivada positiva no enunciado suave |
| 5. Hugoniot/Lax | Desigualdades e contagens deduzidas | Choque Lax 2 e cadeia Lax 1–2 | Classificador de contagens tem limitação nas fronteiras |
| 6. Entropia | Compatibilidade e medida de salto deduzidas | Par semidefinido do fluxo triangular | Um par não seleciona todo o sistema |
| 7. Variedade | WM-01 §2.2 e construção na convenção do app | Levantamento do choque do capítulo 11 | Diagonal bruta não equivale ao prolongamento |
| 8. Coordenadas | Identidade quadrática e expansão P,Q,R | Fórmulas ligadas aos módulos de cartas | Falha se N=0; não estender a fluxos arbitrários |
| 9. Carta finita | Parametrização e velocidade deduzidas | Ponto exato (-1/8,-1,2) | Uma carta regular não cobre todas as direções |
| 10. Projeções | Definições e reconstrução de extremos | Fixtures de Hugoniot e rarefação | Estado isolado não determina onda única |
| 11. Fibras | WM-01 §2.2/2.4, RP-01 e dedução própria da convenção | Figura, fixture e `hugoniotReferenceExample.test.js` | Somente ramo e ponto especificados |
| 12. Imagem de fibras | Consequência das projeções fixadas | Mesmo ramo projetado | Imagem desenhada não certifica cobertura global |
| 13. Recíproca | Homogeneização e transição deduzidas | Ponto exato nas duas cartas | Divisão por Z só na sobreposição |
| 14. Coincidência | Álgebra de autovalor duplo | Exemplos escalar/não escalar do capítulo 22 | Raiz não isolada pode escapar da detecção |
| 15. Sônicas | Expansão exata de determinantes | Resíduos do núcleo e exemplo duplamente sônico | Distinguir determinantes completos e fatores reduzidos |
| 16. Inflexão/DS | Relação K/derivada própria e eliminação | Auditorias do núcleo, caso degenerado do capítulo 19 | Simplicidade espectral e posto não são automáticos |
| 17. Rarefação | WM-01 §4.1, RP-01 e dedução triangular | Leque exato, figura e `wavePatternsReference.test.js` | Perfil afim especial; não cobre curvas genéricas |
| 18. Separatrizes | ODE-01, campo recíproco derivado | Ramo estável exato e quatro metades numéricas | Aproximação local das instáveis, sem prova global |
| 19. Compostas | WM-01 §4.4, diferenciação de RH e caso explícito | Junção sônica exata, perfil B=I, `advancedReference.test.js` | Caso degenerado; não certifica todas as saturadas |
| 20. Cadeias | Colagem fraca e traço inicial demonstrados, RP-01 | Dois choques exatos e teste de cobertura da carta | Outra parametrização necessária para o primeiro salto |
| 21. Afins | Regra da cadeia, similaridade e Hessiana deduzidas | Transformação reproduzível e teste avançado | Invariância exata não elimina condicionamento |
| 22. Classificação | Discriminante e quadrados completos | Elipse, ponto, retas paralelas e reta dupla | Corte de parâmetros não classifica todas as soluções |
| 23. Diagnósticos | Critérios de reprodução e escala de resíduos | Geradores JSON e pendências concretas | Resíduo pequeno não mede sempre erro geométrico |
| 24. Auditoria | Critérios e hipóteses de regularidade | Rastreabilidade, testes e exclusões | Critério documentado não é auditoria concluída |
| 25. Ambientes | Contrato funcional confrontado com componentes | Registro comum de Ajuda/Documentação | Inspeção visual integrada ainda pendente |
| 26. Guia | Contrato editorial e mapa de fontes | Este índice e BIBLIOGRAPHY.md | Revisão bibliográfica por resultado segue incremental |

## O que foi concluído nesta etapa

Os textos usam Markdown compartilhado; as equações são renderizadas; os blocos principais possuem deduções, exemplos delimitados ou procedimentos de revisão; fontes consultadas têm versão/localização e ressalvas de transporte. Os estudos reproduzíveis cobrem choque, rarefação, cadeia de choques, conexão sônica degenerada, perfil viscoso isolado, separatrizes, classificações e uma transformação afim.

Os resultados dos geradores e os testes complementam as contas. Não certificam classificação de todas as soluções para todo fluxo, regularidade de todos os ramos ou validade de toda a documentação apenas por compilação.

Na verificação final desta etapa, lint, 746 testes e build passaram. As figuras exportadas foram inspecionadas como imagens; isso não substitui a conferência da página integrada. O build mantém o aviso de tamanho do pacote JavaScript.

## Pendências separadas do fechamento editorial

| Pendência | Próxima ação | Registro |
|---|---|---|
| Lax estrito nas fronteiras | Corrigir a verificação de simplicidade e igualdade no classificador | TRACEABILITY.md |
| Resíduo recíproco de compostas | Avaliar o fator canônico sem zero artificial perto de Z=0 | TRACEABILITY.md, capítulo 19 |
| Parametrizações degeneradas | Construir cartas adicionais ou representação intrínseca para conexões válidas | Capítulos 19 e 20 |
| Cobertura numérica global | Definir classes, domínios, sequências e critérios, com provas ou auditorias delimitadas | OBJETIVOS_E_ESCOPO.md |
| Bibliografia por resultado | Ampliar fontes primárias, versões e correspondências; sem reivindicar originalidade sem pesquisa específica | BIBLIOGRAPHY.md |
| Página renderizada | Conferir desktop/mobile, busca, figuras e leitura; a tentativa anterior não mostrou este projeto | Guia da referência |

Referências: [bibliografia](BIBLIOGRAPHY.md), [rastreabilidade](architecture/TRACEABILITY.md), [dados e comandos](examples/README.md), [objetivos](OBJETIVOS_E_ESCOPO.md).

## Método de fundamentação dos objetos

O mapa em [FUNDAMENTACAO_E_CONSTRUCAO.md](FUNDAMENTACAO_E_CONSTRUCAO.md) passa a orientar a revisão dos 26 capítulos. Ele registra a definição de origem, as operações na variedade e a obrigação de correspondência para cada bloco. A incorporação desse método não encerra a conferência bibliográfica por resultado nem demonstra equivalências globais. Os capítulos 6, 7, 19 e 26 receberam as distinções e definições centrais nesta etapa.

## Primeira camada: construção tradicional

A referência em [traditional/README.md](traditional/README.md) organiza a construção tradicional independentemente da variedade. O texto-base inclui os objetos tradicionais que antes estavam distribuídos entre os capítulos, acrescenta contatos e formaliza a condição orientada de Liu, os perfis regularizados e a composição local condicional. Os 26 capítulos existentes continuam preservados e não foram reorganizados na interface nesta etapa. A revisão bibliográfica por resultado e a determinação da seleção não clássica permanecem necessárias antes do fechamento científico.

## Cadeias e critérios na camada tradicional

[Cadeias e admissibilidade](traditional/CADEIAS_E_ADMISSIBILIDADE.md) consolida os padrões, o procedimento de resolução, as condições de colagem e os limites de cada conclusão. Os exemplos R–R, S–R, R–S e S–S possuem verificação explícita, incluindo Liu nos arcos declarados. A documentação não amplia automaticamente a cobertura do solver do aplicativo nem encerra a revisão bibliográfica ou a seleção não clássica específica.

## Revisão local e direção não clássica

[Resultados locais e regimes](traditional/RESULTADOS_E_REGIMES.md) registra a referência do solver clássico local, as deduções de pequenos choques e sua entropia, as hipóteses por regime e a classe difusão–dispersão escolhida pelo usuário. O exemplo não clássico escalar cúbico é um estudo próprio de verificação, fora do fluxo quadrático implementado. Os coeficientes B,C do modelo do aplicativo e sua seleção cinética permanecem abertos; não se declara conclusão científica global.

## Base para implementar as 16 combinações

A primeira camada agora inclui [os nove tipos de salto](traditional/CLASSIFICACAO_DOS_SALTOS.md) e o [contrato das 16 combinações](traditional/IMPLEMENTACAO_16_CADEIAS.md). A classificação possui nove fixtures de RH no modelo quadrático; os testes verificam os espectros e a orientação. O contrato permite iniciar o solver por entradas e regimes, com fronteiras e critérios inconclusivos explícitos. A seleção cinética específica e a classificação global continuam como pesquisa; não são condições já resolvidas por esta consolidação.

## Contatos na implementação tradicional

[Contatos de direção constante](traditional/CONTATOS_DIRECAO_CONSTANTE.md) registra o modelo restrito que habilita RC, SC, CR, CS e CC. A classificação requer um critério nos coeficientes, além de RH e família simples; não usa sonicidade isolada como definição de contato. O espaço de estados pode ser aberto sem carta regular da variedade. Campos linearmente degenerados de direção variável e construção geral de K continuam pendentes.

## Blocos compostos na implementação

[Compostas no espaço de estados](traditional/COMPOSTAS_NO_ESPACO_DE_ESTADOS.md) registra o cálculo dos parceiros sônicos, as duas orientações de K suportadas, o refinamento local das interseções e as limitações de cobertura. RK/KR/SK/KS têm testes positivos quadráticos; CK/KC/KK ainda não têm exemplos positivos validados nesta etapa. A correção do falso resíduo recíproco está acompanhada por testes independentes de transição e fronteira.
