# Auditoria geométrica contínua da DS

Executar somente sob demanda: `npm run audit:ds`.

A comparação utiliza distâncias ponto–segmento, nos dois sentidos: curva canônica para segmentos extraídos e segmentos extraídos para curva canônica. Segmentos da interseção são classificados pelo locus canônico mais próximo de seu ponto médio. Não há importação desse cálculo pelo renderizador.

Limitações: as curvas canônicas são representadas por polilinhas; a interseção triângulo–triângulo pode perder segmentos coplanares; a classificação por proximidade pode ficar ambígua junto a cruzamentos de J e DS. Distâncias pequenas não provam cobertura topológica completa.
