# Verificação do arco de rarefação em cadeias mistas

Para uma cadeia `rarefaction-shock`, o trecho da família lenta é percorrido de U_L até U_M. Para `shock-rarefaction`, o trecho da família rápida é percorrido de U_M até U_R, invertendo a ordem da trajetória armazenada a partir de U_R.

`assessMixedFanArc` avalia a velocidade característica em cada vértice até o segmento que contém U_M e no próprio U_M. Rejeita uma inversão de ordenação além da tolerância, a ausência de expansão estrita entre os extremos e um U_M incompatível com o segmento da poligonal. Os resultados são `sampled-fan-ordered`, `fan-speed-reversal`, `fan-not-expansive`, `middle-off-fan` ou um diagnóstico inconclusivo.

A verificação é necessária, mas não suficiente: não certifica monotonicidade entre amostras, coincidência exata da curva integral, admissibilidade de Liu nem existência de solução global do problema de Riemann. A integração com `mixedWaveCandidates` impede o status `mixed-ordered-lax-candidate` quando o arco amostrado não foi aprovado.
