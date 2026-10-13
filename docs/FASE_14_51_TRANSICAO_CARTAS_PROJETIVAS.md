# Fase 14.51 — Transição projetiva entre as cartas z e Z

## Objetivo

Estabelecer e testar a transição exata entre a carta `r=(z,1)` e a carta recíproca `r=(1,Z)` no domínio de sobreposição, sem introduzir prolongamentos geométricos artificiais.

## Equações

Para o salto `U_+-U_-=(zY,Y)=(X,ZX)`:

- `Z=1/z`, `X=zY`, `Y=ZX` quando `z != 0` e `Z != 0`.
- O ponto médio `Ubar`, os estados `U_±` e a velocidade de Rankine–Hugoniot `s` são invariantes da mudança de carta.
- Na carta finita, `Ubar = base(z)+tau*tangent(z)`; a inversa recupera `tau` pela projeção sobre `tangent(z)`, não pelo reaproveitamento da coordenada livre recíproca.
- A carta recíproca continua regular em `Z=0`; não existe coordenada `z=1/Z` finita nesse ponto.

## Código

- `src/math/charts/reciprocalTransition.js`: `toReciprocal` e `fromReciprocal`.
- `tests/reciprocalTransition.test.js`: ida e volta em diversas fibras; preservação de `U_±`, `s`, traço e determinante; tratamento de `Z=0`.

## Limites e próximas etapas

Esta fase implementa a transição **matemática** e seus testes, não uma malha de Hopf de duas cartas no renderizador. A continuidade visual ao atravessar o infinito projetivo exigirá uma representação local consistente, incluindo a identificação das bordas da faixa de Möbius e o tratamento de triangulação/recorte. Não se deve simplesmente fechar triângulos entre `zc=-1` e `zc=+1` sem a transformação da amplitude `X`/`Y`.

O valor de `tau` pode tornar-se numericamente mal condicionado perto das extremidades da carta finita; a transição deve ser aplicada somente onde as duas cartas são regulares e as coordenadas são representáveis.
