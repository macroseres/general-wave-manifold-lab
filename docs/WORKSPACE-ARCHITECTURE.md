# Contrato de layout — espaços científicos

Estados, Variedade 3D e Físico compartilham `WorkspaceLayout` e `WorkspaceRail`.
A geometria estrutural está **exclusivamente** em `src/styles/workspace-layout.css`.

## Estrutura

- Navegação (`WorkspaceRail`): 68 px.
- Painel de controles: 232 px.
- Espaçamento interno e entre colunas: 8 px.
- Área de trabalho: largura restante (`minmax(0,1fr)`).
- Fundo: `#0b0d10`.
- Recolher: preserva a navegação e remove somente o painel de controles.

A diferença entre espaços é **somente conteúdo**: categorias, controles, gráficos e
inspeções científicas. O 3D mantém o inspetor científico separado, sem reservar
uma terceira coluna quando ele está oculto.

## Regras de manutenção

1. Não adicionar larguras ou `left`/`top` de sidebar em componentes de cada espaço.
2. Não adicionar blocos de CSS de correção no fim de `scientific-ui.css`.
3. Alterar dimensões exclusivamente nas variáveis de `workspace-layout.css`.
4. Validar Estados, Variedade e Físico tanto abertos quanto recolhidos.
5. Antes de publicar: `npm ci`, `npm run check`, inspeção visual em desktop e mobile.

`src/styles/workspace-unified.css` é obsoleto e deve ser excluído se existir.
