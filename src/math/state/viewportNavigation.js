export function zoomWindow(w,factor,anchor=[(w.uMin+w.uMax)/2,(w.vMin+w.vMax)/2]){
 if(!Number.isFinite(factor)||factor<=0)return w
 const uSpan=w.uMax-w.uMin,vSpan=w.vMax-w.vMin
 if(![uSpan,vSpan,...anchor].every(Number.isFinite)||uSpan<=0||vSpan<=0)return w
 const nextU=uSpan*factor,nextV=vSpan*factor
 if(Math.min(nextU,nextV)<1e-5||Math.max(nextU,nextV)>1e8)return w
 const [u,v]=anchor
 return {uMin:u+(w.uMin-u)*factor,uMax:u+(w.uMax-u)*factor,
         vMin:v+(w.vMin-v)*factor,vMax:v+(w.vMax-v)*factor}
}
export function panWindow(w,du,dv){
 if(!Number.isFinite(du)||!Number.isFinite(dv))return w
 return {uMin:w.uMin+du,uMax:w.uMax+du,vMin:w.vMin+dv,vMax:w.vMax+dv}
}
