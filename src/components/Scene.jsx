import {Canvas, useThree} from '@react-three/fiber'
import {OrbitControls, Text} from '@react-three/drei'
import {forwardRef, useImperativeHandle, useMemo, useRef} from 'react'
import * as THREE from 'three'
import {coincidencePoints,rarefactionField,rarefactionSingularities,infinityRarefactionSingularities,infinityRarefactionSeparatrices,sonicData,zFromZHat} from '../math/quadraticFlux'

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x))

function Coincidence({p,tauMin,tauMax}){
  const curves=useMemo(()=>coincidencePoints(p,tauMin,tauMax,361),[p,tauMin,tauMax])
  return curves.map((curve,i)=>{
    if(curve.length<2)return null
    const pts=curve.map(q=>new THREE.Vector3(q.tau,0.018,q.zHat))
    const geometry=new THREE.BufferGeometry().setFromPoints(pts)
    return <line key={i} geometry={geometry}><lineBasicMaterial color="#7b1fa2" linewidth={2}/></line>
  })
}


function SonicSurface({p,tauMin,tauMax,YMin,YMax,side,visible=true}){
  const geometry=useMemo(()=>{
    if(!visible)return null

    // The sonic sheets are defined implicitly by
    //   Psi_-(tau,Y,z)=Y det(M_r)-2K=0,
    //   Psi_+(tau,Y,z)=Y det(M_r)+2K=0.
    // Psi is affine in Y.  We exploit that structure to build a clean mesh:
    // evaluate the unique finite zero on the (tau,z-hat) grid, never connect
    // across det(M_r)=0, and geometrically clip triangles to [YMin,YMax].
    const nTau=72,nZ=112,epsDet=1e-8
    const taus=Array.from({length:nTau+1},(_,i)=>tauMin+i*(tauMax-tauMin)/nTau)
    const zHats=Array.from({length:nZ+1},(_,i)=>-.999+1.998*i/nZ)
    const pos=[]

    const sample=(tau,zHat)=>{
      const z=zFromZHat(zHat)
      const d=sonicData(tau,z,p,epsDet)
      if(d.kind!=='regular'||!Number.isFinite(d.detM)||!Number.isFinite(d.K))return null
      if(Math.abs(d.detM)<=epsDet)return {tau,zHat,detM:d.detM,Y:null}
      const Y=side==='minus'?2*d.K/d.detM:-2*d.K/d.detM
      return {tau,zHat,detM:d.detM,Y:Number.isFinite(Y)?Y:null}
    }

    // Sutherland-Hodgman clipping of a triangle against the two Y half-spaces.
    const clipPlane=(poly,bound,keepAbove)=>{
      if(!poly.length)return poly
      const out=[]
      const inside=v=>keepAbove?v.Y>=bound:v.Y<=bound
      const intersect=(a,b)=>{
        const den=b.Y-a.Y
        const t=Math.abs(den)<1e-14?0:(bound-a.Y)/den
        return {tau:a.tau+t*(b.tau-a.tau),Y:bound,zHat:a.zHat+t*(b.zHat-a.zHat)}
      }
      for(let i=0;i<poly.length;i++){
        const a=poly[i],b=poly[(i+1)%poly.length],ia=inside(a),ib=inside(b)
        if(ia&&ib)out.push(b)
        else if(ia&&!ib)out.push(intersect(a,b))
        else if(!ia&&ib){out.push(intersect(a,b));out.push(b)}
      }
      return out
    }
    const emitClipped=(tri)=>{
      let poly=clipPlane(tri,YMin,true)
      poly=clipPlane(poly,YMax,false)
      if(poly.length<3)return
      const a=poly[0]
      for(let i=1;i<poly.length-1;i++){
        const b=poly[i],c=poly[i+1]
        pos.push(a.tau,a.Y,a.zHat,b.tau,b.Y,b.zHat,c.tau,c.Y,c.zHat)
      }
    }

    const grid=zHats.map(zHat=>taus.map(tau=>sample(tau,zHat)))
    for(let j=0;j<nZ;j++)for(let i=0;i<nTau;i++){
      const q00=grid[j][i],q10=grid[j][i+1],q11=grid[j+1][i+1],q01=grid[j+1][i]
      const q=[q00,q10,q11,q01]
      if(q.some(v=>!v||v.Y===null))continue

      // A sign change of det(M_r) means the explicit zero passes through a pole.
      // The implicit equation remains valid, but the finite sheet has no bridge
      // across that pole; connecting the samples would create the false walls
      // seen in v0.3.1.
      const signs=q.map(v=>Math.sign(v.detM))
      if(signs.some(s=>s===0)||!signs.every(s=>s===signs[0]))continue

      // A pole can still cross the interior of a cell even when all four
      // corners have the same sign. Probe edge midpoints and the cell centre
      // before triangulating. This is a topology guard, not a change to the
      // sonic equation: it only prevents the renderer from bridging across a
      // zero of det(M_r) that the coarse grid did not sample at a corner.
      const tauMid=(taus[i]+taus[i+1])/2,zMid=(zHats[j]+zHats[j+1])/2
      const probes=[
        sample(tauMid,zHats[j]),sample(tauMid,zHats[j+1]),
        sample(taus[i],zMid),sample(taus[i+1],zMid),sample(tauMid,zMid)
      ]
      if(probes.some(v=>!v||v.Y===null||Math.sign(v.detM)!==signs[0]))continue

      // Reject a triangle when its centre is incompatible with the linear
      // interpolation of its vertices. Near an unresolved pole the ratio
      // K/det(M_r) changes hyperbolically and creates the thin vertical
      // blades seen in v0.4.1. On a smooth sheet this interpolation error is
      // small. The tolerance scales with the visible Y window.
      const ySpan=Math.max(1e-9,YMax-YMin)
      const triOK=(a,b,c)=>{
        const tc=(a.tau+b.tau+c.tau)/3,zc=(a.zHat+b.zHat+c.zHat)/3
        const m=sample(tc,zc)
        if(!m||m.Y===null||Math.sign(m.detM)!==signs[0])return false
        const yLin=(a.Y+b.Y+c.Y)/3
        return Math.abs(m.Y-yLin)<=1.25*ySpan
      }
      if(triOK(q00,q10,q11))emitClipped([q00,q10,q11])
      if(triOK(q00,q11,q01))emitClipped([q00,q11,q01])
    }

    const g=new THREE.BufferGeometry()
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3))
    if(pos.length)g.computeVertexNormals()
    return g
  },[p,tauMin,tauMax,YMin,YMax,side,visible])
  if(!geometry)return null
  const color=side==='minus'?'#d97706':'#2563eb'
  return <mesh geometry={geometry} renderOrder={side==='minus'?1:2}>
    <meshStandardMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.42} depthWrite={false}/>
  </mesh>
}


