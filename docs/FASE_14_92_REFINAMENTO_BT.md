# Fase 14.92 — Refinamento projetado de BT⁻

A curva BT⁻ é extraída como interseção espectral na malha de S⁻. Esta fase preserva os segmentos e sua conectividade, mas acrescenta pontos intermediários por subdivisão adaptativa com correção de Newton nas equações `sonicImplicit=0` e `trace(DF(U_-)-sI)=0`.

O refinamento é limitado a 320 tentativas de projeção e profundidade 3, com proteção contra projeções distantes do segmento. Pontos que não convergem são descartados. BT⁺ continua sendo gerada exclusivamente pela reflexão `†: (τ,Y,ẑ) -> (τ,-Y,ẑ)`.

A construção inicial continua dependente da malha da sônica; portanto a correção não garante regularidade em todos os casos, especialmente em regiões degeneradas, em segmentos iniciais mal conectados ou em pontas com alta curvatura. Um algoritmo completo de continuação pseudo-arclength permanece possível caso os artefatos persistam.

Validação: `npm test` — 648 testes aprovados. Lint e build não executados por ausência de dependências instaladas.
