# Fase 14.12 — Auditoria reproduzível das separatrizes

Esta etapa **não modifica** o campo de rarefação, as equações, o integrador nem a renderização.

Execute `node scripts/audit-rarefaction-separatrices.js` para gerar JSON com: singularidades finitas; ramos finitos; ramos na carta recíproca; quantidade de pontos, intervalos de tau e zc; e diagnósticos das tentativas de integração.

Para reproduzir parâmetros específicos, crie um arquivo JSON com `coefficients` (objeto com a20, a11, a02, a10, a01, b20, b11, b02, b10, b01) e opcionalmente `tauMin` e `tauMax`, e execute `node scripts/audit-rarefaction-separatrices.js parametros.json`.

Interpretação: `visibleInFiniteChart=false` não implica inexistência matemática do ramo; `liesOnInfinityBoundary=true` sinaliza ramo na fronteira recíproca. Contagens pequenas ou intervalos reduzidos são pistas para investigar interrupções numéricas e recortes, não provas de erro.

A geometria e a seleção por clique continuam inalteradas nesta fase. Não confundir o desenho de um marcador de singularidade com uma separatriz completa.
