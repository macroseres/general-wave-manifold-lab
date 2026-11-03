# Fase 14.68 — Recorte da malha recíproca na janela visual

## Correção implementada

O projetor `reciprocalHopfDisplayMesh` anteriormente rejeitava um triângulo inteiro caso qualquer vértice estivesse fora dos limites de τ ou Y. Agora recorta o polígono projetado contra as quatro bordas da janela e triangula a porção interior. Vértices de determinante nulo provenientes do recorte nativo não são descartados por um teste estrito de positividade; a tolerância admite erros de arredondamento.

## Limitação geométrica importante

O patch recíproco nativo é limitado por |X|≤8 e |free|≤8. Como Y=ZX, perto de Z=0 ele cobre apenas uma faixa cada vez mais estreita em Y. Não é correto concluir que a união visual resultante completa a superfície para Y finito quando Z→0. O ponto Z=0 também não tem coordenada finita na visualização (τ,Y,ẑ). A malha atual ainda NÃO é uma triangulação global do atlas nem fecha todas as lacunas da captura.

## Verificação

`npm test` valida as propriedades geométricas já cobertas pela suíte. A inspeção visual das bordas ainda é necessária.