function RarefactionField({p,tauMin,tauMax,visible=true}){
  const curves=useMemo(()=>{
    if(!visible)return []
    const result=[]
    const h=.018,maxSteps=1100
    const inside=(q)=>q.tau>=tauMin&&q.tau<=tauMax&&q.zHat>-.997&&q.zHat<.997
    const vf=(q)=>{
      const z=zFromZHat(q.zHat),d=rarefactionField(q.tau,z,p)
      if(d.kind!=='regular'||!Number.isFinite(d.tauDot)||!Number.isFinite(d.zHatDot))return null
      // Normalize only the integration speed in chart coordinates. The line
      // field itself is unchanged and this avoids tiny/huge numerical steps.
      const n=Math.hypot(d.tauDot,d.zHatDot)
      if(n<1e-11)return null
      return [d.tauDot/n,d.zHatDot/n]
    }
    const rk4=(q,sgn)=>{
      const f=(x)=>{const v=vf(x);return v&&[sgn*v[0],sgn*v[1]]}
      const k1=f(q);if(!k1)return null
      const q2={tau:q.tau+h*k1[0]/2,zHat:q.zHat+h*k1[1]/2},k2=f(q2);if(!k2)return null
      const q3={tau:q.tau+h*k2[0]/2,zHat:q.zHat+h*k2[1]/2},k3=f(q3);if(!k3)return null
      const q4={tau:q.tau+h*k3[0],zHat:q.zHat+h*k3[1]},k4=f(q4);if(!k4)return null
      return {tau:q.tau+h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,zHat:q.zHat+h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6}
    }
    const integrate=(seed,sgn)=>{
      const pts=[seed];let q=seed
      for(let k=0;k<maxSteps;k++){
        const nq=rk4(q,sgn);if(!nq||!inside(nq))break
        if(Math.hypot(nq.tau-q.tau,nq.zHat-q.zHat)<1e-7)break
        pts.push(nq);q=nq
      }
      return pts
    }
    // Seeds are spread over the characteristic surface. Duplicate integral
    // curves are acceptable visually; they make the phase portrait robust
    // without assuming a special topology for a general quadratic flux.
    const nTau=7,nZ=9
    for(let j=1;j<nZ;j+=2)for(let i=1;i<nTau;i+=2){
      const seed={tau:tauMin+i*(tauMax-tauMin)/nTau,zHat:-.9+1.8*j/nZ}
      const back=integrate(seed,-1).reverse(),forw=integrate(seed,1)
      const joined=back.concat(forw.slice(1))
      if(joined.length>4)result.push(joined)
    }
    return result
  },[p,tauMin,tauMax,visible])
  if(!visible)return null
  return <group>{curves.map((curve,i)=>{
    const pts=curve.map(q=>new THREE.Vector3(q.tau,.026,q.zHat))
    const geometry=new THREE.BufferGeometry().setFromPoints(pts)
    return <line key={i} geometry={geometry}><lineBasicMaterial color="#b91c1c"/></line>
  })}</group>
}


