/** Bounded diagnostic storage; totals include attempts omitted from the detail list. */
export function boundedSearchReport(){
  return {complete:false,attempts:[],attemptCount:0,reasonCounts:{},detailsLimit:128,detailsTruncated:false}
}

export function recordSearchAttempt(report,pattern,status,detail={}){
  if(!report)return
  report.attemptCount++
  report.reasonCounts[status]=(report.reasonCounts[status]??0)+1
  if(report.attempts.length<report.detailsLimit)report.attempts.push({pattern,status,...detail})
  else report.detailsTruncated=true
}

export function finishSearchReport(report,candidates){
  report.status=report.reasonCounts['invalid-input']?'invalid-input':candidates.length?'candidates-found':'no-candidates-found'
  report.selectable=candidates.length
  report.qualification='Busca limitada; os motivos descrevem apenas as tentativas examinadas. Ausência de candidatos não demonstra inexistência.'
  return {candidates,report}
}
