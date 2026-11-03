# Fase 14.34 — Navegação projetiva

- Marcadores de direções excepcionais compensam a escala anisotrópica da cena para preservar tamanho e forma dos indicadores visuais.
- Seleção via painel e via clique no marcador passam pelo mesmo callback.
- Para a direção projetiva infinita, a escolha da extremidade da carta usa o sinal da coordenada visual atual; ambas representam o mesmo ponto projetivo.
- A linha de destaque permanece uma guia gráfica, não uma fibra matemática.
- As escalas padrão, a opacidade e as cores da fase anterior não foram alteradas.

Validação: `node --test tests/*.test.js` (574 testes aprovados). Verificar também `npm run check` em ambiente com dependências instaladas.
