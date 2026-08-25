import { ref, computed, watch, type ComputedRef, type Ref } from 'vue'
import { useNotesStore } from '~/stores/notes'
import { useToastStore } from '~/stores/toast'

export function useDeletionWatcher(id: ComputedRef<string>, isNew: ComputedRef<boolean>, isReady: Ref<boolean>) {
  const notesStore = useNotesStore()
  const { show: showToast } = useToastStore()

  const notFound = ref(false)
  let isSelfDelete = false

  const currentStoredNote = computed(() => (!isNew.value ? notesStore.getById(id.value) : undefined))

  watch(currentStoredNote, (note) => {
    if (isNew.value || isSelfDelete || !isReady.value || notFound.value) return
    if (!note) {
      notFound.value = true
      showToast('Эта заметка была удалена в другой вкладке', 'error')
    }
  })

  function markNotFound() {
    notFound.value = true
  }

  function markSelfDelete() {
    isSelfDelete = true
  }

  return { notFound, markNotFound, markSelfDelete }
}
