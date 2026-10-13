# Auditoria local da estrela do vértice P

Comando: `npm run audit:sonics:vertex-star`.

O script procura o vértice mais próximo de `P=(0,0,0.997973177)` na malha final de cada sônica, identifica triângulos e arestas incidentes, calcula o link combinatório, a conectividade do link, arestas de fronteira, comprimentos e resíduos da equação implícita. Não modifica o gerador nem o Worker.

## Limites

Esta é uma auditoria **da malha final**, não um rastreamento dos tetraedros geradores. Um link conexo em forma de caminho é consistente com uma vizinhança topológica de fronteira, mas não certifica que a fronteira coincida com a interseção geométrica correta com o domínio. O teste usa apenas os coeficientes e domínio padrão. A verificação da origem dos tetraedros e de outras escolhas de parâmetros fica pendente.
