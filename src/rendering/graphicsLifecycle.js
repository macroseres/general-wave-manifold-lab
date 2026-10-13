/** Dispose owned Three.js resources when a memoized object is replaced or unmounted. */
export function disposeGeometry(geometry) {
  geometry?.dispose()
}

export function disposeAxesHelper(axes) {
  if (!axes) return
  axes.geometry?.dispose()
  if (Array.isArray(axes.material)) axes.material.forEach(material => material?.dispose())
  else axes.material?.dispose()
}
