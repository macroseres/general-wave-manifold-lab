# Fase 15.15.2 — Cabeçalho e visualização 2D compactos

- Compactação do cabeçalho em telas desktop, preservando todos os menus.
- SVG do Espaço de estados ajustado à altura útil da janela, com `object-fit: contain`, sem mudar `viewBox`, limites matemáticos ou coordenadas.
- Rolagem dos painéis laterais permanece independente do gráfico.
- Em telas estreitas, mantém o comportamento responsivo anterior.

## Verificação

Executar `npm run check` e verificar visualmente desktop, zoom do navegador, menus e rolagem dos painéis.
