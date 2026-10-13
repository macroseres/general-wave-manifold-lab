# Fase 14.15.3 — Centros das singularidades

Corrigida a posição dos centros dos marcadores de singularidades de rarefação em `Scene.jsx`:

- Singulares finitas: `[q.tau, 0, q.zc]` (antes Y=0.05).
- Singulares no infinito na borda compactificada: `[0, 0, zh*0.998]` (antes Y=0.07).

A escala inversa do marcador continua compensando a escala anisotrópica do grupo pai. Não foram alterados os dados da integração, as curvas, a função `coincidencePoints` nem os eixos. As linhas amarelas representam o locus de coincidência E, não eixos.

Verificar vistas frente, lado e topo e a seleção dos marcadores.
