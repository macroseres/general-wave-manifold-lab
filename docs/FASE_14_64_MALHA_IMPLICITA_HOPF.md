# Fase 14.64 — Malha implícita das superfícies de Hopf

A cena 3D utiliza agora `method: 'implicit'` na geração de Hopf. O gerador anterior permanece acessível pelo modo `legacy`, inclusive para auditorias e comparações.

## Método

Em cada seção de direção projetiva, a equação `tr(DF(U±)-sI)=0` é afim em `(tau,Y)`: `A(z) tau+B(z) Y+C(z)=0`. A implementação escolhe o gráfico `tau(Y,z)` ou `Y(tau,z)` segundo a estabilidade relativa dos coeficientes e as dimensões da janela. Cada vértice é avaliado sobre o gráfico. As interseções produzidas pelo recorte são reprojetadas sobre o traço zero. O recorte impõe `det >= 0` e a janela visual.

## Verificação

Com parâmetros de referência e janela `tau=[-1,1]`, `Y=[-6,6]`, a malha nova contém 674 triângulos em Hopf− e 676 em Hopf+. O resíduo do traço nos vértices ficou próximo de 1e-15. Os testes adicionais verificam o traço, o determinante e a janela.

## Limitações

A aproximação triangular entre vértices não é uma parametrização exata de cada ponto interior; portanto a validação do traço nos vértices não garante erro nulo em toda face. O algoritmo não conecta seções que mudam de carta gráfica e pode conservar costuras locais. O recorte numérico pelo determinante usa bisseção com reprojeção; o limite det=0 é incluído apenas como fronteira da malha, enquanto a definição estrita de Hopf exige det>0. A continuidade global em Z=0 e a ausência de buracos ainda devem ser verificadas visualmente. Não se deve considerar esta fase uma prova de completude geométrica.
