# Sementes características da Hugoniot forward

Para U_L fixo, a incidência escalar H(U)=det(U-U_L,F(U)-F(U_L)) é degenerada em U=U_L. Em hiperbolicidade estrita, os ramos não triviais próximos do estado fixo são tangentes aos autovetores r_s e r_f de DF(U_L). A rotina `characteristicForwardHugoniotSeeds` cria deslocamentos ±εr_i e os corrige numericamente em H=0, exigindo também o resíduo de Rankine–Hugoniot.

`selectCharacteristicForwardSeed` compara o primeiro segmento da guia amostrada com essas quatro direções e exige alinhamento suficiente e identificação não ambígua. `pseudoArcForwardHugoniot` incorpora essa seleção; quando o espectro é coincidente ou não é estritamente hiperbólico, preserva o método guiado anterior sem declarar família. Se uma guia é incompatível com todas as direções, a continuação é inconclusiva.

**Limites:** as sementes não provam existência global nem admissibilidade entrópica; a continuação continua condicionada à guia amostrada. A identificação local não substitui a seleção topológica global de ramos, a condição de Liu contínua nem perfis viscosos.
