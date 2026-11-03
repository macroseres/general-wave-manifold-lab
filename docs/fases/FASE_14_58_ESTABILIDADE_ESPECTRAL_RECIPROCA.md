# Fase 14.58 — Estabilidade espectral na carta recíproca

## Objetivo

Evitar reconstruir o ponto espectral de Hopf a partir de coeficientes do polinômio característico com grandes potências de `z` nas proximidades de `zc=±1`.

## Construção

Para `|zc| >= 0.92`, usamos `Z=1/z`, `X=Y/Z` e `eta=tau/Z²`. A fibra é reconstruída por `fiberZ(Z,eta,p)`, que usa coeficientes homogeneizados `P,Q,R` e não forma `z²` ou `z⁴` em valores intermediários. A partir de `Ubar`, `reciprocalHopfAt` calcula a velocidade característica usando a direção `(1,Z)` e avalia traço, determinante e discriminante.

A reconstrução da fibra na carta recíproca é verificada pelo resíduo relativo. Não há fallback silencioso para a avaliação antiga: inconsistências retornam `chart-mismatch`; valores não finitos retornam `numerical-limit`. A carta ordinária permanece usada para `|zc|<0.92`.

## Limitações

- `tau` fixo em `Z→0` pode produzir `eta=tau/Z²` divergente. A divergência física não é removida por mudança de carta.
- A superfície visual permanece amostrada apenas em `|zc|<1`; a mudança não adiciona vértices no infinito nem garante continuidade global.
- O critério de determinante permanece o existente; a malha não é prolongada artificialmente.
- Os dois testes novos cobrem valores próximos de ambos os extremos, sem substituir uma auditoria numérica exaustiva para todos os parâmetros.

## Validação

`npm test`: 614 testes aprovados. `npm run lint` e `npm run build` não executados neste ambiente sem `node_modules`.
