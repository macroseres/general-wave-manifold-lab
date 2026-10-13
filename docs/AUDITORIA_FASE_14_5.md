# Fase 14.5 — Auditoria da interface gráfica

## Escopo
- Variedade 3D: consolidar as regras CSS de layout das fases 14–14.2, sem alterar o Canvas, a câmera ou os cálculos.
- Espaço de estados: conferir que o gráfico `(u,v)` precede os diagnósticos e que os controles são recolhíveis.
- Espaço físico: conferir que o seletor de candidato e o tempo permanecem próximos dos gráficos, e que os perfis respondem à largura disponível.

## Alteração implementada
As regras redundantes de grid de três, duas e uma coluna da Variedade 3D foram substituídas por uma única configuração de três trilhos. Os painéis recolhidos têm trilhos de `0px`, e o gráfico permanece sempre no trilho central. Os botões de borda preservam suas posições abertas e fechadas.

## Verificação manual obrigatória
1. Abrir ambos os painéis da Variedade 3D; conferir que o gráfico está centralizado.
2. Fechar apenas os controles, depois apenas a inspeção e depois ambos; conferir que a largura liberada pertence ao Canvas.
3. Girar, aplicar zoom e selecionar pontos após cada mudança de largura; verificar que a câmera não reinicia.
4. Em Espaço de estados, testar arraste de `U_L` e `U_R`, seleção de curvas e redimensionamento.
5. Em Espaço físico, alternar candidatos e tempo; verificar o diagrama `(x,t)` e os perfis em desktop e mobile.
6. Confirmar que Documentação não mudou.

## Limites
Esta fase é uma consolidação estrutural. Não modifica a matemática e não constitui teste visual automatizado em navegador. Executar `npm run check` e realizar os testes manuais acima.
