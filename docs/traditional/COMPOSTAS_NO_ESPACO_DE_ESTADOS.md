# Blocos compostos diretamente no espaço de estados

## Escopo implementado

`compositeBlockChainCandidates.js` acrescenta uma busca limitada para RK, SK, CK, KR, KS, KC e KK. Nesta versão, o bloco K lento à esquerda é rarefação–choque e o bloco K rápido à direita é choque–rarefação. Não se afirma cobertura de todas as orientações ou de compostas com mais segmentos internos.

Os estados sônicos são calculados por equações do fluxo quadrático nos estados, sem coordenadas da Variedade de Ondas. As rarefações continuam amostradas, e os choques ordinários dos padrões SK/KS usam as curvas de Hugoniot fornecidas ao buscador. A origem dessas curvas pode continuar dependendo dos módulos de projeção existentes.

## Parceiros sônicos de amplitude finita

Fixe um estado P, uma família simples i e s=λ_i(P). Escreva V=P+ar, B=DF(P)−sI e H(r)=D²F[r,r]. Para o fluxo quadrático, RH equivale, fora de a=0, a

$$
Br+\frac a2H(r)=0.
$$

Quando H(r) não se anula, uma condição necessária é det(Br,H(r))=0. Em r=(z,1), essa condição é um polinômio de grau no máximo três. A carta algébrica r=(1,Z) cobre a direção omitida; as soluções são deduplicadas nos estados. Uma vez encontrada a direção unitária, recuperar

$$
a=-\frac{2\langle Br,H(r)\rangle}{\|H(r)\|^2}.
$$

**Demonstração.** Expanda F(P+ar)−F(P)=aDF(P)r+a²H(r)/2, subtraia sa r e divida por a. A colinearidade fornece o polinômio; o produto escalar com H fornece a amplitude. Cada candidato ainda precisa passar pela equação vetorial de RH, pois raízes aproximadas ou degeneradas podem não satisfazê-la.

O construtor rejeita saltos pequenos, direções com H próximo de zero, espectros insuficientemente separados e conexões que falham nas desigualdades não estritas de Lax adotadas para o choque sônico. Polinômios identicamente nulos e famílias contínuas de parceiros não são enumerados. Portanto o algoritmo não é uma prova de completude.

## Curvas de saída e entrada de K

Na construção lenta progressiva, percorrer a rarefação de U_L até P e calcular os parceiros V, com choque P→V sônico no lado esquerdo. Cada V é uma saída candidata do bloco K. Na construção rápida retrospectiva, percorrer a rarefação desde U_R para trás até P e calcular V, com choque V→P sônico no lado direito; cada V é uma entrada candidata.

As raízes são acompanhadas entre amostras consecutivas por distância limitada, sem ligar desaparecimentos de raízes. Esse acompanhamento é uma heurística de continuação numérica, não uma classificação dos ramos. Uma quantidade máxima de amostras e ramos limita a busca; os limites ficam registrados no candidato.

Para cada par de blocos, intersectar as curvas de saída e entrada, refinar localmente os dois parâmetros por Newton amortecido dentro dos segmentos identificados e reconstruir os segmentos internos. Verificar novamente RH, sonicidade, família, monotonicidade amostrada, tangência e ordenação. Uma interseção geométrica sozinha não produz um candidato aceito.

O corretor usa interpolação das curvas integrais fornecidas, não reintegração conjunta certificada das EDOs. Interseções tangenciais ou não isoladas podem não ser resolvidas. Os choques ordinários continuam sujeitos a um teste estrito de Lax; sua incidência de RH é reavaliada e pode rejeitar uma interseção de poligonais imprecisa.

## Representação física e distinção de seleção

O perfil preserva a lista de segmentos e os dois blocos. Uma junção interna pode ter velocidade igual entre leque e choque. No valor exato da velocidade de um choque, a avaliação usa o traço direito, mesmo quando esse valor também é a borda do leque anterior. Entre os dois blocos, esta versão exige uma margem de velocidade estritamente positiva; junções de blocos com margem zero permanecem fora do buscador.

Cada leque é desenhado separadamente no plano de estados e no espaço físico. Um segmento pontilhado entre extremos de um choque no plano é identificado como referência, não como arco de Hugoniot reconstruído. As junções sônicas são destacadas e os choques não são interpolados através do salto nos perfis.

O relatório mantém `entropyCertified: false`. Lax não estrito nos extremos sônicos é apenas um teste necessário adotado nesta busca; Liu contínuo, perfil difusivo–dispersivo e relação cinética não são deduzidos dessa verificação.

## Casos verificados e disponibilidade

| Padrão | Evidência desta etapa | Restrição |
|---|---|---|
| KR | Caso quadrático no preset B₁=8, B₂=0, a=0, c=1; junção (1,−1), saída de K próxima de (1,1) | Rarefações numéricas e busca local |
| RK | Mesmo preset; junção rápida ((1−√71)/7,0), entrada de K próxima de (−1,−1) | Rarefações numéricas e busca local |
| SK, KS | Casos quadráticos com curvas de Hugoniot fornecidas e verificação separada dos dois choques | Não demonstram cobertura da amostragem usada na interface |
| KK | Receita de composição e validação implementada | Sem caso positivo validado nesta etapa; não declarar suporte científico fechado |
| CK, KC | Entradas de busca implementadas | Contatos restritos ao modelo de direção constante; sem caso positivo validado nesta etapa |

Não se conclui a existência dos 16 padrões para um mesmo fluxo ou dado inicial. As entradas formais, a existência de um construtor e a verificação de um caso positivo são estados distintos de disponibilidade.

## Correção independente do resíduo recíproco

A busca antiga de compostas usava Z²Φ=ZΦ̂, que podia produzir resíduos artificialmente pequenos perto de Z=0. `sonic/reciprocalSonic.js` agora avalia diretamente

$$
\widehat\Phi_\pm=\Upsilon\det\widehat M\ \pm\ 2\widehat K,
\qquad \widehat\Phi_\pm=Z\Phi_\pm\quad(Z\ne0).
$$

Aqui M̂=D²F[(1,Z),·] e K̂ é o termo misto do determinante de DF(Ū)−sI com M̂. A fórmula é regular em Z=0 quando a carta é regular. A bisseção só aceita uma raiz se o próprio resíduo atingir a tolerância; encurtar o intervalo não basta. A regressão com b₂₀=0,3, registrada na rastreabilidade, deixa de certificar a falsa raiz na fronteira.

Esta correção melhora os diagnósticos topológicos existentes, mas a nova construção de parceiros sônicos não depende deles. As duas implementações mantêm seus escopos separados.

## Reprodução

`tests/compositeBlockChainCandidates.test.js` contém os dados, a integração dos arcos e os casos RK/KR/SK/KS. `tests/reciprocalCompositeResidual.test.js` confere a transição do fator sônico e rejeita o antigo falso certificado. `tests/stateSpaceChainsRendering.test.js` verifica a seleção de KR na vista de estados e os dois leques no componente físico.
