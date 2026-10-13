# Scientific UI Foundation — dev.17

The UI is downstream of validated mathematics and geometry. Its job is inspection, control and presentation; it must not redefine scientific objects.

## Semantic tokens and themes

`src/styles/tokens.css` is the canonical semantic palette. Dark is the first-use default; the user may switch to light. The preference is local presentation state and is intentionally not part of the scientific experiment schema.

Interactive controls must expose keyboard focus. Reduced-motion preferences are respected. Mathematical notation remains routed through `MathLabel` / `MathBlock` and KaTeX.

## Terminology

The finite wave-manifold chart uses `(tau,Y,z)`. The controls `tauMin`, `tauMax`, `YMin`, `YMax` specify a **sampling window**, not the mathematical domain of `W`. The experiment schema therefore uses `scientific.samplingDomain`. Schema v1 files using `scientific.domain` are migrated to schema v2 on import.

`zc=(2/pi) arctan(z)` is a visual compactification coordinate. `Z=1/z` is the reciprocal projective chart. UI labels must not conflate them.

## Responsive policy

Desktop preserves the three scientific regions: controls, 3D view and inspection. At narrow widths the 3D view remains primary and side inspection panels are hidden rather than squeezed into unusable widths. Dialogs remain independently scrollable.

## Foundation closure

The pre-Hugoniot foundation now has explicit ownership for mathematics, numerics, geometry, rendering, experiment serialization and UI semantics. New mathematical objects must use these existing boundaries rather than introduce feature-specific exceptions.

## Etapa 6 — harmonização incremental

As cores semânticas dos diagramas de inspeção e dos overlays passaram a utilizar tokens de tema; **as cores científicas das curvas não foram alteradas**. A harmonização completa de painéis, tipografia e responsividade continua pendente de inspeção visual.

## Incremento: controles e responsividade (08/10/2026)

`src/styles/scientific-ui.css` é carregado após `style.css` e centraliza altura mínima e raio dos controles, foco visível, cor dos inputs, contraste do painel de auditoria, limites dos diálogos e disposição móvel. Inclui respeito a `prefers-reduced-motion`. Não altera as cores das curvas, as superfícies nem os dados matemáticos. A revisão visual no navegador e o perfil de GPU continuam pendentes.
