# Fase 14.22 — Auditoria geométrica de C

- A triangulação passou para `src/geometry/characteristic/mesh.js`, compartilhada pela cena e pelos testes.
- A auditoria usa os triângulos **realmente renderizados**, sem reconstruir uma segunda malha.
- Verifica conservação de área na carta (cobertura sem sobreposição de área), geometria em Y=0, consistência dos segmentos da fronteira com G=0 e projeção no locus D=0.
- Diagnósticos: `inputArea`, `slowArea`, `fastArea`, `skippedTriangles`, `invalidTriangles`, `sharedEdges`.
- Presets: padrão, geral e misto; `npm test` passou 541/541.

## Limites

- Conservação de área **não é prova completa** de ausência de interseções de triângulos ou lacunas compensadas; são necessários testes topológicos adicionais.
- A carta usa zc no intervalo [-0.999, 0.999]; não cobre os pontos no infinito.
- Perto de |zc|=0.999 a avaliação de G apresenta cancelamento numérico; o teste adota tolerância relativa maior nessa borda e registra essa limitação.
- Casos com fibra inteira G≡0 e singularidades de parametrização não são certificados nesta fase.
- A geometria visual da fase 14.21 foi preservada.
