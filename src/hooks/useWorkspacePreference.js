import {useEffect, useState} from 'react'

// Retains presentation preferences while workspaces mount and unmount.
// This cache is session-scoped; it does not overwrite explicitly saved viewports.
const preferences = new Map()

export function useWorkspacePreference(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (preferences.has(key)) return preferences.get(key)
    return typeof initialValue === 'function' ? initialValue() : initialValue
  })
  useEffect(() => {
    preferences.set(key, value)
  }, [key, value])
  return [value, setValue]
}
