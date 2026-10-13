# Layout — etapa 9: acesso responsivo aos painéis 3D

Em larguras de até 760 px, a Variedade 3D apresenta os controles **Controles** e **Inspeção** acima da cena. Somente o painel solicitado aparece; pressionar novamente o controle fecha o painel. O canvas permanece no ambiente central e recebe o espaço disponível.

Os ambientes Espaço de estados, Espaço físico e Documentação permanecem workspaces centrais independentes. Nenhum cálculo matemático foi modificado.

## Validação

A suíte `npm test` passou com 532 testes. Executar `npm run check` em ambiente com dependências instaladas para verificar lint e build e testar manualmente tamanhos de tela e interação 3D.
