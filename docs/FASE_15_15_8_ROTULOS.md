# Fase 15.15.8 — Posicionamento visual dos rótulos

- Adiciona função pura `chooseStateLabelPosition` que avalia posições candidatas para o texto de estados.
- Penaliza colisão com marcadores próximos e posições fora da janela do SVG.
- Não modifica coordenadas matemáticas, marcadores, trajetórias, escalas, câmeras ou painéis.
- Limitação: colisões entre caixas de *dois rótulos* não são ainda resolvidas globalmente. A estratégia atual considera os marcadores vizinhos.
- Testes: `node --test tests/labelPlacement.test.js tests/hugoniotWaveLift.test.js` (5 aprovados).
- Pendente: `npm run check` e inspeção visual em navegador.
