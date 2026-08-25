import type { JsonValue, Patch } from "~/types/types";

function isPlainObject(value: unknown): value is Record<string, JsonValue> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Computes the minimal set of changes needed to turn `oldValue` into `newValue`. */
export function diff(oldValue: JsonValue, newValue: JsonValue): Patch {
  if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
    return { type: 'same' }
  }

  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    const changes: Record<number, Patch> = {}
    const maxLength = Math.max(oldValue.length, newValue.length)
    for (let i = 0; i < maxLength; i++) {
      const before = i < oldValue.length ? oldValue[i]! : null
      const after = i < newValue.length ? newValue[i]! : null
      const childPatch = diff(before, after)
      if (childPatch.type !== 'same') changes[i] = childPatch
    }
    return { type: 'array', length: newValue.length, changes }
  }

  if (isPlainObject(oldValue) && isPlainObject(newValue)) {
    const changes: Record<string, Patch> = {}
    const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)])
    for (const key of keys) {
      const before = Object.prototype.hasOwnProperty.call(oldValue, key) ? oldValue[key]! : null
      const after = Object.prototype.hasOwnProperty.call(newValue, key) ? newValue[key]! : null
      const childPatch = diff(before, after)
      if (childPatch.type !== 'same') changes[key] = childPatch
    }
    return { type: 'object', changes }
  }

  return { type: 'set', value: newValue }
}

/** Applies a patch produced by diff() to reconstruct the target value. */
export function applyPatch<T extends JsonValue>(value: T, patch: Patch): T {
  switch (patch.type) {
    case 'same':
      return value
    case 'set':
      return patch.value as T
    case 'object': {
      const result: Record<string, JsonValue> = { ...(value as Record<string, JsonValue>) }
      for (const [key, childPatch] of Object.entries(patch.changes)) {
        result[key] = applyPatch((result[key] ?? null) as JsonValue, childPatch)
      }
      return result as T
    }
    case 'array': {
      const source = value as JsonValue[]
      const result: JsonValue[] = source.slice(0, patch.length)
      while (result.length < patch.length) result.push(null)
      for (const [indexStr, childPatch] of Object.entries(patch.changes)) {
        const index = Number(indexStr)
        if (index >= patch.length) continue // index was truncated away; nothing to apply
        result[index] = applyPatch((result[index] ?? null) as JsonValue, childPatch)
      }
      return result as T
    }
  }
}
