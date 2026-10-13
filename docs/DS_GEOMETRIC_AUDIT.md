# Auditoria geométrica da dupla sônica

A renderização normal **não** executa interseção triângulo–triângulo. A dupla sônica permanece definida por K=0 e det(M)=0, independentemente das malhas.

Execute manualmente `npm run audit:ds` (ou `npm run audit:ds -- --ntau 16 --ny 12 --nz 22`) para construir duas malhas sônicas, calcular sua interseção geométrica e comparar amostras com as construções analíticas de DS e J.

Os números reportados são distâncias em coordenadas (tau,Y,zc), **não** pixels nem coordenadas de escala da cena. Distâncias elevadas podem resultar de amostragem esparsa, segmentos coplanares ignorados e/ou diferenças reais de triangulação. A rotina não modifica superfícies nem configurações de produção. Resoluções altas podem aumentar muito o custo; use apenas em desenvolvimento.
