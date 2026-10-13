# Levantamentos característicos dos dados de Riemann

Para cada estado fixado `U_L` ou `U_R`, o módulo `src/math/characteristic/riemannLifts.js` calcula as direções projetivas reais de autovetores de `DF(U)` e as velocidades características associadas. A orientação da fibra é `pi_-` para `U_L` (Hugoniot forward) e `pi_+` para `U_R` (Hugoniot backward).

O diagnóstico distingue dois autovalores reais distintos, um autovalor duplo com Jacobiano não escalar, Jacobiano escalar (infinitas direções próprias) e espectro não real. A direção `r=(1,0)` é representada por `Z=0`, sem truncamento artificial de `z`.

**Limite científico:** o resultado caracteriza direções de autovetores na coincidência `Y=0`. Não demonstra que cada direção tenha levantamento regular em uma carta da variedade de ondas, nem certifica multiplicidade de interseção da curva de Hugoniot com a característica. A fronteira `Delta=0` não é automaticamente uma tangência geométrica. Não são avaliadas admissibilidade, entropia ou rarefações.

Próximo passo: relacionar essas direções aos levantamentos da variedade, testar regularidade e tangência de forma intrínseca, e integrar a classificação das regiões de `Delta` no plano de estados.
