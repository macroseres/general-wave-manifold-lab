import {riemannMonotoneRarefactions} from '../rarefaction/monotoneBranches.js'

// Half the previous trace step; preserve the search extent and its finite budget.
// This improves local junction reconstruction without changing acceptance criteria.
export const stateConstructionSampling={step:.02,maxSteps:640,maxLength:12}
export const constructionRarefactionBranches=(states,p)=>riemannMonotoneRarefactions(states,p,stateConstructionSampling)
