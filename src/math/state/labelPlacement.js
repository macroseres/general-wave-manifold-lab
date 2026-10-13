// Layout exclusivamente visual: não modifica os estados matemáticos.
export function chooseStateLabelPosition(point, neighbours, preferred=0, bounds={width:800,height:600}) {
  const candidates=[[14,-14],[14,27],[-14,-14],[-14,27],[24,5],[-24,5],[14,-31],[-14,-31]]
  const order=candidates.map((_,i)=>(i+preferred)%candidates.length)
  let best=null
  for(const i of order){
    const [dx,dy]=candidates[i]
    const x=point.x+dx, y=point.y+dy
    const box={left:dx<0?x-50:x,right:dx<0?x:x+50,top:y-15,bottom:y+4}
    let penalty=0
    for(const n of neighbours){
      if(Math.hypot(n.x-point.x,n.y-point.y)<0.001)continue
      const nearX=Math.max(box.left,Math.min(n.x,box.right))
      const nearY=Math.max(box.top,Math.min(n.y,box.bottom))
      const dist=Math.hypot(n.x-nearX,n.y-nearY)
      if(dist<12)penalty+=(12-dist)**2
    }
    if(box.left<8||box.right>bounds.width-8||box.top<8||box.bottom>bounds.height-8)penalty+=1000
    const candidate={x,y,textAnchor:dx<0?'end':'start',penalty}
    if(!best||candidate.penalty<best.penalty)best=candidate
    if(penalty===0)break
  }
  return {x:best.x,y:best.y,textAnchor:best.textAnchor}
}
