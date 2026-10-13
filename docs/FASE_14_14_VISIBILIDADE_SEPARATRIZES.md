# Fase 14.14 — Visibilidade das separatrizes finitas

## Correção

Removida a condição `hideFiniteSeparatrices` que ocultava **todas** as separatrizes finitas ao selecionar a singularidade no infinito. A seleção de uma singularidade não deve alterar a visibilidade das curvas; apenas os controles explícitos de visibilidade devem fazê-lo.

## Limites

As separatrizes estáveis da sela no infinito que permanecem em Z=0 continuam sem representação na carta finita; consultar a carta recíproca. Esta alteração não modifica as equações, a integração ou os dados geométricos. Não garante que existam separatrizes finitas para os parâmetros e a janela escolhidos.

## Teste manual

1. Habilitar W^s e W^u finitas e no infinito.
2. Selecionar a sela no infinito; confirmar que curvas finitas já exibidas não desaparecem.
3. Selecionar outra singularidade e comparar visibilidade.
4. Abrir carta local para observar ramos na fronteira Z=0.
