# Cadeias tradicionais e admissibilidade

Este capítulo consolida a aplicação do [texto-base](CONSTRUCAO_TRADICIONAL.md). O objeto é uma cadeia orientada nos estados e sua realização física. Não utiliza a construção topológica. Os critérios abaixo são contratos matemáticos; sua declaração não implementa um solver automático.

A [classificação dos nove saltos](CLASSIFICACAO_DOS_SALTOS.md) é aplicada a cada interface e não deve ser confundida com o catálogo de blocos desta seção. O [contrato de implementação](IMPLEMENTACAO_16_CADEIAS.md) especifica a próxima etapa no espaço de estados.

## 1. Dados completos de um problema

Registrar F, domínio Ω, U_L e U_R; a região espectral percorrida; as famílias e seus domínios de regularidade; e o modelo de admissibilidade A. A deve especificar quais condições são exigidas de cada espécie de onda. Pode incluir Lax, Liu, uma classe de pares de entropia, perfis de uma regularização fixada e, para os choques não clássicos a que se aplica, relação cinética e eventual regra de nucleação.

Esses critérios não são escolhas intercambiáveis nem botões independentes que automaticamente produzem uma teoria bem posta. Declarar a combinação e a referência que justifica seu uso. Não exigir uma desigualdade estrita de Lax de um contato ou de uma junção sônica.

## 2. Registro de uma onda

Representar cada onda E_j pelos estados de entrada U_{j−1} e saída U_j, espécie, família quando definida e intervalo de velocidades I_j=[a_j,b_j]. Para um salto ou contato, a_j=b_j=s_j. Para um leque expansivo, a_j=λ_i(U_{j−1}) e b_j=λ_i(U_j). Uma composta deve ser desdobrada em seus segmentos elementares, com os estados internos e as bordas comuns explícitos.

Uma ligação de amplitude zero é a identidade e deve ser removida da lista de ondas físicas. O estado constante resultante permanece permitido. A comparação de famílias exige autovalores simples; perto da coincidência, suspender rótulos não justificados.

## 3. Condições de uma cadeia

Uma cadeia finita U₀=U_L,…,U_m=U_R deve satisfazer simultaneamente:

1. **Fechamento nos estados:** a saída de cada segmento é exatamente a entrada do próximo e os extremos são os dados iniciais.
2. **Equações de cada segmento:** Rankine–Hugoniot nos saltos; equação característica e orientação expansiva nos leques; definição de contato ou composta quando pertinente.
3. **Ordenação física:** b_j≤a_{j+1}. Se a desigualdade é estrita, inserir o patamar U_j entre as velocidades. Igualdade requer compatibilidade dos traços na mesma borda.
4. **Seleção:** cada segmento satisfaz as condições que o modelo A exige dele, nos domínios declarados.
5. **Cobertura e limites:** estados e velocidades permanecem limitados, dentro dos domínios das definições utilizadas; a cadeia não atravessa uma região excluída sem teoria adicional.

Se dois saltos consecutivos têm a mesma velocidade, não existe patamar intermediário de largura positiva. O perfil físico contém um único salto entre os traços exteriores. Verificar novamente a seleção para esse salto exterior; duas produções entrópicas se somam, mas uma relação cinética ou condição de família não precisa ser preservada pela fusão. Não registrar duas interfaces distintas na mesma posição.

## 4. Catálogo de padrões

As letras R, S e C significam rarefação, choque e contato. K é uma composta desdobrável. Os índices identificam famílias quando justificadas. Os padrões abaixo são possibilidades a verificar, não garantias de existência para todos os dados.

