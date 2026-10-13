# Etapa 5 — Auditoria da fronteira geometria/renderização

Base: `v0.7.0-dev.24.47.58`. Escopo: separação arquitetural conservadora, sem alterar equações, amostragem, triangulação ou aparência.

## Fronteiras existentes

- `src/math/`: funções científicas puras, incluindo fluxo, cartas, sônicas, rarefação, fibras e integração.
- `src/geometry/`: produz coordenadas, curvas, ramos e malhas sem dependência de React ou Three.js.
- `src/components/Scene.jsx`: coordena objetos visíveis, câmera, materiais e conversão de coordenadas em objetos gráficos.
- `src/geometry/composite/compositeSceneData.js`: constrói os dados geométricos e seus diagnósticos; `ContinuationAuditPanel.jsx` consome somente diagnósticos.

## Ajuste desta entrega

Extraída a conversão de dados da malha sônica em `THREE.BufferGeometry` para `src/rendering/sonicBufferGeometry.js`. O adaptador preserva o espelhamento de `Y`, a orientação consistente dos triângulos, os índices e o cálculo de normais. O `Scene.jsx` permanece responsável pelo ciclo de vida (`dispose`), materiais e visibilidade. A função pura de orientação permanece em `src/geometry/sonic/orientTriangles.js`.

## Dívidas identificadas

1. `Scene.jsx` ainda converte curvas de coincidência, rarefação e separatrizes diretamente em `THREE.Vector3`/`THREE.BufferGeometry`; essa conversão deve migrar para adaptadores de renderização, com teste de equivalência visual.
2. O fallback síncrono da superfície sônica e o Worker são coordenados em `Scene.jsx`. A geração é pura, mas o agendamento/estado de execução ainda se mistura ao componente.
3. Há `BufferGeometry` criado durante renderização de linhas; revisar descarte de recursos ao desmontar/atualizar.
4. A geometria da característica (`Y=0`) é declarada diretamente em JSX, o que é aceitável como primitiva visual, mas a política deve distinguir primitivas de dados científicos.
5. A camada numérica ainda tem diagnósticos de eventos não resolvidos; não interpretar ambiguidades de continuação como bifurcações demonstradas.

## Critérios para encerrar a etapa 5

- Dados científicos sem importações de React/Three.js (teste arquitetural existente).
- Adaptadores de renderização isolados e equivalência numérica/visual verificada para malhas e curvas.
- Ciclo de vida de recursos Three.js controlado.
- Renderização não determina equações, tolerâncias, triangulação ou topologia.

**Estado:** em andamento; esta entrega isola o adaptador da malha sônica, não encerra a etapa 5.

## Curvas — separação incremental (dev.24.47.58)

- `src/rendering/curvePoints.js` converte dados puros em triplas para o renderer, com contratos explícitos `tauYzc` e `xyz` e deslocamento visual opcional no eixo Y.
- `Scene.jsx` usa o adaptador nas curvas de coincidência, rarefação, separatrizes finitas e no infinito, loci especiais DS/J, fibras de estado e curvas compostas.
- As curvas que criavam `THREE.BufferGeometry().setFromPoints` diretamente durante a renderização passaram a usar `<Line>` de `@react-three/drei`, que administra o ciclo de vida dos recursos de linha. A malha sônica continua usando o adaptador próprio com `dispose()` explícito.
- A geometria matemática não importa Three.js; os deslocamentos visuais (0.018, 0.026, 0.043, 0.062 etc.) continuam exclusivos do renderer.
- Verificação: `tests/curveRenderingBoundary.test.js` e suíte Node. Ainda requer inspeção visual e `npm run check` em ambiente com dependências instaladas.

## Worker sônico — ciclo de vida (dev.24.47.58)

- `src/rendering/sonicWorkerLifecycle.js` centraliza a verificação de identidade da resposta (`id` e chave de parâmetros) e o descarte do Worker (desvinculação de `onmessage`, `onerror`, `onmessageerror` antes de `terminate`).
- `SonicSurfaces` cancela os timers do fallback associados à montagem durante o desmontar, impedindo execução posterior de trabalho agendado.
- O fallback em mudanças de parâmetros mantém sua própria limpeza por efeito; resultados calculados com chaves antigas não são publicados.
- O `BufferGeometry` sônico continua descartado no cleanup do efeito de geometria.
- A geração e a triangulação não foram alteradas. A auditoria não comprova ausência de vazamentos de GPU em sessões prolongadas; exige inspeção no navegador.
- Testes: `tests/sonicWorkerLifecycle.test.js` e suíte Node.

## Recursos gráficos e atualização de parâmetros (dev.24.47.58)

- `src/rendering/graphicsLifecycle.js` centraliza descarte de `BufferGeometry` e `AxesHelper` (geometria e materiais).
- A borda da característica é memorizada por domínio; o `PlaneGeometry` temporário é descartado imediatamente após a extração de `EdgesGeometry`.
- O `AxesHelper` é memorizado pelo comprimento e descartado quando substituído ou desmontado. A malha sônica mantém o descarte por efeito associado à geometria memorizada.
- Três testes de ciclo de vida foram adicionados em `tests/graphicsLifecycle.test.js`. A suíte Node passou (221/221).
- **Pendente:** inspeção visual e de memória GPU no navegador durante alterações rápidas de parâmetros; `npm run check` não pôde completar por ausência de ESLint no ambiente de execução.

## Estresse de atualização de parâmetros e descarte

- `tests/rapidParameterLifecycle.test.js` simula 500 mudanças sucessivas de chave e identificador da solicitação sônica, certificando que somente a resposta atual é aceita pelo predicado de identidade.
- O mesmo arquivo simula 500 ciclos de substituição e verifica descarte das geometrias, materiais e Workers e desvinculação dos handlers antes do término.
- A suíte Node passa com 223/223 testes.
- **Limite da evidência:** os testes exercitam auxiliares puros com objetos simulados; não medem memória GPU, não exercitam React em um navegador e não certificam que a interface permaneça responsiva durante um fallback síncrono de triangulação. A inspeção real de WebGL e do comportamento visual ainda é obrigatória antes do encerramento da etapa 5.
