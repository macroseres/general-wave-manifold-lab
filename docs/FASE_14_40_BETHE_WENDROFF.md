# Fase 14.40 — Curvas de Bethe–Wendroff / Bogdanov–Takens

Referência: *Wave Manifold for Quadratic Models*, §3.6 e §4.8.

Em S⁺, det(DF(U₊)−sI)=0 e BT⁺ é a interseção de S⁺ com a saturação backward de E. Em S⁻, aplica-se a reflexão: BT⁻ = S⁻ ∩ sat_forward(E). Nesses conjuntos, tr(DF(U±)−sI)=0. A identidade Δ=tr²−4det implica Δ=tr² sobre S±.

O aplicativo agora extrai a isolinha espectral zero da própria triangulação sônica e desenha BT⁻ em âmbar e BT⁺ em magenta. O recorte usa interseções de aresta compartilhadas pelos ramos lento e rápido. É uma **aproximação linear da curva BT na malha**, não uma parametrização analítica exata; a tangência entre superfícies não é assumida. O campo `bt` de `partitionSonicMesh` contém segmentos independentes; não se supõe conectividade nem se unem componentes artificialmente.

Validação local: testes Node de Bethe–Wendroff e partição. Para validação completa executar `npm run check`.