| Padrão | Equações para o intermediário U_M | Ordenação de velocidades | Seleção específica |
|---|---|---|---|
| R₁R₂ | U_M na curva integral 1 de U_L; U_R na curva integral 2 de U_M | λ₁(U_M)≤λ₂(U_M) | Crescimento ao longo de cada leque; critérios entrópicos do modelo |
| S₁R₂ | RH(U_L,U_M,s₁); curva integral 2 de U_M a U_R | s₁≤λ₂(U_M) | Selecionar o choque pelo modelo A; leque expansivo |
| R₁S₂ | Curva integral 1 de U_L a U_M; RH(U_M,U_R,s₂) | λ₁(U_M)≤s₂ | Leque expansivo; selecionar o choque pelo modelo A |
| S₁S₂ | Duas relações de RH com o mesmo U_M | s₁<s₂ para patamar positivo | Verificar cada choque, sem inferir entropia da conservação |
| C_i combinado com R ou S | Curva de contato e curva da outra onda | Usar a velocidade constante do contato e as bordas da outra onda | Degenerescência linear no trecho; RH e seleção da outra onda |
| R_iS_i ou S_iR_i sônico | Curva integral e RH no estado de junção | Igualdade entre s e a borda adjacente λ_i | Compatibilidade sônica, orientação do leque e seleção do salto |
| Cadeia contendo K | Desdobrar cada K em ondas elementares | Ordenar todos os segmentos internos e externos | A sonicidade não substitui a admissibilidade |
| Cadeia com choque não clássico | RH e restrição cinética no choque indicado | Ordenar com todos os demais segmentos | Entropia e relação cinética especificadas; nucleação quando exigida |

No regime local estritamente hiperbólico com famílias genuinamente não lineares ou linearmente degeneradas, a construção por famílias 1 e 2 é a referência de organização. Grandes amplitudes, campos com inflexões e modelos não clássicos podem exigir padrões mais longos; esta tabela não afirma uma classificação exaustiva.

### 4.1. Matriz completa dos tipos de dois blocos

Uma composta K é um bloco de ondas, não uma nova onda elementar. Assim, o catálogo de dois blocos deve considerar todas as combinações ordenadas dos tipos R, S, C e K:

| Primeiro bloco / segundo bloco | R | S | C | K |
|---|---|---|---|---|
| R | R–R | R–S | R–C | R–K |
| S | S–R | S–S | S–C | S–K |
| C | C–R | C–S | C–C | C–K |
| K | K–R | K–S | K–C | K–K |

Essa matriz é completa apenas como lista formal de dois tipos de bloco. A existência de cada padrão depende do fluxo, dos dados, das famílias, dos ramos e da admissibilidade. Em uma organização por duas famílias, escrever, por exemplo, K₁–K₂ ou R₁–K₂; não presumir que qualquer sequência dos mesmos tipos seja realizável na mesma família.

Para qualquer par A–B, encontrar U_M que seja saída de A a partir de U_L e entrada de B até U_R. Definir I(A)=[a_A,b_A] e I(B)=[a_B,b_B] a partir de todos os segmentos dos blocos. Exigir b_A≤a_B, além das condições internas de cada bloco. Em K–K, determinar separadamente os estados de junção sônica e os segmentos de ambas as compostas, verificar cada um e só então colar as duas pelo estado U_M.

R–K, K–R, S–K, K–S, C–K e K–C seguem a mesma regra. A relação cinética é aplicada somente aos choques para os quais o modelo a exige, inclusive dentro de uma composta. O rótulo K não autoriza pular o teste de nenhum segmento.

### 4.2. Famílias, fusão e cadeias maiores

Contatos de famílias distintas podem ocupar interfaces diferentes e formar C₁–C₂. Dois contatos consecutivos no mesmo trecho integral de uma família linearmente degenerada têm a mesma velocidade e se reduzem fisicamente a um único contato entre os estados exteriores. Contatos em ramos distintos ou em degenerações precisam de análise própria.

Rarefações consecutivas da mesma família, sobre a mesma curva integral e com orientação compatível, podem se fundir em um único leque. Da mesma forma, dois blocos compostos consecutivos da mesma família podem ser partes de um bloco maior. Não contar decomposições editoriais diferentes como soluções físicas diferentes sem comparar os perfis.

Para m blocos, admitir palavras finitas E₁…E_m com E_j em {R,S,C,K}, família e dados internos identificados, sujeitas às condições da seção 3. Isso permite R–K–C, K–S–K e outras sequências sem afirmar sua existência para um fluxo específico. Uma enumeração finita só fornece cobertura se houver prova de que o domínio e o modelo escolhido excluem os padrões não enumerados.

### 4.3. Exemplo exato de contato–contato

