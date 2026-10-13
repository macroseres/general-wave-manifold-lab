# Fase 15.14 — Espaço de estados com gráfico prioritário

## Mudanças
- Painel lateral de ferramentas começa recolhido; o usuário pode abri-lo a qualquer momento.
- Inspeção de curvas mantém o acionamento junto ao gráfico, mas seus diagnósticos completos ficam dentro de um painel `details` independente.
- O bloco extenso de construção/verificação das cadeias inicia recolhido, sem remover qualquer diagnóstico.
- Em telas até 760px, o gráfico passa a preceder o painel lateral, reduzindo rolagem antes da interação.
- Foram preservados os controles, a seleção e as projeções existentes; nenhuma rotina matemática foi alterada.

## Limites e testes
- O gráfico é priorizado, mas não houve auditoria visual em navegador nem mudança na organização de todas as demais janelas.
- `npm run test`: 666 testes aprovados.
- JSX de StateSpaceDialog.jsx analisado com parser TypeScript: sem erros de sintaxe.
- Executar `npm run check` no projeto com dependências instaladas.
- Verificar: desktop com drawer aberto/fechado; mobile; inspeção de curvas; alternância de projeções; construção das cadeias.
