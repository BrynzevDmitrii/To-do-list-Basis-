import { readJson, writeJson, removeItem } from '~/utils/storage'

const DRAFT_PREFIX = 'draft:'

export function useDraft<T>(id: string) {
  const key = `${DRAFT_PREFIX}${id}`

  return {
    read: () => readJson<T>(key),
    write: (value: T) => writeJson(key, value),
    clear: () => removeItem(key)
  }
}