No fluxo linear F(u,v)=(u,2v), as duas famílias são linearmente degeneradas, com velocidades 1 e 2. Os estados (0,0)→(1,0)→(1,1) formam C₁–C₂. O perfil W é (0,0) para ξ<1, (1,0) para 1<ξ<2 e (1,1) para ξ>2. Cada salto satisfaz RH. O par estritamente convexo η=(u²+v²)/2, q=u²/2+v² é compatível e tem produção nula nos dois contatos. Portanto, essa cadeia é uma solução fraca que satisfaz esse par. Esse fluxo pertence à família de dez coeficientes do aplicativo; isso não implica que a interface já tenha um solver de contatos.

### 4.4. Exemplos exatos com duas compostas e rarefação–composta

Para mostrar a possibilidade de K–K sem presumir que já foi demonstrada para o fluxo quadrático geral, considere o exemplo didático cúbico desacoplado

$$
F(u,v)=(u^3,v^3+20v).
$$

Esse exemplo está fora do grau implementado pelo aplicativo. Em |u|,|v|≤2, as velocidades são λ₁=3u² e λ₂=3v²+20, com separação estrita entre as famílias.

Para a primeira componente, o choque −2→1 tem velocidade 3, pois (1³−(−2)³)/(1−(−2))=3. Sua velocidade coincide com a borda da rarefação 1→2, que ocupa [3,12]. Forma-se K₁=S₁R₁, sônica no estado de junção. Para a segunda componente, o mesmo padrão é transladado em velocidade por 20: o choque −2→1 tem velocidade 23 e a rarefação 1→2 ocupa [23,32], formando K₂=S₂R₂.

A cadeia de blocos (-2,-2)→(2,-2)→(2,2) é, portanto, K₁–K₂, com os estados internos (1,-2) e (2,1). Seu perfil pode ser escrito W(ξ)=(w(ξ),w(ξ−20)), onde

$$
w(\xi)=\begin{cases}-2,&\xi<3,\\\sqrt{\xi/3},&3<\xi<12,\\2,&\xi>12.\end{cases}
$$

Cada choque satisfaz RH, cada leque satisfaz a equação de similaridade e 12<23 ordena os blocos. O par η=(u²+v²)/2, q=3u⁴/4+3v⁴/4+10v² é compatível e estritamente convexo. Em cada choque, a produção é −27/4; os termos associados à translação de velocidade se cancelam na segunda componente. A proposição de colagem demonstra uma solução fraca satisfazendo esse par. A junção sônica não é uma desigualdade estrita de Lax e o exemplo não é apresentado como seleção por relação cinética.

No mesmo fluxo, os estados (1,-2)→(2,-2)→(2,2) produzem R₁–K₂: o primeiro leque ocupa [3,12] e a composta ocupa [23,32]. Assim, rarefação–composta e composta–composta são padrões efetivos, não apenas entradas formais da matriz. A existência desses exemplos não demonstra que tais padrões ocorram em todo preset quadrático.

## 5. Como aplicar cada admissibilidade

| Condição | Dados necessários | Conclusão matemática possível | Limite da conclusão |
|---|---|---|---|
| Rankine–Hugoniot | F, dois estados e s | Conservação na interface | Não seleciona admissibilidade |
| Lax estrito | Estados estritamente hiperbólicos e desigualdades da família | Choque estrito de Lax nos extremos | Não prova sozinho um teorema global de entropia ou unicidade |
| Liu orientado | Ramo inteiro de Hugoniot, estado fixado e sentido de percurso | Desigualdade de velocidade em todo o arco | Amostras finitas não bastam para prova contínua |
| Entropia | Par ou classe compatível e convexidade no domínio | Sinal da produção nos saltos e desigualdade da cadeia | Um par pode não selecionar todo o sistema |
| Perfil viscoso | B, órbita com assíntotas e condições de dissipação | Existência daquele perfil e produção entrópica nas hipóteses demonstradas | Não prova convergência viscosa da solução completa |
| Relação cinética | Modelo, domínio, orientação e lei especificada | Conexão selecionada conforme essa lei | Não implica existência ou unicidade global do solver |

Para Liu, uma prova possível é parametrizar exatamente o arco e demonstrar s(a*)≤s(a) em todo o segmento. Se s é C¹, demonstrar monotonicidade no sentido percorrido é uma condição suficiente; também se podem comparar extremos e todos os pontos críticos quando se prova que essa lista é completa. Refinar uma lista numérica de pontos críticos não demonstra sua completude.

