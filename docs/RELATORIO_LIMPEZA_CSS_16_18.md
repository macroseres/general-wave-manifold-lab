# Consolidação CSS 16.18

Remoção de declarações anteriores sobrescritas por declarações posteriores do **mesmo seletor e mesmo contexto** no mesmo arquivo. Não foram removidas classes por ausência de correspondência textual, nem regras responsivas de contexto diferente.

Declarações removidas: 36

- `src/style.css` — `aside`: background
- `src/style.css` — `.view`: background
- `src/style.css` — `.info small`: background
- `src/style.css` — `.badge`: background
- `src/style.css` — `.helpHeader button`: background,color
- `src/style.css` — `.helpIndex`: background
- `src/style.css` — `.helpIndex a`: color,background
- `src/style.css` — `.chartBg`: fill
- `src/style.css` — `.chartAxis`: stroke
- `src/style.css` — `.localChartBody svg text`: fill
- `src/style.css` — `.helpBody h3`: color
- `src/style.css` — `.documentationColumns`: padding
- `src/style.css` — `.documentationIntro`: padding
- `src/style.css` — `.headerActions`: max-width,justify-content
- `src/style.css` — `.app>main.threeDMain>.view`: min-height
- `src/styles/scientific-ui.css` — `.inlineWorkspaceDialog:has(#physical-title) .physicalLayoutBody svg`: max-width
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateToolsDrawer:not([open])>summary`: justify-content
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.projectedCurveInspector`: width,box-sizing,min-width,display,flex-wrap,align-items,padding,margin,gap
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.projectedCurveInspector>label`: white-space,flex,min-width
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.projectedCurveInspector>small`: flex,min-width
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.projectionPairComparison,.stateWorkspaceGrid>.projectionSelectedPoint`: min-width
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateToolsDrawer:not([open])>summary`: justify-content
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateToolsDrawer:not([open])>summary`: justify-content
- `src/styles/scientific-ui.css` — `.stateRightContent`: max-height,overflow-y
- `src/styles/scientific-ui.css` — `.app .headerActions`: flex-wrap,gap
- `src/styles/scientific-ui.css` — `.app .primaryNavigation`: gap,flex-wrap
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateGraphStage`: justify-content
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateGraphStage>svg.stateSelectablePlot`: object-fit
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateGraphStage>svg.stateSelectablePlot`: background,border,box-shadow
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateGraphStage>svg.stateSelectablePlot>.chartBg`: fill
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateGraphStage>.stateSpaceKey`: background,border-top
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid`: align-items
- `src/styles/scientific-ui.css` — `.stateRightContent>.projectedCurveInspector`: padding
- `src/styles/scientific-ui.css` — `.statePanelSection .riemannStateEditor`: min-width
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateToolsDrawer`: border-radius
- `src/styles/scientific-ui.css` — `.stateWorkspaceGrid>.stateGraphStage>.stateSpaceKey`: background

Validação: parsing sintático com tinycss2. Build/lint e inspeção visual não executados.
