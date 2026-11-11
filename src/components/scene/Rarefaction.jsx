import {createContext,useContext} from 'react'
import {rarefactionPhaseArrow, rarefactionPhasePoints, waveArcArrow, rarefactionEndpointSpeed} from '../../geometry/state/rarefactionPhaseArrow.js'
import ScientificPoint3D from '../ScientificPoint3D.jsx'
import {waveColors,slowWaveArcColors} from '../../config/waveColors.js'
import {scientificCurveStyle} from '../../config/scientificCurveRules.js'
import {useEffect, useMemo} from 'react'
import * as THREE from 'three'
import {rarefactionPortrait} from '../../geometry/state/rarefactionPortrait.js'
import {infinityRarefactionSingularities} from '../../math/rarefaction/singularities.js'
import {Line} from './shared.jsx'



export function SeededRarefactions({curves,p,showLeft,showRight,showFull,axisScale}){
  return <group>{curves.filter(q=>!['composite','nonlocal'].includes(q.kind)).filter(q=>q.kind==='full'?showFull:q.family==='slow'?showLeft:showRight).map(curve=>{
    const color=curve.kind==='full'?'#ffcf76':curve.family==='slow'?slowWaveArcColors.rarefaction:'#30d158',slow=curve.family==='slow'&&curve.kind!=='full'
    const endpointSpeed=q=>rarefactionEndpointSpeed(q,p)
    const lowAtStart=endpointSpeed(curve.points[0])<=endpointSpeed(curve.points.at(-1))
    const arrow=waveArcArrow(curve.points,lowAtStart,axisScale)
    const speedChange=arrow&&endpointSpeed(curve.points[arrow.index+1])-endpointSpeed(curve.points[arrow.index])
    return <group key={`${curve.family}-${curve.kind??'arc'}`} userData={{kind:'seeded-rarefaction',family:curve.family,seed:curve.seed}}>
      <Line points={rarefactionPhasePoints(curve.points)} color={color}
        {...scientificCurveStyle(slow?'primary':'integralFast','3d')}
        lineWidth={2.5} transparent opacity={1} depthWrite={false} depthTest={false} renderOrder={slow?51:25}/>
      {arrow&&Number.isFinite(speedChange)&&speedChange!==0&&<ArrowOnCurve axisScale={axisScale} points={curve.points} {...arrow} color={color} p={p} directionSign={-Math.sign(speedChange)}/>}
    </group>
  })}</group>
}