## 6. Proposição de validação de uma cadeia

Suponha uma cadeia finita com choques e contatos de velocidade finita, leques C¹ e patamares constantes. Suponha valores em um compacto de Ω, suporte de velocidades limitado e as condições 1–3 e 5 da seção 3, depois de resolver interfaces coincidentes. Então a realização U(x,t)=W(x/t) é uma solução fraca com o traço de Riemann.

Se, adicionalmente, cada salto satisfaz [q]−s[η]≤0 para todo par da classe especificada e os trechos suaves têm compatibilidade Dq=Dη DF, a cadeia satisfaz as desigualdades dessa classe. Se o modelo A exige outras condições nos saltos, elas devem ser verificadas separadamente para declarar a cadeia admissível segundo A.

**Demonstração.** A integração por partes em cada região anula os termos de volume pela EDP. Nas interfaces restam [F]−s[U], nulos por RH, ou bordas contínuas. O traço inicial decorre de a diferença para o degrau ficar contida em |x|≤Mt com valores limitados, dando norma L¹ local O(t). Na identidade entrópica, os termos concentrados são precisamente [q]−s[η]; somar termos não positivos fornece a desigualdade. Condições cinéticas não são consequência dessa soma. O argumento prova o perfil construído, não unicidade entre todas as soluções.

## 7. Quatro padrões exatos para o mesmo fluxo

Use F(u,v)=(u²/2,v²/2+3u/4), na região u>v. Os autovalores são λ₁=v e λ₂=u. As curvas da família 1 são verticais: u constante. Para uma conexão vertical v_a→v_b, RH fornece s=(v_a+v_b)/2. O ramo rápido R(α)=(α,α−3/4) tem velocidade α crescente.

| Padrão | U_L | U_M | U_R | Velocidades |
|---|---|---|---|---|
| R₁R₂ | (0,−1) | (0,−3/4) | (1,1/4) | Primeiro leque [−1,−3/4]; segundo [0,1] |
| S₁R₂ | (0,−1/2) | (0,−3/4) | (1,1/4) | Choque −5/8; leque [0,1] |
| R₁S₂ | (2,−1) | (2,0) | (0,−1) | Leque [−1,0]; choque 1 |
| S₁S₂ | (2,1) | (2,0) | (0,−1) | Choques 1/2 e 1 |

**Verificação.** Nos leques verticais W(ξ)=(u_constante,ξ), DF(W)W'=ξW'. No leque rápido W(ξ)=(ξ,ξ−3/4), a mesma identidade vale com W'=(1,1). Os choques verticais descendentes são estritamente Lax 1 nos estados indicados. O choque (2,0)→(0,−1), s=1, tem diferença de fluxos igual ao salto (−2,−1) e espectros (0,2) e (−1,0), portanto é estritamente Lax 2. Todos os suportes estão ordenados. A proposição anterior demonstra quatro soluções fracas para os respectivos dados.

O par η=u²/2, q=u³/3 é compatível e convexo, com Hessiana diag(1,0). Nos saltos verticais a produção é zero; no salto rápido listado é −2/3. Portanto, as quatro cadeias satisfazem esse par. Essa conclusão é específica: o par não é estritamente convexo e não fornece certificação geral de unicidade. Os choques listados também satisfazem Liu nos ramos seguintes, sem depender de amostragem.

**Liu vertical.** Com v_a fixo, parametrize v(a)=v_a+a(v_b−v_a), 0≤a≤1. A velocidade s(a)=(v_a+v(a))/2 decresce quando v_b<v_a; logo s(1)≤s(a).

**Liu do choque rápido.** Fixe U_a=(2,0). No ramo que sai na direção rápida, escreva v=−h, 0<h≤1. A condição escalar de Hugoniot reduz a

$$
u(3+2h)=6-4h-2h^2.
$$

O ramo que parte de (2,0) é u(h)=2(1−h)(h+3)/(3+2h). Na primeira componente de RH, s(h)=(u(h)+2)/2=(6−h²)/(3+2h). Como u(h)≥0 para 0≤h≤1, segue s(h)≥1=s(1). Há limite s(0)=2; o critério vale em todo o arco escolhido, inclusive por continuidade na origem. Não se reivindica o critério em outros ramos.

