# Fase 15.16 — viewport retangular no Espaço de estados

O SVG passou de `680 × 680` para `1040 × 680`. O mapeamento `sx` utiliza a nova largura, e o mapeamento `sy` mantém a altura; as operações inversas do clique e arraste utilizam as mesmas dimensões. Assim, a direção **u** recebe maior extensão visual sem mudar o intervalo matemático configurado.

O SVG mantém `preserveAspectRatio` padrão (`xMidYMid meet`); com proporção ~1,53, aproxima-se da proporção do painel central no desktop. Os painéis laterais e a legenda são preservados. Em telas de outras proporções, ainda poderá haver pequenas margens para evitar distorção.

Verificar clique/arraste, posição dos eixos, zoom e rótulos. Executar `npm run check` e inspecionar visualmente em desktop e mobile.
