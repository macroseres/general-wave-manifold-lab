# Fase 15.13 — Consolidação dos controles de projeção

## Alteração
- Evita mostrar simultaneamente dois pares de botões π₋/π₊ quando existe um ponto P enviado pela Variedade 3D.
- Mantém o controle habitual de projeção quando o usuário fixa U* e não está comparando projeções de um ponto 3D.
- No modo de comparação, apresenta diretamente as duas coordenadas projetadas e uma instrução curta.
- Não altera estados, callbacks, cálculos, projeções, picking nem geometria.

## Verificação manual
1. Com U* fixado, sem inspeção de P: deve aparecer o controle habitual.
2. Inspecionar P na variedade e abrir Espaço de estados: deve aparecer somente o par de comparação.
3. Alternar π₋/π₊, verificar destaque, coordenadas e preservação de U*.
4. Executar npm run check e conferir layout mobile.
