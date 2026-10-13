/** Presentation-only aggregation of the optional continuation audit. */
export function continuationSummary(diagnostics) {
  const continuation = diagnostics?.continuation
  if (!continuation) return { available: false, traces: 0, samples: 0, events: 0, rootCountChanges: 0, competingRoots: 0, unresolved: 0 }
  const events = Array.isArray(continuation.events) ? continuation.events : []
  return {
    available: true,
    traces: continuation.traces ?? 0,
    samples: continuation.samples ?? 0,
    events: events.length,
    rootCountChanges: events.filter(e => e.kind === 'root-count-change').length,
    competingRoots: events.filter(e => e.kind === 'close-competing-roots').length,
    unresolved: events.filter(e => e.classification === 'unresolved').length,
  }
}
