# Fase 15.8 — amostra projetada e diagnóstico de Rankine–Hugoniot

- Inspeção por clique escolhe a amostra **existente** mais próxima sobre a curva selecionada (não interpola um estado que não foi calculado).
- Para Hugoniot: constrói o par de estados segundo π₊ ou π₋ e usa `directShockDiagnostic` existente para calcular velocidade e resíduo relativo de Rankine–Hugoniot.
- O painel mostra índice da amostra, estado variável, distância em pixels, velocidade e resíduo, quando disponíveis.
- Um anel branco marca a amostra inspecionada no plano.
- Para rarefações, mostra somente a amostra de estado: não atribui choque nem levantamento 3D.
- Não representa a amostra como ponto 3D: o levantamento e sua parametrização ainda requerem validação explícita.
- Mantém os cálculos de superfícies, fibras, projeções e interação originais.

## Validação
`node --test tests/projectedCurveSamples.test.js` e `npm run check` com dependências instaladas. Verificar visualmente cliques em trechos próximos, em ambas as projeções.
