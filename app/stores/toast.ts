import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ToastMessage } from '~/types/types'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<ToastMessage[]>([])

  function show(text: string, type: ToastMessage['type'] = 'success', duration = 3000) {
    const id = crypto.randomUUID()
    toasts.value.push({ id, text, type })
    setTimeout(() => remove(id), duration)
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return { toasts, show, remove }
})
