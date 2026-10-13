import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const layout = read('../src/styles/workspace-layout.css')
const legacy = read('../src/styles/scientific-ui.css')
const app = read('../src/App.jsx')

test('all four environments use the shared layout contract', () => {
  for (const kind of ['states', '3d', 'physical', 'docs']) {
    assert.match(layout, new RegExp(`workspaceLayout--${kind}`))
  }
  assert.match(app, /WorkspaceLayout as="main"/)
  for (const label of ['Estados', 'Variedade', 'Físico', 'Documentação']) {
    assert.match(app, new RegExp(`>${label}<\\/button>`))
  }
})

test('legacy state styles do not set workspace grid geometry', () => {
  assert.doesNotMatch(legacy, /\.stateWorkspaceGrid[^{}]*\{[^{}]*grid-template-(?:areas|columns|rows)\s*:/)
})

test('the shared layout owns the rail and drawer dimensions', () => {
  assert.match(layout, /--workspace-rail:\s*68px/)
  assert.match(layout, /--workspace-drawer:\s*232px/)
})

test('inline States layout is selected by the mounted workspace, not by a missing modal header', () => {
  const state = read('../src/components/StateSpaceDialog.jsx')
  assert.match(state, /<WorkspaceLayout kind="states"/)
  assert.match(layout, /\.inlineWorkspaceDialog:has\(\.workspaceLayout--states\) > \.stateExplorationBody/)
  assert.doesNotMatch(layout, /:has\(#state-space-title\)/)
  assert.match(layout, /\.workspaceLayout--states > \.stateToolsDrawer > \.stateToolsDrawerContent/)
})


test('physical workspace retains its two-column grid and a visible collapsed rail', () => {
  assert.doesNotMatch(legacy, /:has\(#physical-title\) \.physicalLayoutBody\{display:flex/)
  assert.doesNotMatch(legacy, /\.physicalSidebarCollapsed \.physicalSidebar\{visibility:hidden/)
  assert.match(layout, /\.workspaceLayout--physical > \.physicalMain \{grid-column:2/)
  assert.match(layout, /\.workspaceLayout--physical\[data-panel-expanded="false"\] \.physicalSidebar \{visibility:visible/)
})
