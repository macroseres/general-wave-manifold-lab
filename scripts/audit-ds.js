/** Development-only DS mesh audit. Never imported by the application. */
import process from 'node:process'
import { defaultCoefficients } from '../src/math/quadraticFlux.js'
import { sonicSurfaceTriangles, doubleSonicGeometry, inflectionGeometry } from '../src/geometry/sonic/surface.js'
import { intersectSonicTriangleMeshes } from '../src/geometry/sonic/triangleIntersection.js'
import { compareGeometricSonicIntersection } from '../src/geometry/sonic/commonIntersectionAudit.js'

const args=process.argv.slice(2)
const get=(name,fallback)=>{const i=args.indexOf(`--${name}`);return i>=0?Number(args[i+1]):fallback}
const domain={tauMin:get('tau-min',-5),tauMax:get('tau-max',5),YMin:get('y-min',-6),YMax:get('y-max',6)}
const resolution={nTau:get('ntau',12),nY:get('ny',10),nZ:get('nz',16)}
if(Object.values({...domain,...resolution}).some(v=>!Number.isFinite(v))||domain.tauMin>=domain.tauMax||domain.YMin>=domain.YMax||Object.values(resolution).some(v=>v<2||v>80))throw Error('Invalid audit domain or resolution')
const p=defaultCoefficients
const opts={...domain,...resolution}
const start=performance.now()
const minus=sonicSurfaceTriangles(p,{...opts,side:'minus'})
const plus=sonicSurfaceTriangles(p,{...opts,side:'plus'})
const intersection=intersectSonicTriangleMeshes(minus,plus)
const ds=doubleSonicGeometry(p,domain)
const canonicalDS=ds.map(line=>Array.from({length:25},(_,i)=>[line.tau,domain.YMin+(domain.YMax-domain.YMin)*i/24,line.zc]))
const j=inflectionGeometry(p,{tauMin:domain.tauMin,tauMax:domain.tauMax,nTau:80,nZ:120})
const canonicalJ=j.map(curve=>curve.map(q=>[q.tau,0,q.zc]))
const comparison=compareGeometricSonicIntersection(intersection.segments,canonicalJ,canonicalDS)
console.log(JSON.stringify({mode:'manual-development-audit',domain,resolution,meshTriangles:intersection.triangleCounts,intersectionSegments:intersection.segmentCount,analyticDSLines:ds.length,comparison:{J:comparison.J,DS:comparison.DS},elapsedMs:Math.round(performance.now()-start),note:comparison.note},null,2))
