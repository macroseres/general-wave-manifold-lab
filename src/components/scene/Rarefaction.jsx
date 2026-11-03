import {rarefactionPhaseArrow, rarefactionPhasePoints} from '../../geometry/state/rarefactionPhaseArrow.js'
import ScientificPoint3D from '../ScientificPoint3D.jsx'
import {waveColors} from '../../config/waveColors.js'
import {scientificCurveStyle} from '../../config/scientificCurveRules.js'
import {useEffect, useMemo} from 'react'
import * as THREE from 'three'
import {rarefactionOrbits} from '../../math/rarefaction/orbits.js'
import {infinityRarefactionSingularities} from '../../math/rarefaction/singularities.js'
import {infinityRarefactionSeparatrices} from '../../math/rarefaction/separatrices.js'
import {finiteRarefactionSeparatrices} from '../../math/rarefaction/finiteSeparatrices.js'
import {Line} from './shared.jsx'

export function SeededRarefactions({curves,p,showLeft,showRight,showFull,axisScale}){
  return <group>{curves.filter(q=>!['composite','nonlocal'].includes(q.kind)).filter(q=>q.kind==='full'?showFull:q.family==='slow'?showLeft:showRight).map(curve=>{
    const color=curve.kind==='full'?'#ffcf76':curve.family==='slow'?'#ff9f0a':'#30d158',slow=curve.family==='slow'&&curve.kind!=='full'
    const length=curve.points.slice(1).reduce((sum,q,i)=>sum+Math.hypot(q.tau-curve.points[i].tau,q.zc-curve.points[i].zc),0)
    let travelled=0,arrowIndex=1
    for(let i=1;i<curve.points.length-1;i++){travelled+=Math.hypot(curve.points[i].tau-curve.points[i-1].tau,curve.points[i].zc-curve.points[i-1].zc);if(travelled>=length*.4){arrowIndex=i;break}}
    return <group key={`${curve.family}-${curve.kind??'arc'}`} userData={{kind:'seeded-rarefaction',family:curve.family,seed:curve.seed}}>
      {slow&&<Line points={rarefactionPhasePoints(curve.points)} color="#f5f7fb" lineWidth={4.5} transparent opacity={1} depthWrite={false} depthTest={false} renderOrder={50}/>}
      <Line points={rarefactionPhasePoints(curve.points)} color={color}
        {...scientificCurveStyle(slow?'primary':'integralFast','3d')}
        lineWidth={2.5} transparent opacity={1} depthWrite={false} depthTest={false} renderOrder={slow?51:25}/>
      {(!slow||length>.07)&&<ArrowOnCurve axisScale={axisScale} points={curve.points} index={slow?arrowIndex:Math.floor(curve.points.length*.6)} color={color} p={p} size={slow?Math.min(.55,length*2):.8} directionSign={curve.timeDirection??1}/>}
    </group>
  })}</group>
}

export function RarefactionField({p,tauMin,tauMax,visible=true,axisScale}){
  const curves=useMemo(()=>visible?rarefactionOrbits(p,tauMin,tauMax,{clipTau:false}):[],[p,tauMin,tauMax,visible])
  if(!visible)return null
  return <group>{curves.map((curve,i)=>{
    const pts=rarefactionPhasePoints(curve,.026)
    return pts.length>1?<group key={i}><Line points={pts} color={waveColors.rarefactionFast} {...scientificCurveStyle('integralFast','3d')} depthTest={false} renderOrder={12}/><ArrowOnCurve axisScale={axisScale} points={curve} index={Math.floor(curve.length*.55)} color={waveColors.rarefactionFast} p={p} size={.65}/></group>:null
  })}</group>
}


// Invisible, wider picking geometry. Kept separate from the visual line so
// selection remains possible at ordinary zoom without changing its appearance.
function CurvePickTarget({points,onPick}){
  const geometry=useMemo(()=>{
    if(points.length<2)return null
    const samples=points.filter((_,i)=>i%Math.max(1,Math.floor(points.length/180))===0)
    if(samples[samples.length-1]!==points[points.length-1])samples.push(points[points.length-1])
    const path=new THREE.CatmullRomCurve3(samples.map(q=>new THREE.Vector3(q.tau,.055,q.zc)))
    return new THREE.TubeGeometry(path,Math.max(8,samples.length*2),.045,5,false)
  },[points])
  useEffect(()=>()=>geometry?.dispose(),[geometry])
  if(!geometry)return null
  return <mesh geometry={geometry} onClick={e=>{e.stopPropagation();onPick(e)}}>
    <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide}/>
  </mesh>
}

// Marcador 3D uniforme: a escala inversa compensa a escala anisotrópica dos eixos.
function SingularityMarker({position,selected=false,onSelect,axisScale={tau:1,Y:1,zc:1}}){
  const inv= [axisScale.tau,axisScale.Y,axisScale.zc].map(v=>1/Math.max(Math.abs(v||1),1e-8))
  return <group position={position} scale={inv} onClick={e=>{e.stopPropagation();onSelect?.()}}>
    <group renderOrder={22}>
      <ScientificPoint3D radius={0.033} widthSegments={28} heightSegments={20}
        color={selected?'#49baff':'#f5f7fb'} metalness={0.15} roughness={0.3}/>
    </group>
    <mesh rotation={[Math.PI/2,0,0]} renderOrder={23}>
      <torusGeometry args={[0.052,0.0035,10,48]}/>
      <meshStandardMaterial color={selected?'#4de1ff':'#d6dce6'} emissive={selected?'#087d9d':'#000000'} emissiveIntensity={selected?0.5:0} depthTest={false}/>
    </mesh>
    <mesh visible={false}>
      <sphereGeometry args={[0.11,12,10]}/>
      <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>
  </group>
}

