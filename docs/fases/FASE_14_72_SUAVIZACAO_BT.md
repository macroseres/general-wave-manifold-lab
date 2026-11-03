# Fase 14.72 — Suavização geométrica das curvas BT

## Motivação

A linha BT era desenhada como um componente `<Line>` para cada segmento resultante da interseção dos triângulos sônicos com a condição espectral. Isso realçava pequenas quinas e descontinuidades de desenho.

## Implementação

- `src/geometry/sonic/smoothBtCurve.js` conecta segmentos que compartilham extremos, sem conectar ramificações desconexas nem atravessar nós de valência diferente de dois.
- Cada segmento é subdividido e os pontos intermediários são corrigidos por Newton em `(tau,Y)` a `zc` fixo, resolvendo simultaneamente `sonicImplicit=0` e `trace(DF(U±)-sI)=0`.
- Pontos intermediários que não convergem são descartados; não são inseridos pontos não verificados.
- O componente `Scene.jsx` desenha uma linha por curva conectada, preservando as cores e a reflexão da folha positiva.
- O gerador da superfície sônica e a geometria de Hopf não foram alterados.

## Limitações

Os pontos extremos continuam provenientes da interseção linear com a malha sônica; portanto a suavização não substitui uma continuação global independente da malha. Perto de singularidades da projeção em `(tau,Y)`, o passo de Newton pode falhar e não acrescentará pontos. O resultado visual deve ser confirmado no navegador.

## Verificação

`npm test`: 642 testes aprovados. O lint e o build não foram executados neste ambiente.
