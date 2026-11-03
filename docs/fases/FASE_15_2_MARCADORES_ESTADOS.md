# Fase 15.2 — primeira integração de marcadores científicos

## Implementado
- Componente SVG compartilhado `ScientificStateMarker.jsx` para estados selecionáveis.
- `U_L`: círculo; `U_R`: losango; preservadas as cores preexistentes.
- A mesma convenção vale para a prévia de posicionamento no espaço de estados.
- Geometria de marcador centralizada em `scientificMarkerRules.js`, incluindo correspondência 3D **reservada** (esfera/octaedro).
- Nenhuma mudança em seleção, arraste, projeções, algoritmos matemáticos ou malhas 3D.

## Limitações e próximas tarefas
- A equivalência 3D é apenas uma convenção declarada: os marcadores de estado 3D ainda não foram migrados.
- A geometria visual de `U_-`, `U_+`, `U*` e marcadores de eventos foi preservada para evitar atribuir uma semântica não auditada.
- Não confundir lado do estado Riemann (`left/right`) com projeção (`minus/plus`) nem com famílias lenta/rápida.
- Verificar no navegador a legibilidade do losango em seleção e arraste, especialmente em mobile.
