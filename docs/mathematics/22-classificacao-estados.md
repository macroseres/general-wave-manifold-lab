# Discriminante e classificação dos estados

## Definição — Classificação espectral em um estado

Escrevendo $DF(U)=\begin{pmatrix}f_u&f_v\\g_u&g_v\end{pmatrix}$, o discriminante espectral é

$$
\Delta(u,v)=(f_u-g_v)^2+4f_vg_u.
$$

Para $\Delta>0$ há dois autovalores reais distintos; para $\Delta<0$, um par complexo conjugado; e para $\Delta=0$, um autovalor real duplo. Neste último caso, é necessário distinguir matrizes escalares de matrizes não escalares.

**Classificação espectral** Hiperbólica estrita: $\Delta>0$. Parabólica: $\Delta=0$. Elíptica: $\Delta<0$.

Como o fluxo é quadrático, $\Delta(u,v)$ tem grau no máximo dois. Seu conjunto de zeros pode ser uma cônica regular, degenerada, um ponto isolado, o plano inteiro ou o conjunto vazio.

$$
\Delta^{A}(V)=\Delta(AV+U_0).
$$

A igualdade expressa a preservação da classificação espectral sob mudanças afins invertíveis dos estados.

O termo parabólico neste contexto indica autovalor duplo do jacobiano; não afirma que a equação seja uma EDP parabólica. Uma matriz escalar e uma matriz não escalar com autovalor duplo possuem conjuntos diferentes de direções próprias e precisam de tratamento distinto na variedade.

## Classificação do lugar de coincidência

Como o jacobiano é afim nos estados, seu discriminante tem grau no máximo dois. Podemos escrevê-lo como

$$
\Delta(u,v)=c_{20}u^2+c_{11}uv+c_{02}v^2+c_{10}u+c_{01}v+c_{00}.
$$

Os seis coeficientes dessa expressão são derivados dos dez coeficientes do fluxo; não são novos parâmetros independentes. O módulo src/math/flux/affineClassification.js recupera esse polinômio em discriminantPolynomial.

Em src/math/flux/conicClassification.js, classifyConic classifica numericamente o conjunto real de zeros: elipse, hipérbole, parábola, pares de retas, reta dupla, reta, ponto, conjunto vazio ou plano inteiro. O tipo geométrico de $\Delta=0$ não determina sozinho em que lado o discriminante é positivo: polinômios com sinais opostos têm os mesmos zeros e trocam as regiões espectrais. Também não determina os ramos de Hugoniot ou a admissibilidade de todas as cadeias de Riemann.

## Cortes do espaço de parâmetros

O módulo src/math/flux/parameterDiagram.js varia dois coeficientes e mantém os outros oito fixos. Cada célula é classificada pelo tipo do lugar real $\Delta=0$ no centro amostrado. As categorias compacto, vazio, hiperbólico, parabólico, retas e degenerado agrupam formas desse lugar; a categoria hiperbólico do diagrama refere-se a hipérboles ou retas concorrentes, e não à hiperbolicidade estrita do sistema em todo estado.

Esse diagrama é um corte numérico da família de fluxos. Não é uma classificação global do espaço de dez parâmetros, nem prova de localização exata de todas as fronteiras entre classes. Uma região estreita pode escapar da resolução e o tipo reportado próximo a uma degeneração depende da tolerância.

## Classificação exata e classificação com tolerância

classifyState usa uma tolerância escalada pelo jacobiano para distinguir sinais e identificar a proximidade de uma matriz escalar. Assim, seu rótulo numérico de autovalor duplo corresponde a uma faixa de proximidade de $\Delta=0$, não necessariamente a uma igualdade exata. classifyConic também usa tolerância relativa à escala dos coeficientes.

No espaço de estados, os rótulos descrevem o espectro local. Na variedade, eles orientam o levantamento próprio e a distinção entre folhas, com exceções na coincidência. No espaço físico, não fornecem automaticamente uma solução de Riemann: existência, seleção das ondas e admissibilidade continuam exigindo as construções correspondentes. A classificação completa segundo os parâmetros permanece um objetivo de pesquisa.

## Exemplo — Uma classificação algébrica com casos degenerados

No preset simétrico $F(u,v)=((B_1+1)u^2/2+v^2/2,uv+cu)$, a expansão direta fornece

$$
\Delta(u,v)=B_1^2u^2+4v(v+c)
=B_1^2u^2+4(v+c/2)^2-c^2.
$$

Para $B_1=8$ e c=1, o lugar de coincidência é a elipse $64u^2+4(v+1/2)^2=1$. Seu interior é elíptico e seu exterior é estritamente hiperbólico. O ponto $(0,-1/2)$ tem $\Delta=-1$, enquanto $(1,0)$ tem $\Delta=64$. Em $(0,0)$, o jacobiano é não escalar com autovalor duplo; a interpretação do levantamento exige manter a reta própria.

Mantendo $B_2=0$, a=0 e variando somente $B_1,c$, quatro casos exatos são: elipse para (8,1); ponto isolado para (8,0); duas retas paralelas para (0,1); reta dupla para (0,0). No caso (8,0), o jacobiano na origem é escalar. Portanto, uma mudança do lugar de zeros pode também mudar a dimensão da fibra de direções próprias.

Essas conclusões seguem por completar quadrados, não por extrapolação de pixels do diagrama. O gerador avançado compara os casos com classifyFluxConic e os sinais com discriminant e classifyState. O desenho da elipse e o diagnóstico de separatrizes usam o mesmo fluxo, mas classificam objetos diferentes. Nenhum dos quatro casos classifica por si só todas as soluções de Riemann.