function RarefactionSingularities({p,tauMin,tauMax,visible=true,showStable=true,showUnstable=true,selectedSingularity,setSelectedSingularity}){
  const data=useMemo(()=>{
    if(!visible)return {singularities:[],separatrices:[]}
    const singularities=rarefactionSingularities(p,tauMin,tauMax),separatrices=[]
    const h=.012,inside=q=>q.tau>=tauMin&&q.tau<=tauMax&&q.zHat>-.997&&q.zHat<.997
    const vf=q=>{const d=rarefactionField(q.tau,zFromZHat(q.zHat),p);if(d.kind!=='regular')return null;const n=Math.hypot(d.tauDot,d.zHatDot);return n>1e-11?[d.tauDot/n,d.zHatDot/n]:null}
    const step=(q,sgn)=>{const f=x=>{const v=vf(x);return v&&[sgn*v[0],sgn*v[1]]},k1=f(q);if(!k1)return null;const q2={tau:q.tau+h*k1[0]/2,zHat:q.zHat+h*k1[1]/2},k2=f(q2);if(!k2)return null;const q3={tau:q.tau+h*k2[0]/2,zHat:q.zHat+h*k2[1]/2},k3=f(q3);if(!k3)return null;const q4={tau:q.tau+h*k3[0],zHat:q.zHat+h*k3[1]},k4=f(q4);if(!k4)return null;return {tau:q.tau+h*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6,zHat:q.zHat+h*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6}}
    singularities.forEach((q,si)=>{if(q.type!=='sela'||!q.eigenvectors)return;for(let j=0;j<2;j++)for(const branch of [-1,1]){
      const stable=q.eigenvalues[j]<0,v=q.eigenvectors[j],eps=.012,seed={tau:q.tau+branch*eps*v[0],zHat:q.zHat+branch*eps*v[1]},sgn=stable?-1:1,pts=[{tau:q.tau,zHat:q.zHat},seed];let x=seed
      let targetIndex=null
      for(let k=0;k<1300;k++){
        const nx=step(x,sgn);if(!nx||!inside(nx))break
        if(Math.hypot(nx.tau-q.tau,nx.zHat-q.zHat)<.006&&k>8)break
        // Uma conexão entre selas é uma única órbita: W^u(p_i) ∩ W^s(p_j).
        // Pare a integração no centro da outra sela para evitar que as duas
        // integrações independentes apareçam como curvas paralelas.
        const hit=singularities.findIndex((r,ri)=>ri!==si&&r.type==='sela'&&Math.hypot(nx.tau-r.tau,nx.zHat-r.zHat)<.035)
        if(hit>=0){pts.push({tau:singularities[hit].tau,zHat:singularities[hit].zHat});targetIndex=hit;break}
        pts.push(nx);x=nx
      }
      if(pts.length>3)separatrices.push({points:pts,stable,singularityIndex:si,targetIndex})
    }})
    // Se a mesma heteroclínica foi obtida como ramo instável de uma sela e
    // ramo estável da outra, desenhamos apenas a órbita instável orientada.
    const heteroKeys=new Set(separatrices.filter(c=>!c.stable&&c.targetIndex!==null).map(c=>`${c.singularityIndex}->${c.targetIndex}`))
    const unique=separatrices.filter(c=>{
      if(!c.stable||c.targetIndex===null)return true
      return !heteroKeys.has(`${c.targetIndex}->${c.singularityIndex}`)
    })
    return {singularities,separatrices:unique}
  },[p,tauMin,tauMax,visible])
  if(!visible)return null
  const selectedFinite=selectedSingularity?.kind==='finite'?selectedSingularity.index:null
  const hideFiniteSeparatrices=selectedSingularity?.kind==='infinity'
  return <group>
    {data.separatrices.filter(c=>!hideFiniteSeparatrices&&(c.stable?showStable:showUnstable)&&(selectedFinite===null||c.singularityIndex===selectedFinite)).map((curve,i)=>{const color=curve.stable?'#047857':'#9a3412',g=new THREE.BufferGeometry().setFromPoints(curve.points.map(q=>new THREE.Vector3(q.tau,.043,q.zHat)));return <group key={'s'+i}><line geometry={g}><lineBasicMaterial color={color}/></line><ArrowOnCurve points={curve.points} index={Math.floor(curve.points.length*.45)} color={color}/></group>})}
    {data.singularities.map((q,i)=>{const selected=selectedFinite===i;return <group key={i} onPointerDown={e=>{e.stopPropagation();setSelectedSingularity?.({kind:'finite',index:i})}}><mesh position={[q.tau,.05,q.zHat]}><sphereGeometry args={[selected?.085:.055,22,22]}/><meshStandardMaterial color={selected?'#f4b400':q.type==='sela'?'#111827':'#dc2626'}/></mesh><Text position={[q.tau+.09,.055,q.zHat+.055]} fontSize={.055} color="#111827">{q.type}</Text></group>})}
  </group>
}

