# Fase 14.33 — Escala visual e inspeção projetiva

- Novos valores iniciais da escala gráfica: τ=0.55, Y=0.25, ẑ=2.55.
- O botão «Escala 1:1» continua restaurando (1,1,1); «Ajustar vista 3D» mantém o comportamento anterior.
- Ao clicar em um marcador excepcional no bordo ẑ=±1, o ponto inspecionado passa a usar a mesma extremidade da carta, preservando o sinal do representante visual. Os dois bordos continuam representando a mesma direção projetiva infinita.
- A inspeção e a geometria reutilizam as rotinas matemáticas existentes; não foram acrescentadas avaliações espectrais.
- Validação local: `node --test tests/*.test.js` — 574 testes aprovados. ESLint e build não executados (dependências ausentes).
