# Fase 14.37 — Diagnóstico matemático por clique nas sônicas

- O painel do gráfico mostra ambas as equações implícitas Φ₋ e Φ₊, o resíduo relativo da superfície selecionada e o resíduo da equação completa.
- `inspectSonicPoint` calcula `sonicData` apenas uma vez por ponto, reutilizando `K` e `detM` para ambas as sônicas.
- Pontos da malha triangular não são necessariamente pontos exatos da superfície implícita; resíduos não nulos não devem ser ocultados.
- O limite projetivo |ẑ|=1 não é tratado como coordenada finita artificial.
- Nenhuma alteração na geometria, nas cores, na opacidade ou nas escalas visuais.
