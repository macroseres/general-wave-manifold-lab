# Fase 15.15.9 — Fundo retangular do gráfico 2D

A superfície central agora tem fundo uniforme retangular, como o viewport da Variedade 3D. O fundo não fica restrito ao retângulo interno do SVG, pois o preenchimento `chartBg` passa a ser transparente **somente no Espaço de estados**. O contorno do gráfico foi simplificado e a legenda mantém-se na base do mesmo retângulo.

Não alteramos a proporção SVG, os eixos, as curvas, os pontos ou os cálculos. Verificar visualmente em tema claro/escuro e executar `npm run check`.
