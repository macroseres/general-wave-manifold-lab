import * as THREE from 'three'
import {orientTrianglesConsistently} from '../geometry/sonic/orientTriangles.js'

export function makeSonicBufferGeometry(data,{mirrorY=false}={}){
  const positions=mirrorY?data.positions.map((x,i)=>i%3===1?-x:x):data.positions
  const g=new THREE.BufferGeometry()
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3))
  if(data.indices?.length){
    const {indices,diagnostics}=orientTrianglesConsistently(data.indices)
    if(import.meta.env.DEV&&diagnostics.remainingConflicts)console.warn('Sonic orientation contradictions',diagnostics)
    g.setIndex(new THREE.Uint32BufferAttribute(indices,1))
  }
  if(positions.length)g.computeVertexNormals()
  return g
}

