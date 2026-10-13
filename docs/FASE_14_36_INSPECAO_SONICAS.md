# Fase 14.36 — Inspeção direta das sônicas

- Clique nas malhas S⁻ ou S⁺ para abrir um painel compacto no gráfico.
- O ponto de interseção é convertido de coordenadas mundiais para coordenadas locais da malha, removendo o efeito da escala visual não uniforme.
- As superfícies compartilham a malha sônica existente; não há novos cálculos de geometria, autovalores ou discriminantes.
- Inspeções da característica e das sônicas são mutuamente exclusivas.
- A inspeção informa coordenadas da malha renderizada, sem afirmar certificação da equação sônica.

Validação: `node --test tests/*.test.js`; executar `npm run check` com dependências instaladas.
