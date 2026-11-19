/** Browser-independent lifecycle helpers for the sonic mesh worker. */
export function sonicSurfaceStatus(result, key, visible) {
  if (!visible) return 'hidden'
  return result?.key === key ? result.state : 'loading'
}

export function isCurrentSonicResponse(response, requestId, key) {
  return response != null && response.id === requestId && response.key === key
}

/** Detach callbacks before termination to prevent stale delivery and retention. */
export function disposeSonicWorker(worker) {
  if (!worker) return
  worker.onmessage = null
  worker.onerror = null
  worker.onmessageerror = null
  worker.terminate()
}
