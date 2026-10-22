# Autovalores e regiões espectrais

## Definição — Discriminante espectral

$$
\Delta(U)=\big(f_u(U)-g_v(U)\big)^2+4f_v(U)g_u(U).
$$

Para $\Delta(U)\geq0$, os autovalores reais, contados com multiplicidade, são

$$
\lambda_{1,2}(U)=\frac{\operatorname{tr}DF(U)\mp\sqrt{\Delta(U)}}2.
$$

## Proposição — Classificação espectral

Em cada estado U, a matriz jacobiana possui dois autovalores reais distintos se $\Delta(U)>0$, um autovalor real duplo se $\Delta(U)=0$ e dois autovalores complexos conjugados não reais se $\Delta(U)<0$.

**Demonstração.** O polinômio característico de uma matriz real 2 × 2 é $\lambda^2-(\operatorname{tr}DF)\lambda+\det DF$, cujo discriminante é $\Delta$. $\square$

## Corolário — Fronteira parabólica

A fronteira entre regiões estritamente hiperbólicas e elípticas, quando ambas ocorrem, está contida em $\{U:\Delta(U)=0\}$. O conjunto de zeros pode também conter componentes sem mudança de sinal.

Para um fluxo quadrático, $\Delta$ é um polinômio de grau no máximo dois. A classificação geométrica da cônica e as degenerações constam das seções sobre parâmetros.
