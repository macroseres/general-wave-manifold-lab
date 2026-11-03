# Fase 15.15.4

- A legenda passa a ser filha real do contêiner do gráfico, não um elemento concorrente no grid.
- O SVG usa o espaço restante depois da reserva para a legenda, sem cortar as curvas por falta de altura.
- Os rótulos principais dos estados recebem deslocamentos visuais determinísticos quando há estados próximos; marcadores e coordenadas permanecem intactos.
- Os painéis laterais e cálculos matemáticos não foram alterados.

Verificar manualmente: rótulos em estados coincidentes, legenda sempre visível, redimensionamento, telas menores e `npm run check`.
