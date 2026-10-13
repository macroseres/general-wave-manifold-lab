# Fase 14.48 — Aproximação das extremidades compactificadas de Hopf

## Configuração de referência

- Janela de amostragem: τ ∈ [-1, 1], Y ∈ [-6, 6].
- Escala visual: τ = 1,75; Y = 0,25; ẑ = 2,55 (configuração do usuário; não altera as equações).
- Diagnóstico: isolar Hopf⁻ e Hopf⁺ e comparar vistas Frente, Lado e Topo.

## Causa e correção

A malha de Hopf tinha um recorte independente `zcMin=-0.98`, `zcMax=0.98`, enquanto outras malhas atingiam ±0.999. Isso interrompia a amostragem antes das bordas da carta compactificada.

Agora a malha utiliza `[-0.999, 0.999]` por padrão e distribui os cortes em ẑ pelo mapa cosseno, concentrando amostras perto de ambas as extremidades. Mantivemos a equação implícita do traço e a restrição `det >= 0`, assim como a verificação de resíduo nas faces e o recorte da janela τ/Y.

## Limitações matemáticas

Os pontos ẑ=±1 representam limites no infinito da carta e **não** são pontos regulares para avaliação direta de `hopfAt`. Portanto, não foram adicionados vértices artificiais exatamente em ±1 nem faces sem suporte na condição espectral. Se o conjunto Hopf não intersecta a janela visível perto das bordas, a malha continuará terminando antes delas legitimamente. A cobertura global do infinito requer análise assintótica ou carta projetiva própria, ainda não implementada.

## Validação

Executar `node --test tests/hopfGeometry.test.js` e `npm run check`. O teste adicional verifica finitude e interioridade da coordenada compactificada para a janela de referência; não certifica que a superfície alcance ambas as bordas, o que depende dos parâmetros do fluxo.
