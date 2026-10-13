# Fase 14.15 — Curvas integrais da rarefação

## Causa confirmada

`rarefactionOrbits` retorna pontos `{tau,zc}` na superfície característica `Y=0`. O componente `RarefactionField` passava esses pontos a `curvePoints3D`, que exige `Y`. A ausência da propriedade gerava coordenadas 3D não finitas (`NaN`).

## Correção

A conversão para o renderizador define `Y:0` explicitamente, preservando a separação visual `yOffset:0.026`. As linhas recebem largura 2.5 e são desenhadas acima das superfícies transparentes para inspeção visual. Nenhum algoritmo de integração ou equação foi alterado.

## Verificação

Executar `npm run check`; abrir Variedade 3D e habilitar `R (rarefação em Y=0)` e `curvas genéricas de R`. Testar com superfícies ligadas e desligadas. A presença de curvas genéricas não garante completude das separatrizes finitas ou no infinito, que exigem auditoria própria.
