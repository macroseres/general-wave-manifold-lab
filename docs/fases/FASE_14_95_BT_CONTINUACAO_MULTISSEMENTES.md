# Fase 14.95 — Continuação de BT com múltiplas sementes

- Mantém a opção **Original (malha sônica)** para comparação.
- No modo experimental, distribui sementes ao longo de cada polilinha extraída, em vez de usar somente o ponto central.
- Projeta cada semente nas duas equações implícitas de BT⁻ e continua nos dois sentidos.
- Adapta o passo com até 12 tentativas e limite de passo mínimo menor, para lidar com curvatura elevada.
- Só une extremidades próximas se suas tangentes forem compatíveis; componentes desconectadas permanecem separadas.
- BT⁺ continua sendo obtida exclusivamente pela involução †.

## Limitações

A continuação ainda pode terminar em regiões degeneradas, perto das fronteiras do domínio ou em pontos de mau condicionamento. A quantidade de componentes encontradas depende das sementes e não constitui certificação topológica de completude. Não substituir o modo original sem validação visual e geométrica.
