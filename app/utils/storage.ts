export function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function removeItem(key: string) {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}
