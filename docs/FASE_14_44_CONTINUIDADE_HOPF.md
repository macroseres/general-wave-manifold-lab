# Fase 14.44 — Continuidade das superfícies de Hopf

## Motivação

Na fase 14.43, a geometria selecionava globalmente uma das cartas `Y(tau,zc)` ou `tau(Y,zc)` mediante amostras. Isso podia perder regiões regulares quando o coeficiente da variável escolhida se anulava em valores intermediários de `zc`.

## Construção

Para cada `zc`, a condição `tr(DF(U_±)-sI)=0` é afim em `(tau,Y)`:

`A(zc) tau + B(zc) Y + C(zc) = 0`.

Os coeficientes são obtidos avaliando o traço em `(0,0)`, `(1,0)` e `(0,1)`. A interseção da reta com o retângulo visível `tauMin <= tau <= tauMax`, `YMin <= Y <= YMax` produz até dois extremos distintos. O segmento é amostrado em orientação consistente pelo vetor tangente `(B,-A)`. Assim, não existe mudança de carta entre `Y(tau,zc)` e `tau(Y,zc)`.

Cada triângulo é recortado pela condição `det(DF(U_±)-sI) >= 0` e pelos limites da janela. A malha continua aproximada por triangulação linear. Os coeficientes simultaneamente nulos são tratados como degeneração: o algoritmo omite essa seção, sem afirmar regularidade nem preencher artificialmente a superfície.

## Alterações

- `src/geometry/hopf/surface.js`: substituição da seleção global de cartas pela interseção da reta de traço zero com a janela visível.
- `tests/hopfGeometry.test.js`: teste de permanência dos vértices no locus de traço zero.
- Mantida a opacidade configurada na fase 14.43; nenhuma alteração visual adicional de material.

## Limitações

A triangulação conecta segmentos amostrados em níveis adjacentes de `zc`; em mudanças topológicas ou regiões degeneradas ainda é necessário estudar refinamento adaptativo. O recorte `det >= 0` é linear por triângulo e, portanto, aproxima a fronteira `BT`. Não foi implementada uma parametrização analítica de `BT` nem garantida a conectividade global de todas as componentes de Hopf.

## Validação

Executar `node --test tests/hopfGeometry.test.js` e `npm run check`.

O teste adicional admite erro absoluto de traço inferior a `0.02` nos vértices gerados: o recorte interpola linearmente entre seções em `zc`, portanto seus vértices intermediários não satisfazem a equação não linear com exatidão. Esse limite é uma tolerância de regressão para o caso testado, não uma estimativa universal de erro.
