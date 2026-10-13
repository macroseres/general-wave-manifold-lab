# Fase 14.69 — Amostragem recíproca adaptada à janela Y

## Motivação

A fase 14.68 usava um intervalo limitado de X na carta recíproca. Como Y=ZX, essa escolha encolhia a região representada em Y quando Z se aproximava de zero. O recorte posterior da janela não podia recuperar pontos que nunca haviam sido amostrados.

## Mudança implementada

O módulo `src/geometry/hopf/reciprocalWindowSurface.js` amostra diretamente `(Y,Z)`, com `X=Y/Z`, resolve a equação afim do traço para a coordenada livre da carta recíproca, e reconstrói as coordenadas visuais por `fromReciprocal`. Os intervalos em `|Z|` têm espaçamento geométrico para melhorar a cobertura perto de zero. Os triângulos são recortados por `tauMin <= tau <= tauMax` e `det >= 0`; pontos de interseção são novamente avaliados na equação implícita, não apenas interpolados em coordenadas visuais.

`src/components/Scene.jsx` utiliza o novo gerador no lugar de `reciprocalHopfDisplayMesh`. O gerador antigo permanece no repositório para comparação.

## Verificações

`tests/hopfReciprocalWindow.test.js` verifica, para os dois sinais, a finitude, a janela e os resíduos espectrais nos vértices. A suíte completa contém 634 testes aprovados neste ambiente. Lint e build não foram executados.

## Limitações

A nova amostragem não garante fechamento global nem continuidade entre as malhas da carta z e da carta Z. A fronteira `Z=0` não possui representação regular em `(tau,Y,zc)` para `Y` fixo não nulo, porque `X=Y/Z` diverge. Também pode haver sobreposição visual entre as duas malhas no domínio comum. A existência de superfícies de Hopf nas extremidades depende da condição espectral `det>0`; nenhuma superfície é inventada para preencher regiões em que essa condição falha. Conferir o resultado no navegador.
