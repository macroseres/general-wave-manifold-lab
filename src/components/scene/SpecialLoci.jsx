import {waveColors} from '../../config/waveColors.js'
import {scientificCurveStyle, scientificLocusKind} from '../../config/scientificCurveRules.js'
import {finiteLinePaths} from '../../rendering/finiteLinePaths.js'
import {useEffect, useMemo} from 'react'
import * as THREE from 'three'
import {curvePoints3D} from '../../rendering/curvePoints.js'
import {Line} from './shared.jsx'

// The inflection locus may contain many vertices. Native WebGL lines avoid
// the per-segment expanded meshes used by Drei's thick Line2 implementation.
// Keep the mathematical samples intact; split only at invalid coordinates.
function InflectionPath({points}) {
  const geometries=useMemo(()=>finiteLinePaths(
    curvePoints3D(points,'tauYzc')
  ).map(path=>{
    const geometry=new THREE.BufferGeometry()
    geometry.setAttribute('position',new THREE.Float32BufferAttribute(path.flat(),3))
    return geometry
  }),[points])
  useEffect(()=>()=>geometries.forEach(geometry=>geometry.dispose()),[geometries])
  return <group>{geometries.map((geometry,i)=><line key={i} geometry={geometry} frustumCulled={false} renderOrder={6}>
    <lineBasicMaterial color={waveColors.inflection} depthTest={false} depthWrite={false} transparent opacity={1}/>
  </line>)}</group>
}

export function SonicSpecialLoci({sharedLoci=[],showDS=true,showJ=true}){
  return <group>{sharedLoci.filter(item=>(item.id==='DS'&&showDS)||(item.id==='J'&&showJ)).flatMap(item=>item.paths.map((path,i)=>
    item.id==='J'
      ? <InflectionPath key={`J-${i}`} points={path}/>
      : <Line key={`DS-${i}`} points={curvePoints3D(path,'tauYzc')} color={waveColors.doubleSonic} {...scientificCurveStyle(scientificLocusKind(item.id),'3d')} depthTest={false} renderOrder={10}/>
  ))}</group>
}
