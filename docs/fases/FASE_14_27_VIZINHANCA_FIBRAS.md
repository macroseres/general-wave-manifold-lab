# Fase 14.27 — Vizinhança algébrica das fibras excepcionais

O módulo `src/math/characteristic/exceptionalNeighborhood.js` calcula a ordem de anulação conjunta dos coeficientes P, Q, R da equação característica na carta finita ou na carta recíproca (Z=0 para o infinito).

- Ordem 0: equação não identicamente nula na direção.
- Ordem 1 ou 2: degeneração isolada na direção projetiva.
- Ordem infinita: equação identicamente nula para todas as direções (degeneração persistente).

A função reutiliza a classificação `characteristicProjectiveFiber` e os coeficientes originais do fluxo, sem avaliação espectral. O resultado é diagnóstico algébrico; não constitui prova de estrutura topológica local da variedade de ondas nem gera malhas 3D adicionais.

Testes: `node --test tests/exceptionalNeighborhood.test.js`.
