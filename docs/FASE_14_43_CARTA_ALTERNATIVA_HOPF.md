# Fase 14.43 — Carta alternativa de Hopf e opacidade

## Equação e mudança de carta

A superfície Hopf± satisfaz tr(DF(U±)−sI)=0 e det(DF(U±)−sI)>0.
A representação anterior resolvia a equação do traço para Y em função de (τ,ẑ),
mas torna-se singular quando o coeficiente de Y se anula.

Esta fase adiciona `hopfTau(Y,zc,p,side)`, que resolve a mesma equação,
agora para τ em função de (Y,ẑ). Como o fluxo é quadrático e a fibra
é afim em τ, o traço é afim em τ; dois valores (τ=0,1) determinam
seu coeficiente exatamente, salvo erro de arredondamento.

Quando a carta τ(Y,ẑ) é regular nos pontos de controle, a malha usa
esta carta; caso contrário, preserva a carta anterior Y(τ,ẑ).
A malha é recortada por det≥0, τmin≤τ≤τmax e Ymin≤Y≤Ymax.

## Aparência

Opacidade das superfícies Hopf± aumentada de 0,20 para 0,34.
Isto **diminui a transparência** sem alterar a opacidade das sônicas.

## Limitações

- A seleção da carta é global e baseada em amostras; degenerações entre
  amostras podem exigir atlas local com transição entre cartas.
- O recorte de determinante usa interpolação linear por triângulo.
- A representação é uma aproximação de malha, não uma certificação topológica.

## Validação

Executar `npm run check`. O teste adicional verifica o resíduo do traço
na carta alternativa e os limites visíveis da geometria.
