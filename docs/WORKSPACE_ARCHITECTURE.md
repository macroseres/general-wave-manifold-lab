# Arquitetura dos quatro ambientes

A interface do General Wave Manifold Lab utiliza quatro ambientes: **Estados**, **Variedade**, **Físico** e **Documentação**. Todos apresentam a mesma barra superior, navegação lateral (`WorkspaceRail`), painel de ferramentas/índice e área principal.

## Contrato estrutural

- `src/components/WorkspaceLayout.jsx`: invólucro compartilhado e estados `data-workspace` e `data-panel-expanded`.
- `src/components/WorkspaceRail.jsx`: navegação e recolhimento comuns.
- `src/styles/workspace-layout.css`: **única fonte** para a geometria das colunas e dos painéis.
- `src/styles/scientific-ui.css`: estilos dos controles e elementos científicos, **sem definir a geometria das colunas**.

As dimensões compartilhadas são 68 px (navegação), 232 px (painel), 8 px (espaçamento). O conteúdo restante é flexível. Os painéis específicos não podem sobrescrever `grid-template-columns`, `grid-column`, `position` ou offsets da estrutura.

## Restrições para manutenção

1. Não adicionar regras de correção de posicionamento ao fim de `scientific-ui.css`.
2. Não criar outro layout paralelo por ambiente.
3. Mudanças de geometria devem ser feitas no contrato de `workspace-layout.css`, conferindo os quatro ambientes.
4. Preservar as equações, cálculos e interação com os gráficos ao alterar o layout.
5. Antes de publicar: executar `npm run check` e conferir abertura/recolhimento dos quatro painéis, incluindo resoluções menores.

## Validação

Os testes de matemática não substituem um teste de interface no navegador. A uniformidade visual e o comportamento de recolhimento devem ser verificados com a aplicação renderizada.
