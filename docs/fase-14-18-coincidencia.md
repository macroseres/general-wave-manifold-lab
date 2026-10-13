# Fase 14.18 — Coincidência e folhas

- A diferença assinada `gap = s - other` é calculada uma vez em `characteristicSpectrum`.
- `coincidenceTauRoots` resolve a equação linear em τ, sem resolver novamente a raiz dupla do discriminante.
- A mesma função `gap` classifica as folhas e localiza o corte das arestas; o corte usa bisseção na coordenada visual não linear ẑ.
- A curva de coincidência permanece em Y=0, sem deslocamento artificial.
- O locus projetado satisfaz D(Ū)=gap² em aritmética exata; diferenças numéricas devem ser auditadas com tolerância.
- Pontos de fibras degeneradas ou coincidência identicamente nula requerem tratamento próprio e não são interpolados nesta carta.
