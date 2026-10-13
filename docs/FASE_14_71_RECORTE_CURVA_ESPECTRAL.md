# Fase 14.71 — Recorte de Hopf pela curva espectral

As superfícies candidatas são definidas por `trace(DF(U±)-sI)=0` nas cartas ordinária e recíproca. A região exibida é `det(DF(U±)-sI)>0`, e sua fronteira relativa é `trace=0, det=0`.

O módulo `src/geometry/hopf/spectralCurveClip.js` subdivide cada triângulo da folha de traço zero duas vezes, identifica mudanças de sinal de determinante e calcula as interseções por bisseção de 32 passos, reavaliando o determinante **na própria folha**. A subdivisão também permite encontrar pequenas regiões positivas que não contêm nenhum vértice da célula original. Os dois geradores (`implicitSurface.js` e `reciprocalWindowSurface.js`) utilizam a mesma rotina.

**Limitações:** o contorno é uma aproximação poligonal da curva implícita, não uma solução simbólica. A profundidade finita não garante encontrar ilhas menores que a escala de amostragem. A condição estrita `det>0` é representada visualmente pelo fechamento `det>=0`. A identificação topológica entre cartas e a representação de `Z=0` continuam exigindo validação independente. Os testes não substituem a inspeção visual da cena.
