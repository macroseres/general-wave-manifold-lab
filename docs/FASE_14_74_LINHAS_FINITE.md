# Fase 14.74 — Proteção de linhas 3D contra NaN

- Componente `Line` da cena valida todos os pontos antes de enviar ao `three-stdlib`.
- Polilinhas são interrompidas em coordenadas inválidas; não se cria conexão artificial entre componentes.
- Para linhas com `segments`, cada par é validado isoladamente.
- O agrupamento de segmentos BT ignora segmentos de origem não finitos.
- Testes de regressão para NaN, Infinity e continuidade dos segmentos.

A correção impede a emissão de geometria inválida pelos componentes `Line` desta cena, mas não identifica por si só a origem numérica dos pontos inválidos. É necessário verificar visualmente as curvas e investigar o gerador se surgirem lacunas.
