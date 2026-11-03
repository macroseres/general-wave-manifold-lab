# Fase 14.20 — Fronteira compartilhada

- `CharacteristicSurface` avalia o gap espectral uma vez por vértice da grade.
- As raízes nas arestas são armazenadas em cache, identificadas pelo par de vértices.
- As malhas lenta/rápida e a linha de coincidência usam os mesmos pontos de interseção.
- Todos os pontos da fronteira são renderizados com Y=0.
- A curva desenhada é a fronteira da triangulação, não uma amostragem independente de `coincidencePoints`.

## Limitações

- A geometria é aproximada pela grade e por bisseção nas arestas.
- Zeros tangenciais sem troca de sinal e componentes degeneradas exigem tratamento posterior.
- A projeção analítica de E continua disponível em `coincidencePoints`, e os testes anteriores continuam independentes da renderização.

## Verificação local

`npm run check` e `npm run dev`; comparar as vistas Frente, Lado e Topo.
