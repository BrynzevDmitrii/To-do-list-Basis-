import type { ToastMessage } from '~/types/types'

const toasts = ref<ToastMessage[]>([])

export function useToast() {
  function show(text: string, type: ToastMessage['type'] = 'success', duration = 3000) {
    const id = crypto.randomUUID()
    toasts.value.push({ id, text, type })
    setTimeout(() => remove(id), duration)
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return { toasts, show, remove }
}
