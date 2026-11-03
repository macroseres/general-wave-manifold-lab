# Fase 15.18 — seleção, coordenadas e inspeção de curvas

- A barra do gráfico 2D ganhou modo explícito **Selecionar** (↖), alternância de **Coordenadas** (⌖) e **Inspecionar curvas** (◎).
- O modo de seleção desativa pan e inspeção de curvas. O modo de inspeção desativa pan, e vice-versa.
- A ferramenta de inspeção reutiliza a seleção/proveniência de curvas já existente, sem criar um segundo mecanismo matemático.
- As coordenadas `(u,v)` são lidas pelo mapeamento SVG→plano existente, exibidas em um pequeno HUD na região inferior esquerda do gráfico, e desaparecem quando o cursor sai.
- Nenhuma equação, curva, projeção, estado ou escala matemática foi modificada.

## Validação
- Sintaxe JSX analisada via parser TypeScript, sem erro de análise.
- 8 testes unitários selecionados aprovados.
- Ainda é necessário `npm run check` e testar no navegador os modos Selecionar/Mover/Inspecionar, zoom e leitura de coordenadas.
