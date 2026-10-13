# Raízes polinomiais do determinante de Rankine–Hugoniot

Para o fluxo quadrático `F`, sobre o segmento `q(t)=a+t(b-a)` com `0<=t<=1`,

`D(t)=det(q(t)-U_fix, F(q(t))-F(U_fix))`

é um polinômio real de grau no máximo 3. Os quatro valores em `t=0,1,-1,2` determinam seus coeficientes. O algoritmo encontra os pontos estacionários reais da derivada quadrática, particiona `[0,1]` em intervalos de monotonicidade e usa bisseção onde há mudança de sinal. Testa também cada extremo e ponto estacionário, permitindo encontrar raízes tangenciais com precisão numérica. Quando `D` é identicamente zero sobre o segmento, escolhe o ponto mais próximo do estado intermediário informado.

O refinamento só é aceito se o ponto estiver próximo de `U_M`, tiver salto não trivial, velocidade finita e resíduo relativo de Rankine–Hugoniot abaixo da tolerância. Isso não prova admissibilidade entrópica. Casos mal condicionados podem exigir tolerâncias e análise adicional; o polinômio é reconstruído numericamente, não por aritmética exata.