export function RarefactionField({p,tauMin,tauMax,visible=true,axisScale}){
  const curves=useMemo(()=>visible?rarefactionPortrait(p,tauMin,tauMax):[],[p,tauMin,tauMax,visible])
  if(!visible)return null
  return <group>{curves.map(({branch,points},i)=>{
    const color=branch==='slow'?waveColors.rarefactionSlow:waveColors.rarefactionFast
    return <group key={i}><Line points={rarefactionPhasePoints(points,.026)} color={color} {...scientificCurveStyle('locus','3d')} depthTest={false} renderOrder={12}/><ArrowOnCurve axisScale={axisScale} points={points} index={Math.floor(points.length*.55)} color={color} p={p} size={.65}/></group>
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
        color={selected?'#49baff':'#f5f7fb'} metalness={0.15} roughness={0.3} onSelect={onSelect}/>
    </group>
    <mesh visible={false}>
      <sphereGeometry args={[0.11,12,10]}/>
      <meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>
  </group>
}

export function RarefactionSingularities({p,data,singularities,visible=true,showMarkers=true,showStable=true,showUnstable=true,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}){
  if(!visible)return null
  const selectedFinite=selectedSingularity?.kind==='finite'?selectedSingularity.index:null
  return <group>
    {(data?.separatrices??[]).filter(c=>(c.stable?showStable:showUnstable)).map((curve,i)=>{const color=curve.stable?waveColors.rarefactionSlow:waveColors.rarefactionFast,pts=rarefactionPhasePoints(curve.points,.043);return <group key={'s'+i}><Line points={pts} color={color} {...scientificCurveStyle('separatrix','3d')} depthTest={false} renderOrder={18} onClick={e=>{e.stopPropagation();onSelectCurve?.({kind:"separatrix",origin:"finite",stable:curve.stable,singularityIndex:curve.singularityIndex,branch:i,point:{tau:e.point.x,zc:e.point.z}})}}/><CurvePickTarget points={curve.points} onPick={e=>onSelectCurve?.({kind:"separatrix",origin:"finite",stable:curve.stable,singularityIndex:curve.singularityIndex,branch:i,point:{tau:e.point.x,zc:e.point.z}})}/><ArrowOnCurve axisScale={axisScale} p={p} points={curve.points} index={Math.floor(curve.points.length*.45)} color={color}/></group>})}
    {showMarkers&&singularities.map((q,i)=>{const selected=selectedFinite===i;return <group key={i}><SingularityMarker position={[q.tau,0,q.zc]} selected={selected} axisScale={axisScale} onSelect={()=>setSelectedSingularity?.({kind:'finite',index:i})}/></group>})}
  </group>
}


export const CurveArrowVisibility=createContext(true)

export function ArrowOnCurve({points,index,color,p,size=1,directionSign=1,directionOverride,positionOverride,independent=false,axisScale={tau:1,Y:1,zc:1}}){
  const arrowsVisible=useContext(CurveArrowVisibility)
  if(!independent&&!arrowsVisible)return null
  const arrow=directionOverride?{direction:directionOverride}:rarefactionPhaseArrow(points,index,p)
  if(!arrow)return null
  const scales=[axisScale.tau,axisScale.Y,axisScale.zc].map(v=>Math.max(Math.abs(v||1),1e-8))
  // Orient in displayed coordinates, then cancel axis distortion before rotating
  // the solid arrow. The shaft and head keep circular cross-sections at any scale.
  const direction=new THREE.Vector3(...arrow.direction).multiply(new THREE.Vector3(...scales)).multiplyScalar(directionSign).normalize()
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction)
  return <group position={positionOverride??[arrow.point.tau,0,arrow.point.zc]} scale={scales.map(v=>1/v)}>
    <group quaternion={q} scale={size}>
      <mesh position={[0,-.022,0]} renderOrder={52.5}>
        <cylinderGeometry args={[.0095,.0095,.076,16]}/>
        <meshBasicMaterial color="#0b1018" transparent depthWrite={false} depthTest={false}/>
      </mesh>
      <mesh position={[0,.031,0]} renderOrder={53.5}>
        <coneGeometry args={[.028,.066,20]}/>
        <meshBasicMaterial color="#0b1018" transparent depthWrite={false} depthTest={false}/>
      </mesh>
      <mesh position={[0,-.022,0]} renderOrder={53}>
        <cylinderGeometry args={[.007,.007,.072,24]}/>
        <meshBasicMaterial color={color} transparent toneMapped={false} depthWrite={false} depthTest={false}/>
      </mesh>
      <mesh position={[0,.031,0]} renderOrder={54}>
        <coneGeometry args={[.024,.058,32]}/>
        <meshBasicMaterial color={color} transparent toneMapped={false} depthWrite={false} depthTest={false}/>
      </mesh>
    </group>
  </group>
}


export function InfinityRarefactionSingularity({p,separatrices,visible=true,showMarkers=true,showStable=true,showUnstable=true,selectedSingularity,setSelectedSingularity,onSelectCurve,axisScale}){
  const qs=useMemo(()=>infinityRarefactionSingularities(p),[p])
  if(!visible||!qs.length)return null
  const selected=selectedSingularity?.kind==='infinity'
  return <group>
    {separatrices.filter(c=>c.visibleInFiniteChart&&(c.stable?showStable:showUnstable)).map((curve,i)=>{const color=curve.stable?waveColors.rarefactionSlow:waveColors.rarefactionFast,pts=rarefactionPhasePoints(curve.points,.062);return <group key={'infsep'+i}><Line points={pts} color={color} {...scientificCurveStyle('separatrix','3d')} depthTest={false} renderOrder={18} onClick={e=>{e.stopPropagation();onSelectCurve?.({kind:"separatrix",origin:"infinity",stable:curve.stable,branch:i,point:{tau:e.point.x,zc:e.point.z}})}}/><CurvePickTarget points={curve.points} onPick={e=>onSelectCurve?.({kind:"separatrix",origin:"infinity",stable:curve.stable,branch:i,point:{tau:e.point.x,zc:e.point.z}})}/><ArrowOnCurve axisScale={axisScale} p={p} points={curve.points} index={Math.floor(curve.points.length*.38)} color={color}/></group>})}
    {showMarkers&&[-1,1].map((zh,i)=><group key={i}><SingularityMarker position={[0,0,zh*.998]} selected={selected} axisScale={axisScale} onSelect={()=>setSelectedSingularity?.({kind:'infinity'})}/></group>)}
  </group>
}
