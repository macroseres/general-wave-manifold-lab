# Fase 14.23 — Extremidades e degenerações

- A malha utiliza `zFromZc`, o mesmo mapeamento limitado adotado pela carta matemática, em vez de calcular `tan` independentemente.
- Triângulos inteiramente coincidentes (`G=0` nos três vértices) são classificados como área de coincidência, e não duplicados nas folhas lenta e rápida.
- Arestas inteiramente coincidentes são contabilizadas como fronteira quando adjacentes a triângulos não totalmente coincidentes.
- A auditoria registra `coincidenceArea`, `coincidenceTriangles` e `coincidenceEdges`.
- Uma fibra degenerada em que a carta não parametriza o estado permanece explicitamente marcada como inválida: a malha **não** tenta inventar uma superfície ou uma parametrização para ela.

## Limites

O teste de vértices exatamente nulos não substitui a classificação analítica de degenerações isoladas, nem constitui tratamento global da carta recíproca. A avaliação de raízes de aresta ainda usa bisseção e pode exigir tolerância adaptativa em casos mal condicionados.
