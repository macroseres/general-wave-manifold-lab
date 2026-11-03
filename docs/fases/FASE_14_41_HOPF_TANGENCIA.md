# Fase 14.41 — Hopf e tangência Bethe–Wendroff

## Referência
B. Plohr et al., *Wave Manifold for Quadratic Models*, rascunho de 12/07/2023, seções 3.5–3.6 e 4.8, pp. 11–15. O texto distingue a superfície de coincidência saturada (`Δ^±=0`) da superfície de Hopf (`tr M^±=0`, `Δ^±<=0`).

## Identidades exatas
Para `M^±=DF(U_±)-sI`, escreva `t^±=tr M^±`, `d^±=det M^±` e `Δ^±=(t^±)^2-4d^±`.

- Saturação da coincidência: `Δ^±=0`, pois a discriminante depende somente do estado `U_±`.
- Sônica fora da característica: `d^±=0`.
- Bethe–Wendroff: `d^±=t^±=0`, logo `BT^±=S^±∩{Δ^±=0}`.
- Hopf: `t^±=0` com `d^±>0` (equivalentemente `Δ^±<0`). Seu fecho contém `BT^±` onde `d^±=0` e encontra `E` na característica `Y=0`.

**Tangência:** `dΔ^±=2t^± dt^±-4 dd^±`; sobre `BT^±`, `dΔ^±=-4 dd^±`. Assim, as superfícies `Δ^±=0` e `d^±=0` têm planos tangentes iguais onde `dd^± != 0` e ambas são regulares. Isso NÃO afirma que uma curva individual de Hugoniot seja tangente à sônica.

## Implementação
- `src/math/sonic/hopf.js`: cálculo dos invariantes espectrais sem recalcular o estado em cada termo; `hopfHeight` resolve exatamente a equação linear do traço em `Y` para fluxos quadráticos.
- `src/geometry/hopf/surface.js`: malha da folha `tr M^±=0` nas coordenadas `(tau,Y,zc)`, limitada a `det M^±>=0` por recorte linear em cada triângulo.
- `src/components/Scene.jsx`: representação translúcida das duas folhas Hopf, condicionada à visibilidade da sônica correspondente, para evitar novos controles nesta etapa.
- `tests/hopfGeometry.test.js`: traço nulo, simetria entre lados e integridade dos triângulos.

## Limitações e próximos passos
1. A representação usa a carta de gráfico `Y(tau,zc)` e **não** representa regiões onde `tr(directionalJacobian)=0`, inclusive possíveis componentes verticais; nenhuma superfície artificial é adicionada nessas regiões.
2. O recorte `det>=0` é linear por triângulo; a fronteira desenhada é uma aproximação, não a parametrização analítica de BT.
3. Ainda não existe controle independente para `Hopf^±`; acompanha a visibilidade de `S^±`.
4. A relação de tangência é **entre superfícies** (`Δ=0` e `det=0`), não entre uma folha de Hugoniot e a sônica.
5. Não há alegação de validação de lint/build sem dependências instaladas.
