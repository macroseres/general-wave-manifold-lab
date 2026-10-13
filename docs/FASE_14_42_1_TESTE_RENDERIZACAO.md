# Fase 14.42.1 — Teste de fronteira do renderizador

## Problema

O teste `rendererBoundary.test.js` exigia a chamada antiga `makeSonicBufferGeometry(data,{mirrorY:true})`. A partir da partição espectral da fase 14.39, a malha positiva é subdividida em `splitPlus.slow` e `splitPlus.fast`; ambas precisam preservar o espelhamento de Y.

## Correção

O teste verifica agora as duas chamadas de adaptação, cada uma com `mirrorY:true`, e a origem `partitionSonicMesh(data,p,'plus')`. Permanecem as verificações da orientação indexada, das normais e da separação entre geometria científica e renderização Three.js. Nenhum código de produção foi alterado.

## Validação

Execute `node --test tests/rendererBoundary.test.js` e `npm run check`.
