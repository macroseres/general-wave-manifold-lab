# Limpeza CSS 16.16

Removidas nove regras de cartão/summary legado de `.sidebarSection` em `style.css`, preservando estilos de controles específicos. Removida borda de `.statePanelSection` que competia com o separador compartilhado. Removidas propriedades redundantes de `.documentationIndex` em `workspace-layout.css`, mantendo a definição no CSS compartilhado.

Os seis CSS foram analisados por parser sem erros de sintaxe. Este patch não elimina todas as regras legadas nem comprova igualdade visual, que exige inspeção no navegador.
