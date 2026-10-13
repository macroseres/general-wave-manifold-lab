# Fase 14.25 — fibras projetivas e opacidade

- Aumentada a opacidade das folhas características de 0.34 para 0.72 (menos transparentes), sem deslocar Y=0 nem mudar as cores.
- Acrescentada classificação explícita da direção projetiva infinita Z=0 por `fiberZ`, sem simular infinito com um z grande.
- `characteristicProjectiveFiber` reutiliza `fiber` e `fiberZ` para distinguir fibras regulares, ausentes e degeneradas, sem recalcular os coeficientes manualmente.
- Casos `P=Q=R=0` não são desenhados artificialmente como uma reta: sua representação global requer parametrização de outra dimensão.
- Esta fase não altera a triangulação nem afirma resolver a reconstrução geométrica global de fibras degeneradas.