## 8. Contatos e junção sônica: exemplos separados

Para F=(u²/2,3v), na região u<3, a família 2 é linearmente degenerada. A cadeia (1,0)→(2,0) por rarefação 1, velocidades [1,2], seguida do contato (2,0)→(2,1), s=3, é conservativa e ordenada. O par estritamente convexo η=(u²+v²)/2, q=u³/3+3v²/2 é compatível; a produção no contato é zero e a cadeia satisfaz esse par.

No fluxo triangular da seção 7, a conexão (0,3/4)→(0,−3/4), s=0, seguida do leque rápido até (1,1/4), tem uma borda sônica comum em ξ=0. O choque é característico nos dois extremos e não estritamente Lax. A solução fraca e um perfil viscoso B=I desse choque isolado foram demonstrados no estudo composto do projeto. Isso não o classifica automaticamente como choque não clássico selecionado por relação cinética.

## 9. Procedimento de resolução e relatório

1. Fixar o modelo A antes de procurar padrões e declarar os domínios excluídos.
2. Construir curvas integrais e ramos de Hugoniot ou perfis permitidos nesse domínio.
3. Resolver os estados intermediários para cada padrão considerado; conservar todas as raízes relevantes encontradas e identificar ramos ausentes ou não explorados.
4. Verificar cada segmento, a orientação, as velocidades e a seleção aplicável.
5. Montar W(ξ), tratar bordas coincidentes e conferir o traço inicial.
6. Emitir o relatório com hipóteses, dados, ramos e fundamento de cada conclusão. Não confundir existência de uma cadeia com completude da busca.

O relatório deve separar **solução fraca demonstrada**, **Lax demonstrado**, **Liu demonstrado no arco identificado**, **desigualdade demonstrada para os pares especificados**, **perfil demonstrado para a regularização escolhida** e **admissível segundo o modelo A**. Para cálculos aproximados, usar explicitamente **compatível numericamente**, **violação detectada** ou **inconclusivo**. Dados obrigatórios ausentes impedem a conclusão daquele critério, sem apagar outras conclusões já justificadas.

## 10. Correspondência com o aplicativo e pendências

| Construção ou critério | Evidência disponível | Limitação |
|---|---|---|
| Salto direto | `src/math/solution/directShockDiagnostic.js` | Conservação com tolerância, sem seleção geral |
| Rarefação física | `src/math/solution/rarefactionSolution.js` | Monotonicidade amostrada e interpolação |
| Dois choques e famílias | `src/math/solution/twoShockFamilyEvidence.js` | Evidência de Lax estrito nos extremos; `entropyCertified` permanece falso |
| Liu | `src/math/solution/liuArcAssessment.js` | `passes` permanece falso mesmo sem violação detectada |
| Compostas | `src/math/solution/compositeEvidence.js` | Evidência parcial, sem certificação entrópica geral |
| Estudos exatos | `scripts/wave-patterns-reference.mjs` e `scripts/advanced-reference.mjs` | Casos delimitados; não enumeram todos os padrões |

O catálogo acima amplia a documentação, não o algoritmo de busca do aplicativo. Contatos e todos os quatro padrões exatos não são apresentados como opções já implementadas. Continuam abertas as discrepâncias numéricas identificadas em `../architecture/TRACEABILITY.md`, a seleção cinética específica e a prova de cobertura global.

## 11. Fontes e natureza dos resultados

As regras de colagem e as contas dos exemplos foram deduzidas neste texto, sem reivindicar originalidade. As definições de Lax, Liu, entropia e perfis usam as convenções do texto-base. Na formulação não clássica, consultar LeFloch, revisão de 2010, definição 2.3 e equações (2.7)–(2.8): a relação cinética é imposta aos choques subcompressivos indicados pelo modelo, não a todas as ondas indiscriminadamente. A passagem para outros regimes exige verificar as hipóteses da fonte. [Referência consultada](https://arxiv.org/html/1002.2950v1).

A existência das curvas admissíveis e os teoremas de unicidade local não são substituídos pela tabela de padrões. A referência localizada e a distinção dos padrões por regime estão em [Resultados locais e regimes](RESULTADOS_E_REGIMES.md). A revisão por resultado das referências permanece registrada no [mapa bibliográfico](../BIBLIOGRAPHY.md).
