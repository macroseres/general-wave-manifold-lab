# Fase 15.12 — Comparação das projeções do mesmo ponto

- A inspeção de P na cena transmite um instantâneo **dos dois extremos** `Um` e `Up` com o lado inicialmente escolhido.
- No Espaço de estados, os botões `π₋(P)` e `π₊(P)` alternam o marcador e a leitura de coordenadas sem retornar à cena 3D.
- O destaque e o botão **Incluir na janela** seguem a projeção atualmente escolhida.
- Se os dois estados coincidirem numericamente, o painel avisa sem criar marcadores artificiais sobrepostos.
- A projeção selecionada para exibir as curvas de Hugoniot permanece consistente com o marcador ativo.
- Nenhuma alteração nos cálculos, superfícies ou na geometria das fibras.

## Limitações
- Os extremos são um instantâneo do ponto 3D inspecionado. Uma alteração posterior dos coeficientes do fluxo exige nova inspeção; a interface não afirma que o instantâneo represente um ponto do novo fluxo.
- Conferir visualmente alternância, estados coincidentes e ampliação da janela no navegador.