function ArrowOnCurve({points,index,color}){
  if(points.length<4)return null
  const i=Math.max(1,Math.min(points.length-2,index))
  const a=points[i-1],b=points[i+1],p=points[i]
  const dx=b.tau-a.tau,dz=b.zHat-a.zHat,L=Math.hypot(dx,dz)
  if(L<1e-10)return null
  // coneGeometry points along +Y; rotate it onto the tangent in the tau-zHat plane.
  const dir=new THREE.Vector3(dx/L,0,dz/L),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir)
  return <mesh position={[p.tau,.078,p.zHat]} quaternion={q}><coneGeometry args={[.025,.10,12]}/><meshStandardMaterial color={color}/></mesh>
}

function InfinityRarefactionSingularity({p,tauMin,tauMax,visible=true,showStable=true,showUnstable=true,selectedSingularity,setSelectedSingularity}){
  const qs=useMemo(()=>infinityRarefactionSingularities(p),[p])
  const separatrices=useMemo(()=>visible?infinityRarefactionSeparatrices(p,{tauMin,tauMax}):[],[p,tauMin,tauMax,visible])
  if(!visible||!qs.length)return null
  const selected=selectedSingularity?.kind==='infinity'
  return <group>
    {separatrices.filter(c=>selectedSingularity?.kind!=='finite'&&(c.stable?showStable:showUnstable)).map((curve,i)=>{const color=curve.stable?'#047857':'#9a3412',pts=curve.points.map(x=>new THREE.Vector3(x.tau,.062,x.zHat)),g=new THREE.BufferGeometry().setFromPoints(pts);return <group key={'infsep'+i}><line geometry={g}><lineBasicMaterial color={color}/></line><ArrowOnCurve points={curve.points} index={Math.floor(curve.points.length*.38)} color={color}/></group>})}
    {[-1,1].map((zh,i)=><group key={i} onPointerDown={e=>{e.stopPropagation();setSelectedSingularity?.({kind:'infinity'})}}>
      <mesh position={[0,.07,zh*.998]}><sphereGeometry args={[selected?.055:.032,20,20]}/><meshStandardMaterial color={selected?'#f4b400':'#111827'}/></mesh>
      <Text position={[.07,.075,zh*.965]} fontSize={.042} color="#111827">sela ∞</Text>
    </group>)}
  </group>
}

function CharacteristicSurface({tauMin,tauMax,p,_point,setPoint}){
  return <>
    <mesh rotation={[-Math.PI/2,0,0]} position={[(tauMin+tauMax)/2,0,0]}
      onPointerDown={e=>{e.stopPropagation();setPoint(q=>({...q,Y:0,tau:clamp(e.point.x,tauMin,tauMax),zHat:clamp(e.point.z,-.999,.999)}))}}>
      <planeGeometry args={[tauMax-tauMin,2,48,32]}/>
      <meshStandardMaterial color="#5d8798" side={THREE.DoubleSide} transparent opacity={0.42} depthWrite={false}/>
    </mesh>
    <lineSegments rotation={[-Math.PI/2,0,0]} position={[(tauMin+tauMax)/2,0.004,0]}>
      <edgesGeometry args={[new THREE.PlaneGeometry(tauMax-tauMin,2)]}/><lineBasicMaterial color="#274752"/>
    </lineSegments>
    <Coincidence {...{p,tauMin,tauMax}}/>
    <Text position={[tauMin+0.12,0.035,0.88]} fontSize={0.085} color="#274752">C : Y=0</Text>
  </>
}

