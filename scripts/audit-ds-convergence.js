/** Manual convergence study; never imported by the 3D application. */
import process from 'node:process'
import { spawnSync } from 'node:child_process'

const configurations = [
  { nTau: 12, nY: 10, nZ: 16 },
  { nTau: 16, nY: 12, nZ: 20 },
  { nTau: 24, nY: 16, nZ: 28 },
]
const results = []
for (const resolution of configurations) {
  const args = ['scripts/audit-ds.js', '--ntau', String(resolution.nTau), '--ny', String(resolution.nY), '--nz', String(resolution.nZ)]
  const run = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 })
  if (run.status !== 0) {
    process.stderr.write(run.stderr || run.stdout || `Audit exited with status ${run.status}\n`)
    process.exitCode = 1
    break
  }
  const audit = JSON.parse(run.stdout)
  results.push({ resolution, triangles: audit.meshTriangles, intersectionSegments: audit.intersectionSegments,
    J: audit.comparison.J, DS: audit.comparison.DS, elapsedMs: audit.elapsedMs })
}
console.log(JSON.stringify({ mode: 'manual-development-convergence', results,
  note: 'Distances concern detected segments and sampled canonical curves; missing coplanar intersections and unsampled gaps remain possible.' }, null, 2))
