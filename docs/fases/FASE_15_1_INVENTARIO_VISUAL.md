# Fase 15.1 — Inventário visual e contrato inicial

## Escopo executado
- Inventário automático de cores literais em `docs/FASE_15_1_INVENTARIO_CORES.json`.
- Contrato **aditivo**, ainda não integrado à renderização: `src/config/scientificVisual.js`.
- Testes de identidade de objeto e projeção e correspondência de marcadores.
- Nenhuma alteração nos algoritmos, no desenho existente, nem nas cores originais.

## Observações
- `waveColors.js` contém 56 entradas; nem toda cor hexadecimal no código é matemática.
- Uma mesma geometria 2D pode representar imagens de projeções distintas. A identidade não deve depender de coordenadas da tela.
- Os campos `family`, `orientation`, `sonicSide` e `projectionSide` são independentes e começam com `none` quando desconhecidos.
- A correspondência triângulo/pirâmide é somente uma convenção de renderização, não uma afirmação geométrica sobre a entidade matemática.
- Os marcadores e cores atuais **não foram migrados**; a próxima etapa exige revisar os objetos efetivamente renderizados em `Scene.jsx` e `StateSpaceDialog.jsx`.

## Área futura de parâmetros
Reservar no layout `Análise de parâmetros`, com fluxo original, transformação auditável, forma reduzida e estratificação futura. Nenhuma classe ou redução automática foi implementada nesta etapa.

## Validação
Executar `npm run check` em ambiente com dependências instaladas. Os testes unitários da camada aditiva podem ser executados isoladamente por `node --test tests/scientificVisual.test.js`.