function Axes({tauMin,tauMax}){
  const len=Math.max(2.4,tauMax-tauMin+0.8)
  return <>
    <primitive object={new THREE.AxesHelper(Math.min(len,4))}/>
    <Text position={[tauMax+0.25,0,0]} fontSize={0.11} color="#23343b">τ</Text>
    <Text position={[0,2.18,0]} fontSize={0.11} color="#23343b">Y</Text>
    <Text position={[0,0,1.17]} fontSize={0.09} color="#23343b">ẑ=+1</Text>
    <Text position={[0,0,-1.17]} fontSize={0.09} color="#23343b">ẑ=-1</Text>
  </>
}

const CameraRig=forwardRef(function CameraRig(_,ref){
  const controls=useRef(),{camera}=useThree()
  const setView=(pos,up=[0,1,0])=>{camera.position.set(...pos);camera.up.set(...up);camera.lookAt(0,0,0);controls.current?.target.set(0,0,0);controls.current?.update()}
  useImperativeHandle(ref,()=>({front:()=>setView([0,0,5]),side:()=>setView([5,0,0]),top:()=>setView([0,5,0],[0,0,-1]),reset:()=>setView([3,3,3]),zoom:(factor)=>{camera.position.multiplyScalar(factor);controls.current?.update()}}))
  return <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08}/>
})

function SceneContent({tauMin,tauMax,YMin,YMax,p,point,setPoint,cameraRef,showSMinus,showSPlus,showRarefaction,showRareCurves,showFiniteStable,showFiniteUnstable,showInfinityStable,showInfinityUnstable,selectedSingularity,setSelectedSingularity,axisScale}){
  return <>
    <group scale={[axisScale.tau,axisScale.Y,axisScale.zHat]}>
    <ambientLight intensity={1.25}/><directionalLight position={[3,4,5]} intensity={1.7}/>
    <gridHelper args={[8,16]} position={[0,-0.025,0]}/>
    <CharacteristicSurface {...{tauMin,tauMax,p,point,setPoint}}/>
    <RarefactionField {...{p,tauMin,tauMax}} visible={showRarefaction&&showRareCurves}/>
    <RarefactionSingularities {...{p,tauMin,tauMax,selectedSingularity,setSelectedSingularity}} visible={showRarefaction} showStable={showFiniteStable} showUnstable={showFiniteUnstable}/>
    <InfinityRarefactionSingularity {...{p,tauMin,tauMax,selectedSingularity,setSelectedSingularity}} visible={showRarefaction} showStable={showInfinityStable} showUnstable={showInfinityUnstable}/>
    <SonicSurface {...{p,tauMin,tauMax,YMin,YMax}} side="minus" visible={showSMinus}/>
    <SonicSurface {...{p,tauMin,tauMax,YMin,YMax}} side="plus" visible={showSPlus}/>
    <Axes {...{tauMin,tauMax}}/>
    <mesh position={[point.tau,point.Y,point.zHat]}><sphereGeometry args={[0.055,20,20]}/><meshStandardMaterial color="#f4b400"/></mesh>
    </group>
    <CameraRig ref={cameraRef}/>
  </>
}

export default function Scene({tauMin,tauMax,YMin=-2,YMax=2,p,point,setPoint,showSMinus=true,showSPlus=true,showRarefaction=true,showRareCurves=true,showFiniteStable=true,showFiniteUnstable=true,showInfinityStable=true,showInfinityUnstable=true,selectedSingularity=null,setSelectedSingularity,axisScale={tau:1,Y:1,zHat:1}}){
  const cameraRef=useRef()
  return <div className="sceneWrap">
    <Canvas camera={{position:[3,3,3],fov:45}}><SceneContent {...{tauMin,tauMax,p,point,setPoint,cameraRef,showSMinus,showSPlus,showRarefaction,showRareCurves,showFiniteStable,showFiniteUnstable,showInfinityStable,showInfinityUnstable,selectedSingularity,setSelectedSingularity,YMin,YMax,axisScale}}/></Canvas>
    <div className="cameraBar">
      <span>Girar/selecionar</span><span>·</span><span>Mover vista</span>
      <button onClick={()=>cameraRef.current?.zoom(1.18)}>−</button><button onClick={()=>cameraRef.current?.zoom(0.84)}>+</button>
      <button onClick={()=>cameraRef.current?.front()}>Frente</button><button onClick={()=>cameraRef.current?.side()}>Lado</button><button onClick={()=>cameraRef.current?.top()}>Topo</button><button onClick={()=>cameraRef.current?.reset()}>Restaurar vista</button>
    </div>
  </div>
}
