const names=[
  ['right-transport','one-shock','compressive'],
  ['one-expansive','crossing','two-shock'],
  ['expansive','two-expansive','left-transport'],
]
const labels={
  'right-transport':'Transporte à direita','left-transport':'Transporte à esquerda',
  'one-shock':'One-shock · Lax 1','two-shock':'Two-shock · Lax 2',
  'one-expansive':'One-expansive','two-expansive':'Two-expansive',
  compressive:'Compressivo',expansive:'Expansivo',crossing:'Crossing',
}

/** Endpoint geometry only: never an RH, entropy, Liu or profile certificate. */
export function classifyShockConfiguration(left,right,speed,{tolerance=1e-10}={}){
  const valid=q=>Array.isArray(q)&&q.length===2&&q.every(Number.isFinite)
  if(!valid(left)||!valid(right)||!Number.isFinite(speed)||!Number.isFinite(tolerance)||tolerance<0)
    return {kind:'invalid-spectra',label:'Espectro indisponível',family:null}
  const eps=tolerance*(1+Math.max(Math.abs(speed),...left.map(Math.abs),...right.map(Math.abs)))
  if(!(left[1]-left[0]>eps)||!(right[1]-right[0]>eps))
    return {kind:'non-strict-hyperbolicity',label:'Sem hiperbolicidade estrita',family:null}
  const boundaries=[]
  for(const [side,spectrum] of [['minus',left],['plus',right]])
    spectrum.forEach((lambda,index)=>{if(Math.abs(speed-lambda)<=eps)boundaries.push({side,family:index+1,gap:speed-lambda})})
  if(boundaries.length)return {kind:'sonic-boundary',label:'Fronteira sônica',family:null,boundaries}
  const nLeft=left.filter(v=>v<speed).length,nRight=right.filter(v=>v<speed).length
  const name=names[nLeft][nRight]
  const family=name==='one-shock'?1:name==='two-shock'?2:null
  return {kind:'spectral-interior',name,label:labels[name],nLeft,nRight,incoming:2-nLeft+nRight,family}
}

export function classifySpectralDiagnostic(d,options){
  return classifyShockConfiguration(d?.minus?.eigenvalues,d?.plus?.eigenvalues,d?.s,options)
}
