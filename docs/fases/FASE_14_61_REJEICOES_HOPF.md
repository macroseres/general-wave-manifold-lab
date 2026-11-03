# Fase 14.61 — Rastreabilidade das rejeições de Hopf

O gerador `hopfSurfaceMesh` agora aceita `diagnostics: true`, retornando o campo adicional `diagnostics` sem alterar `positions` nem `indices`. A opção é desativada por padrão.

## Contabilidade

Cada um dos `2*nTau*nZ` triângulos candidatos recebe exatamente uma classificação: aceito (produziu ao menos um triângulo) ou rejeitado (não produziu nenhum). As rejeições são classificadas pela primeira condição impeditiva: vértice ausente, avaliação inválida nos pontos de controle, resíduo de traço, recorte pelo determinante, recorte pela janela de tau ou Y, degenerescência geométrica. Os polígonos recortados podem produzir mais de um triângulo de saída; por isso `accepted` não precisa ser igual a `indices.length/3`.

O relatório registra até oito exemplos por causa com o centro aproximado dos vértices candidatos disponíveis, e, para falhas de traço, o ponto de controle e o resíduo. As fatias também são contabilizadas conforme falha espectral, gradiente degenerado, falta de interseção com a janela ou validade.

## Reprodução

`npm run audit:hopf:rejections`

## Limites de interpretação

A classificação registra o primeiro motivo que interrompeu a emissão; um mesmo candidato poderia falhar em outras condições não avaliadas depois da primeira rejeição. `determinantClip` significa que o polígono foi completamente removido pelo recorte, e não necessariamente que exista erro numérico. O relatório ainda não associa causalmente cada aresta aberta da malha final a um candidato rejeitado. Não foi introduzida nenhuma interpolação ou conexão artificial entre componentes.
