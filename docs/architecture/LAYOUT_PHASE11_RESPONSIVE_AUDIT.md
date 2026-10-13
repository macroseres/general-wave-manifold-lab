# Layout — etapa 11: auditoria estrutural responsiva

## Escopo

Revisão da navegação dos quatro ambientes (Variedade 3D, Espaço de estados, Espaço físico e Documentação), preservando o conteúdo científico e a arquitetura de navegação já implementada.

## Ajustes

- Cabeçalho com dimensões e quebra de texto controladas em telas intermediárias.
- Navegação dos ambientes com rolagem horizontal independente em telas estreitas, evitando cortes de botões.
- Altura máxima do cabeçalho e rolagem vertical controlada quando os controles ocupam muitas linhas.
- Painéis móveis 3D com limite de altura relativo à viewport dinâmica, preservando a área central.
- Índice da documentação com alvos maiores e foco visível.
- Restrições de largura e overflow no workspace para reduzir rolagem horizontal global.

## Limites da validação

`npm test` passou com 532 testes. A auditoria foi estática/estrutural; ainda é necessária uma inspeção visual no navegador em resoluções desktop, tablet e celular. `npm run check` deve ser executado na máquina com as dependências instaladas para validar lint e build.

## Checklist manual

1. Desktop (>= 1200 px): verificar se os três painéis 3D não se sobrepõem.
2. Tablet (761–1100 px): verificar a quebra do cabeçalho e os menus.
3. Celular (<= 760 px): navegar pelas quatro abas e confirmar acesso a Controles e Inspeção.
4. Celular estreito (<= 400 px): confirmar rolagem horizontal da navegação sem cortar botões.
5. Documentação: abrir links do índice, rolar equações largas e usar teclado.
6. Espaços de estados e físico: confirmar tabelas com rolagem interna e gráficos sem corte.
