# Coincidência, direções duplas e degenerações

## Definição — Autovalores e direções características

Para cada estado $U$, os autovalores são as raízes de $\det(DF(U)-\lambda I)=0$. Na região estritamente hiperbólica, em que $\Delta(U)>0$, ordenam-se como $\lambda_s(U)<\lambda_f(U)$. Uma direção característica da família $i\in\{s,f\}$ é uma reta própria $[r_i(U)]\in\mathbb{RP}^1$.

## Definição — Levantamento característico

Na Variedade de Ondas desingularizada, a característica é o levantamento dos pares estado–direção própria, e não simplesmente a diagonal dos pares de estados:

$$
\mathcal C=\{(U,[r]):DF(U)r=\lambda r\text{ para algum }\lambda\in\mathbb R\}.
$$

Na carta finita, corresponde a $Y=0$ juntamente com a equação projetiva. Sobre a região estritamente hiperbólica, esse levantamento se decompõe nas folhas $\mathcal C_s$ e $\mathcal C_f$, associadas aos autovalores ordenados.

## Proposição — Correspondência local entre as duas descrições

Se o autovalor é simples e a direção própria pertence à carta escolhida, a aplicação $U\mapsto(U,[r_i(U)])$ parametriza localmente a folha característica da família i. Essa identificação pode deixar de ser unívoca no lugar de coincidência.

**Demonstração.** Um autovalor simples de uma matriz que depende suavemente do estado admite localmente autovalor e reta própria suaves. A equação projetiva da carta é exatamente a condição de paralelismo entre $DF(U)r$ e $r$. Logo o gráfico da direção própria satisfaz a equação do levantamento. A unicidade local da reta própria simples fornece a identificação. $\square$

## Definição — Coincidência no espaço de estados

A coincidência no espaço de estados é o conjunto $\{U:\Delta(U)=0\}$, onde os autovalores deixam de ser distintos.

## Definição — Levantamento da coincidência

O conjunto $\mathcal E$ é a pré-imagem da coincidência espectral dentro da característica $\mathcal C$. Assim, retêm-se somente as direções que satisfazem a equação própria; a projeção sobre os estados pode ter fibras de cardinalidade ou dimensão diferentes.

## Proposição — Transição entre cartas projetivas

Na sobreposição das cartas $r(z)=(z,1)^T$ e $\widehat r(Z)=(1,Z)^T$, vale $Z=1/z$. Se $\Delta U=Yr(z)=\widehat Y\widehat r(Z)$, então $\widehat Y=zY$. A troca de cartas preserva os estados e a condição característica.

**Demonstração.** Para $z\ne0$, temos $r(z)=z\widehat r(Z)$. Substituir essa identidade no vetor salto dá a transformação da amplitude. Como a equação própria é homogênea em r, ela não depende da normalização do representante projetivo. A direção omitida pela primeira carta é coberta pela segunda, mas a coordenada transversal do estado médio deve ser recalculada na nova parametrização. $\square$

**Alcance geométrico.**  A decomposição em folhas lenta e rápida exige autovalores reais distintos. Sobre $\mathcal E$, os rótulos podem perder significado ou exigir continuação específica; não se deve inferir uma passagem única entre folhas apenas pela imagem numérica.

## Definição — Coincidência espectral

Na carta finita, sobre a característica $\mathcal C=\{Y=0\}$, define-se o lugar de coincidência espectral por $\Delta(\bar U)=0$, respeitando a equação característica da carta.

## Lema — Direções no autovalor duplo

Se uma matriz real 2 × 2 tem autovalor real duplo $\lambda$, então: se é escalar, toda direção não nula é autovetor; se não é escalar, o espaço próprio tem dimensão um.

**Demonstração.** Escreva $A=\lambda I+N$. O polinômio característico de N é $t^2$, logo N é nilpotente. Se N = 0, A é escalar. Caso contrário, N tem posto um e núcleo unidimensional. $\square$

## Definição — Característica e coincidência na variedade

A característica é o lugar de estados coincidentes, $\mathcal C=\{P\in\mathcal W:Y(P)=0\}$. A coincidência espectral é o subconjunto da característica no qual os dois autovalores de $DF(\bar U(P))$ coincidem, com a direção projetiva compatível com a equação característica.

$$
\mathcal E=\{P\in\mathcal C:\Delta(\bar U(P))=0\}
$$

Na representação desingularizada, a condição de incidência característica deve ser mantida; o conjunto $\Delta=0$ no plano dos estados não substitui, por si só, o levantamento na variedade.

## Proposição — Projeções da característica

Em qualquer ponto da característica, os estados locais coincidem. Consequentemente, as restrições das duas projeções à característica são iguais.

$$
\pi_-|_{\mathcal C}=\pi_+|_{\mathcal C}=\bar U|_{\mathcal C}.
$$

**Demonstração.** As fórmulas dos estados locais são $U_\pm=\bar U\pm\frac{Y}{2}\begin{pmatrix}z\\1\end{pmatrix}$. Basta fazer $Y=0$. $\square$

## Proposição — Fibras próprias sobre a coincidência

Para um estado com autovalor duplo, o conjunto projetivo de direções próprias é um único ponto quando $DF(U)$ não é escalar e é toda a reta projetiva quando $DF(U)=\lambda I$. Portanto, o levantamento característico pode mudar de dimensão nos pontos escalares.

**Demonstração.** A equação própria é $(DF(U)-\lambda I)r=0$. No caso não escalar, a matriz tem posto um e seu núcleo é uma reta; no caso escalar, a equação é identicamente nula para todo vetor não nulo. $\square$

**Distinção analítica e numérica** A ausência de segmentos detectados por um algoritmo de contorno não implica ausência de direções próprias ou de levantamentos. Em particular, um jacobiano escalar exige diagnóstico independente da detecção de contornos.

Esse lema explica por que a representação projetiva da coincidência requer tratamento distinto nos pontos de jacobiano escalar. O desenho numérico de uma curva não constitui prova de levantamento global de todo o conjunto $\Delta=0$.

## Relação com o núcleo e limites de detecção

O módulo src/math/characteristic/spectrum.js calcula a velocidade própria selecionada pela direção, a outra velocidade e sua diferença assinada gap. Na característica exata, $\Delta=(s-\lambda_{\mathrm{outro}})^2$. O sinal de gap distingue as folhas lenta e rápida, enquanto a proximidade de zero é decidida numericamente com tolerância.

O módulo coincidence.js procura a raiz isolada dessa diferença ao longo de cada fibra regular, onde ela é afim em $\tau$. Quando a inclinação é numericamente nula, coincidenceTauRoots retorna uma lista vazia tanto para ausência de raiz isolada quanto para uma igualdade identicamente satisfeita. Essa saída não prova que o lugar de coincidência esteja vazio; fibras inteiras e pontos escalares precisam de diagnóstico adicional.

No espaço de estados, a projeção esquece a direção própria; na variedade, ela precisa ser mantida. No espaço físico, um autovalor duplo não define por si só uma onda ou uma solução admissível. A referência canônica é 04-characteristic.tex; as auditorias de coincidência do projeto estudam separadamente incidência, cobertura e degenerações.
