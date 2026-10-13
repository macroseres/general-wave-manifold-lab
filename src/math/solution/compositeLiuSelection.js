/** Associate sampled Liu evidence with the matching refined sonic contact.
 * Forward shock–rarefaction uses S+ and forward Liu; backward rarefaction–shock
 * uses S- and backward Liu. These are numerical necessary checks, not proofs.
 */
export function classifyCompositeLiu(connections, contacts, forwardReports, backwardReports = [], {matchTolerance=1e-7}={}) {
  const left=(contacts?.left??[]).filter(q=>q?.refinement?.status==='converged')
  const right=(contacts?.right??[]).filter(q=>q?.refinement?.status==='converged')
  return (connections??[]).map(connection=>{
    const forward=connection.kind==='shock-rarefaction'&&connection.contactSide==='left'
    const backward=connection.kind==='rarefaction-shock'&&connection.contactSide==='right'
    if(!forward&&!backward)
      return {...connection,liuStatus:'not-evaluated',liuReason:'unsupported composite orientation',liuAssessment:null}
    if(connection.status!=='weak-lax-candidate')
      return {...connection,liuStatus:'not-evaluated',liuReason:'geometric or endpoint prerequisites not met',liuAssessment:null}
    const candidates=forward?left:right
    const reports=forward?forwardReports:backwardReports
    const expectedSide=forward?'plus':'minus'
    const matches=candidates.map((contact,index)=>({contact,index})).filter(({contact})=>
      contact.family===connection.family&&contact.sonicSide===expectedSide&&
      Array.isArray(contact.refinement?.point)&&Array.isArray(connection.point)&&
      contact.refinement.point.length===2&&connection.point.length===2&&
      contact.refinement.point.every(Number.isFinite)&&connection.point.every(Number.isFinite)&&
      Math.hypot(contact.refinement.point[0]-connection.point[0],contact.refinement.point[1]-connection.point[1])<=matchTolerance*(1+Math.hypot(...connection.point)))
    if(matches.length!==1)
      return {...connection,liuStatus:'inconclusive',liuReason:matches.length?'ambiguous-contact':'contact-not-found',liuAssessment:null}
    const report=reports?.[matches[0].index]
    if(forward){
      const assessment=report?.assessment??null
      const status=assessment?.status==='liu-violation-detected'?'violation-detected':
        assessment?.status==='no-liu-violation-detected'?'no-violation-detected':'inconclusive'
      return {...connection,liuStatus:status,liuReason:assessment?.qualification??'forward Liu arc unavailable or unresolved',liuAssessment:assessment}
    }
    const status=['preliminary-backward-liu-violation','preliminary-sampled-backward-liu-violation'].includes(report?.status)?'violation-detected':
      ['preliminary-backward-liu-no-violation-detected','preliminary-sampled-backward-liu-compatible'].includes(report?.status)?'no-violation-detected':'inconclusive'
    return {...connection,liuStatus:status,liuReason:report?.qualification??'backward Liu arc unavailable or unresolved',liuAssessment:report??null}
  })
}
