# Fase 15.17 — Navegação do gráfico 2D

Ferramentas sobrepostas no canto superior direito da figura: ampliar, reduzir, mover, ajustar à geometria e restaurar janela inicial. Roda do mouse amplia/reduz com âncora no cursor. No modo mover, arraste com botão esquerdo; o botão central também move sem ativar o modo. Controles e diagnósticos existentes permanecem.

Transformações alteram somente a janela visível de coordenadas `(uMin,uMax,vMin,vMax)`, não estados matemáticos. O texto dos limites no painel esquerdo acompanha zoom/pan. A seleção por clique funciona com a nova janela.

Validação: testes puros de navegação e posicionamento. Executar `npm run check` e conferir visualmente wheel, pan, seleção, arraste de U_L/U_R e comportamento touch no navegador.
