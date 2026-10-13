# Fase 14.9.1 — Correção do Espaço físico

O seletor global `.app main` configurava o elemento semântico `<main>` como grade da aplicação. Ao introduzir `<main className="physicalMain">` na Fase 14.8, essa regra passou a distribuir cada filho (diagnósticos, botão de inspeção, diagrama e metadados) em células separadas da grade, deixando uma área central vazia e comprimindo os gráficos à direita.

A correção aplica `display: block` especificamente ao `main.physicalMain`, preservando a grade externa de duas colunas (controles + visualização). Os gráficos passam a ocupar o fluxo vertical normal, com diagnósticos abaixo da visualização quando possível. Não houve alteração em matemática, SVG, câmera ou seleção de candidatos.

Validar com `npm run check` e verificar os painéis aberto/fechado, o diagrama x–t, os dois perfis e os diagnósticos.
