# Fase 14.16 — Correção de representação de E

A rotina `coincidencePoints` retorna pontos `{tau,z,zc}` pertencentes à característica `Y=0`. A conversão de pontos para a cena 3D requer `Y` explícito. A implementação anterior enviava `undefined` como coordenada vertical, produzindo `NaN` e impedindo a representação consistente de E. Nesta fase a renderização usa `curve.map(q => ({...q,Y:0}))` antes de `curvePoints3D`.

A classificação de C_s e C_f já está implementada em `characteristicSpectrum(tau,z,p)` no módulo `src/math/characteristic/spectrum.js`: `gap=s-other`, `gap<0` corresponde a `slow`, `gap>0` a `fast`, com tolerância perto de E. Não foram adicionadas cores para essas folhas nesta etapa, para evitar uma malha que cruze artificialmente E. A revisão da continuidade dos ramos de E e a triangulação por folha devem preceder a coloração.

Validar com `npm run check` e `npm run dev` e conferir as vistas Frente, Lado e Topo.
