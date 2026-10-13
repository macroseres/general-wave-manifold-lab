/** Clip a trace-zero triangle against the spectral boundary det=0.
 * The edge intersections are solved using the actual determinant evaluator,
 * not linear interpolation of endpoint determinant values. Subdivision detects
 * bounded positive islands whose original triangle vertices are negative.
 * The resulting polygonal contour approximates the implicit det=0 curve.
 */
export function clipSpectralTriangle(triangle, evaluate, {depth=2, iterations=32}={}) {
  const triangles=[]
  const midpoint=(a,b)=>evaluate(a,b,0.5)
  const crossing=(a,b)=>{
    let lo=0,hi=1,fa=a.det,root=null
    for(let k=0;k<iterations;k++){
      const t=(lo+hi)/2
      const q=evaluate(a,b,t)
      if(!q||!Number.isFinite(q.det))return null
      root=q
      if((q.det>=0)===(fa>=0)){lo=t;fa=q.det}else hi=t
    }
    return root
  }
  const emit=tri=>{
    const polygon=[]
    for(let i=0;i<3;i++){
      const a=tri[i],b=tri[(i+1)%3]
      if(a.det>=0)polygon.push(a)
      if((a.det>=0)!==(b.det>=0)){
        const root=crossing(a,b)
        if(root)polygon.push(root)
      }
    }
    for(let i=1;i+1<polygon.length;i++)triangles.push([polygon[0],polygon[i],polygon[i+1]])
  }
  const visit=(tri,d)=>{
    if(tri.some(v=>!v||!Number.isFinite(v.det)))return
    if(d===0){emit(tri);return}
    const [a,b,c]=tri
    const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a)
    if(!ab||!bc||!ca){emit(tri);return}
    visit([a,ab,ca],d-1)
    visit([ab,b,bc],d-1)
    visit([ca,bc,c],d-1)
    visit([ab,bc,ca],d-1)
  }
  visit(triangle,depth)
  return triangles
}
