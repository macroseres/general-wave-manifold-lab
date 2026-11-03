import { existsSync, readdirSync, readFileSync } from 'node:fs'

const componentsDir = new URL('../../src/components/', import.meta.url)

// Source of the 3D scene: Scene.jsx plus the components split into
// src/components/scene/. Text-based boundary tests read this combined source,
// so they keep checking the same patterns wherever the code lives.
export function readSceneSource() {
  const parts = [readFileSync(new URL('Scene.jsx', componentsDir), 'utf8')]
  const sceneDir = new URL('scene/', componentsDir)
  if (existsSync(sceneDir)) {
    for (const file of readdirSync(sceneDir).filter((name) => /\.jsx?$/.test(name)).sort()) {
      parts.push(readFileSync(new URL(file, sceneDir), 'utf8'))
    }
  }
  return parts.join('\n')
}
