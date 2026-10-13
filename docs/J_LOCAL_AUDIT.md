# Auditoria localizada de J

Executar somente sob demanda: `npm run audit:j:local`.

A auditoria extrai a interseção das malhas sônicas existentes, avalia |K| nos extremos e pontos médios dos segmentos e compara as distâncias à curva J aproximada por contornos em duas resoluções (80x120 e 320x480). A métrica não é uma distância exata ao conjunto implícito K=0. Os pontos médios de cordas podem ter resíduo não nulo mesmo quando seus extremos pertencem à curva.

Não há importação deste script pelo renderizador. Nenhuma malha de produção foi alterada.
