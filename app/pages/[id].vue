<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'
import { useToastStore } from '~/stores/toast'
import { useNoteDraft } from '~/composables/useNoteDraft'
import { useDeletionWatcher } from '~/composables/useDeletionWatcher'
import type { NoteDraft, Note, DialogKind } from '~/types/types'

const route = useRoute()
const router = useRouter()
const notesStore = useNotesStore()
const { show: showToast } = useToastStore()

const id = computed<string>(() => String(route.params.id ?? ''))
const isNew = computed<boolean>(() => id.value === 'new')

const NoteIsReady = ref(false)
const activeDialog = ref<DialogKind>(null)

const {
  currentList,
  canUndo,
  canRedo,
  hasChanges,
  pendingDraft,
  commit,
  undo,
  redo,
  load: loadDraft,
  restoreDraft,
  discardDraft,
  commitSave,
  discardChanges
} = useNoteDraft(id)

const { notFound, markNotFound, markSelfDelete } = useDeletionWatcher(id, isNew, NoteIsReady)

const dialogConfig = computed(() => {
  if (activeDialog.value === 'delete') {
    return {
      title: 'Удалить заметку?',
      message: 'Это действие необратимо.',
      confirmLabel: 'Удалить',
      cancelLabel: 'Отмена',
      danger: true,
      onConfirm: confirmDelete
    }
  }
  if (activeDialog.value === 'leave') {
    return {
      title: 'Покинуть страницу?',
      message: 'Несохранённые изменения будут потеряны.',
      confirmLabel: 'Покинуть',
      cancelLabel: 'Остаться',
      danger: false,
      onConfirm: confirmLeave
    }
  }
  return {
    title: 'Отменить редактирование?',
    message: 'Несохранённые изменения будут потеряны.',
    confirmLabel: 'Отменить',
    cancelLabel: 'Продолжить редактирование',
    danger: false,
    onConfirm: confirmCancel
  }
})

function onBackClick(event: MouseEvent) {
  event.preventDefault()
  if (!hasChanges.value) {
    router.push('/')
    return
  }
  activeDialog.value = 'leave'
}

function confirmLeave() {
  activeDialog.value = null
  discardChanges()
  router.push('/')
}

onMounted(() => {
  if (!isNew.value) {
    const note = notesStore.getById(id.value)
    if (!note) {
      markNotFound()
      NoteIsReady.value = true
      return
    }
    loadDraft({
      title: note.title,
      todos: note.todos.map((todo) => ({ ...todo }))
    })
  } else {
    loadDraft({ title: '', todos: [] })
  }

  NoteIsReady.value = true

  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

function onKeydown(event: KeyboardEvent) {
  if (!event.ctrlKey || event.key.toLowerCase() !== 'z') return

  const target = event.target
  const isTextField =
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLInputElement && target.type === 'text')
  if (isTextField) return

  event.preventDefault()
  if (event.shiftKey) redo()
  else undo()
}

function onTitleInput(event: Event) {
  currentList.value.title = (event.target as HTMLInputElement).value
}

function addTodo() {
  currentList.value.todos.push({ id: crypto.randomUUID(), text: '', done: false })
  commit()
}

function removeTodo(todoId: string) {
  currentList.value.todos = currentList.value.todos.filter((todo) => todo.id !== todoId)
  commit()
}

function toggleTodo(todoId: string) {
  const todo = currentList.value.todos.find((t) => t.id === todoId)
  if (todo) todo.done = !todo.done
  commit()
}

function updateTodoText(todoId: string, value: string) {
  const todo = currentList.value.todos.find((t) => t.id === todoId)
  if (todo) todo.text = value
}

function handleSave() {
  const wasNew = isNew.value
  const cleanedTodos = currentList.value.todos.filter((todo) => todo.text.trim().length > 0)
  const note: Note = {
    id: wasNew ? crypto.randomUUID() : id.value,
    title: currentList.value.title.trim(),
    todos: cleanedTodos,
    updatedAt: Date.now()
  }
  notesStore.save(note)

  const savedDraft: NoteDraft = {
    title: note.title,
    todos: note.todos.map((todo) => ({ ...todo }))
  }
  commitSave(savedDraft)

  showToast('Заметка сохранена')

  if (wasNew) {
    router.replace(`/${note.id}`)
  }
}

function confirmCancel() {
  activeDialog.value = null
  discardChanges()
}

function confirmDelete() {
  activeDialog.value = null
  markSelfDelete()
  notesStore.remove(id.value)
  discardDraft()
  router.push('/')
}
</script>

<template>
  <Loader v-if="!NoteIsReady" />

  <section v-else class="editor">
    <template v-if="notFound">
      <p class="editor__not-found">Заметка не найдена.</p>
      <NuxtLink to="/" class="editor__back">К списку</NuxtLink>
    </template>

    <template v-else>
      <header class="editor__header">
        <h1 class="editor__title">{{ isNew ? 'Новая заметка' : 'Изменение заметки' }}</h1>
        <a href="/" class="editor__back" @click="onBackClick">К списку</a>
      </header>

      <input type="text" class="editor__name-input" placeholder="Название заметки" :value="currentList.title"
        @input="onTitleInput" @change="commit" />

      <TodoList :todos="currentList.todos" @add="addTodo" @toggle="toggleTodo" @update-text="updateTodoText"
        @commit="commit" @remove="removeTodo" />

      <EditorToolbar :is-new="isNew" :can-undo="canUndo" :can-redo="canRedo" :can-save="hasChanges" @undo="undo"
        @redo="redo" @delete="activeDialog = 'delete'" @cancel="activeDialog = 'cancel'" @save="handleSave" />

      <ConfirmModal :open="activeDialog !== null" :title="dialogConfig.title" :message="dialogConfig.message"
        :confirm-label="dialogConfig.confirmLabel" :cancel-label="dialogConfig.cancelLabel"
        :danger="dialogConfig.danger" @confirm="dialogConfig.onConfirm" @cancel="activeDialog = null" />

      <ConfirmModal :open="pendingDraft !== null" title="Восстановить черновик?"
        message="Найдены несохранённые изменения этой заметки, оставшиеся после перезагрузки страницы."
        confirm-label="Восстановить" cancel-label="Отклонить" @confirm="restoreDraft" @cancel="discardDraft" />
    </template>
  </section>
</template>

<style scoped lang="scss">
.editor {
  padding: 24px 16px;
  max-width: 600px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 32px 24px;
  }

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 22px;
    line-height: 1.25;

    @media (min-width: 768px) {
      font-size: 28px;
    }
  }

  &__back {
    font-size: 14px;
    color: #4b5563;
  }

  &__name-input {
    width: 100%;
    padding: 10px 12px;
    margin-bottom: 20px;
    font-size: 18px;
    border: 1px solid #d1d5db;
    border-radius: 8px;

    &:focus {
      outline: none;
      border-color: #1f2937;
    }
  }

  &__not-found {
    margin-bottom: 16px;
    color: #4b5563;
  }
}
</style>
