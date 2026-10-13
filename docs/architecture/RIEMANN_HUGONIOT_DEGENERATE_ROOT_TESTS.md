# Raízes degeneradas na restrição de Hugoniot

Para um fluxo quadrático em duas componentes e um segmento de estados
\(q(t)=a+t(b-a)\), a função
\[
D(t)=\det\big(q(t)-U_0,F(q(t))-F(U_0)\big)
\]
é um polinômio de grau no máximo três. A busca de zeros separa o intervalo
pelas raízes da derivada, incluindo pontos estacionários onde uma raiz
múltipla pode não produzir mudança de sinal.

## Exemplo analítico de tangência

Considere \(F(u,v)=(u^2/2,uv)\), \(U_0=(0,0)\) e \(q(t)=(2t-1,1)\).
Então \(D(t)=(2t-1)^2/2\), com raiz dupla em \(t=1/2\).
A raiz corresponde a um salto não trivial. Testes específicos verificam:
raiz interior tangencial, segmento invertido, distância excessiva de \(U_M\),
segmento degenerado fora de Hugoniot e raiz no extremo.

A correção de extremo permanece restrita ao segmento de proveniência e
sujeita a um limite para o resíduo relativo de Rankine–Hugoniot. Essa
verificação **não** estabelece admissibilidade entrópica, nem garante
certificação algébrica exata perto de degenerescências mal condicionadas.
