# Fase 15.19 — Zoom por retângulo no Espaço de estados

A barra 2D inclui **▣ Zoom por retângulo** e **↶ Voltar à janela anterior**.

- Ative ▣, pressione o botão esquerdo sobre a região interna do gráfico e arraste.
- Um retângulo ciano translúcido mostra a seleção em tempo real.
- Solte o botão para ampliar. Seleções inferiores a 8 unidades SVG de largura ou altura são ignoradas.
- A janela resultante inclui toda a seleção e preserva a proporção das escalas visuais atuais dos eixos.
- ↶ recupera janelas anteriores, incluindo zoom, pan, ajuste e restauração. Histórico limitado a 20.
- Selecionar, Mover e Inspecionar desativam o modo Zoom por retângulo.
- O modo não modifica os estados matemáticos nem os dados das curvas.

Validação: parser JSX sem diagnósticos; 5 testes unitários selecionados passaram.
Pendente: `npm run check` completo e teste visual de pointer/touch em navegador.
