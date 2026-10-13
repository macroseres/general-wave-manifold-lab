# Layout etapa 5 — ambientes científicos no viewport principal

Os ambientes Variedade 3D, Espaço de estados e Espaço físico são mutuamente exclusivos e ocupam a mesma área central. As abas do cabeçalho alternam `activeWorkspace`, sem sobreposição modal.

Os controles e o painel de inspeção próprios da variedade 3D são exibidos somente no ambiente 3D. Os dois ambientes 2D preservam seus componentes científicos, suas seções expansíveis e a seleção compartilhada das cadeias candidatas. O botão de inspeção do Espaço físico navega diretamente para o Espaço de estados.

As janelas auxiliares (Ajuda, cartas locais e regiões espectrais) continuam modais. O modo inline desativa fechamento por Escape e pelo backdrop nos ambientes principais. Os componentes 2D são montados ao selecionar sua aba, mantendo no App os estados compartilhados.

Verificação: `node --test` — 532 testes aprovados. Validar adicionalmente `npm run check` e responsividade no navegador com dependências instaladas.