export function RarefactionSingularities({p,tauMin,tauMax,visible=true,showStable=true,showUnstable=true,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}){
  const data=useMemo(()=>visible?finiteRarefactionSeparatrices(p,tauMin,tauMax):{singularities:[],separatrices:[]},[p,tauMin,tauMax,visible])
  if(!visible)return null
  const selectedFinite=selectedSingularity?.kind==='finite'?selectedSingularity.index:null
  return <group>
    {data.separatrices.filter(c=>(c.stable?showStable:showUnstable)).map((curve,i)=>{const color=curve.stable?waveColors.rarefactionSlow:waveColors.rarefactionFast,pts=rarefactionPhasePoints(curve.points,.043);return <group key={'s'+i}><Line points={pts} color={color} {...scientificCurveStyle('separatrix','3d')} depthTest={false} renderOrder={18} onClick={e=>{e.stopPropagation();onSelectCurve?.({kind:"separatrix",origin:"finite",stable:curve.stable,singularityIndex:curve.singularityIndex,branch:i,point:{tau:e.point.x,zc:e.point.z}})}}/><CurvePickTarget points={curve.points} onPick={e=>onSelectCurve?.({kind:"separatrix",origin:"finite",stable:curve.stable,singularityIndex:curve.singularityIndex,branch:i,point:{tau:e.point.x,zc:e.point.z}})}/><ArrowOnCurve axisScale={axisScale} p={p} points={curve.points} index={Math.floor(curve.points.length*.45)} color={color}/></group>})}
    {data.singularities.map((q,i)=>{const selected=selectedFinite===i;return <group key={i}><SingularityMarker position={[q.tau,0,q.zc]} selected={selected} axisScale={axisScale} onSelect={()=>setSelectedSingularity?.({kind:'finite',index:i})}/></group>})}
  </group>
}


export function ArrowOnCurve({points,index,color,p,size=1,directionSign=1,directionOverride,positionOverride,axisScale={tau:1,Y:1,zc:1}}){
  const arrow=directionOverride?{direction:directionOverride}:rarefactionPhaseArrow(points,index,p)
  if(!arrow)return null
  const scales=[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>Math.max(Math.abs(v||1),1e-8))
  // Orient in displayed coordinates, then cancel axis distortion before rotating
  // the solid arrow. The shaft and head keep circular cross-sections at any scale.
  const direction=new THREE.Vector3(...arrow.direction).multiply(new THREE.Vector3(...scales)).multiplyScalar(directionSign).normalize()
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction)
  return <group position={positionOverride??[arrow.point.tau,0,arrow.point.zc]} scale={scales.map(v=>1/v)}>
    <group quaternion={q} scale={size}>
      <mesh position={[0,-.022,0]} renderOrder={53}>
        <cylinderGeometry args={[.007,.007,.072,24]}/>
        <meshStandardMaterial color={color} metalness={.22} roughness={.28} emissive={color} emissiveIntensity={.12} depthWrite={false} depthTest={false}/>
      </mesh>
      <mesh position={[0,.031,0]} renderOrder={54}>
        <coneGeometry args={[.024,.058,32]}/>
        <meshStandardMaterial color={color} metalness={.22} roughness={.28} emissive={color} emissiveIntensity={.12} depthWrite={false} depthTest={false}/>
      </mesh>
    </group>
  </group>
}


export function InfinityRarefactionSingularity({p,tauMin,tauMax,visible=true,showStable=true,showUnstable=true,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}){
  const qs=useMemo(()=>infinityRarefactionSingularities(p),[p])
  const separatrices=useMemo(()=>visible?infinityRarefactionSeparatrices(p,{tauMin,tauMax}):[],[p,tauMin,tauMax,visible])
  if(!visible||!qs.length)return null
  const selected=selectedSingularity?.kind==='infinity'
  return <group>
    {separatrices.filter(c=>c.visibleInFiniteChart&&(c.stable?showStable:showUnstable)).map((curve,i)=>{const color=curve.stable?waveColors.rarefactionSlow:waveColors.rarefactionFast,pts=rarefactionPhasePoints(curve.points,.062);return <group key={'infsep'+i}><Line points={pts} color={color} {...scientificCurveStyle('separatrix','3d')} depthTest={false} renderOrder={18} onClick={e=>{e.stopPropagation();onSelectCurve?.({kind:"separatrix",origin:"infinity",stable:curve.stable,branch:i,point:{tau:e.point.x,zc:e.point.z}})}}/><CurvePickTarget points={curve.points} onPick={e=>onSelectCurve?.({kind:"separatrix",origin:"infinity",stable:curve.stable,branch:i,point:{tau:e.point.x,zc:e.point.z}})}/><ArrowOnCurve axisScale={axisScale} p={p} points={curve.points} index={Math.floor(curve.points.length*.38)} color={color}/></group>})}
    {[-1,1].map((zh,i)=><group key={i}><SingularityMarker position={[0,0,zh*.998]} selected={selected} axisScale={axisScale} onSelect={()=>setSelectedSingularity?.({kind:'infinity'})}/></group>)}
  </group>
}
