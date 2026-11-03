# Fase 14.65 — Correção de costuras na malha implícita de Hopf

## Defeito identificado

Na fase 14.64, o gerador descartava uma faixa inteira quando as duas seções em ẑ escolhiam gráficos locais distintos (`tau(Y,ẑ)` versus `Y(tau,ẑ)`). Isso produzia cortes artificiais aproximadamente verticais na superfície renderizada.

## Correção

O gráfico é escolhido **por faixa**, comparando os coeficientes médios da equação afim do traço. As duas seções são amostradas usando a mesma variável independente, e os pontos resultantes continuam sendo avaliados pela equação espectral. Não se alteraram a condição `det >= 0`, a reprojeção dos vértices recortados nem os limites de visualização.

## Verificação

Para a configuração de referência, o número de triângulos de Hopf⁻ mudou de 674 para 712, e o de Hopf⁺ de 676 para 712. Os testes de traço zero, determinante não negativo e regressão de contagem passaram. A contagem é uma proteção de regressão para o exemplo, não uma prova de continuidade topológica global.

## Limitações

A construção permanece uma aproximação por triângulos em cartas locais. A continuidade global no infinito e a ausência de toda lacuna visual exigem inspeção da renderização e análise adicional. Não se deve unir regiões separadas por `det=0`.
