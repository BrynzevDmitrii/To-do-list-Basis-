<script setup lang="ts">
import { useNotes } from '~/composables/useNotes'
import { useUndoableState } from '~/composables/useUndoableState'
import { useToast } from '~/composables/useToast'
import type { NoteDraft, Note, DialogKind } from '~/types/types'

const route = useRoute()
const router = useRouter()
const { getById, save, remove } = useNotes()

const id = computed<string>(() => String(route.params.id ?? ''))
const isNew = computed<boolean>(() => id.value === 'new')

const { currentList, commit, undo, redo, reset, canUndo, canRedo } = useUndoableState<NoteDraft>({ title: '', todos: [] })
const { show: showToast } = useToast()

const NoteIsReady = ref(false)
const notFound = ref(false)
const activeDialog = ref<DialogKind>(null)
const originalDraft = ref<NoteDraft>({ title: '', todos: [] })

const hasChanges = computed(() => JSON.stringify(currentList.value) !== JSON.stringify(originalDraft.value))

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
  return {
    title: 'Отменить редактирование?',
    message: 'Несохранённые изменения будут потеряны.',
    confirmLabel: 'Отменить',
    cancelLabel: 'Продолжить редактирование',
    danger: false,
    onConfirm: confirmCancel
  }
})

onMounted(() => {
  if (!isNew.value) {
    const note = getById(id.value)
    if (!note) {
      notFound.value = true
      NoteIsReady.value = true
      return
    }
    originalDraft.value = {
      title: note.title,
      todos: note.todos.map((todo) => ({ ...todo }))
    }
    reset(originalDraft.value)
  }
  NoteIsReady.value = true

  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

function onKeydown(event: KeyboardEvent) {
  if (!event.ctrlKey || event.key.toLowerCase() !== 'z') return
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
  const note: Note = {
    id: wasNew ? crypto.randomUUID() : id.value,
    title: currentList.value.title.trim(),
    todos: currentList.value.todos,
    updatedAt: Date.now()
  }
  save(note)
  originalDraft.value = {
    title: note.title,
    todos: note.todos.map((todo) => ({ ...todo }))
  }
  showToast('Заметка сохранена')
  if (wasNew) {
    router.replace(`/${note.id}`)
  }
}

function confirmCancel() {
  activeDialog.value = null
  reset(originalDraft.value)
}

function confirmDelete() {
  activeDialog.value = null
  remove(id.value)
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
        <NuxtLink to="/" class="editor__back">К списку</NuxtLink>
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
    </template>
  </section>
</template>

<style scoped lang="scss">
.editor {
  padding: 32px 0;
  max-width: 600px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &__title {
    font-size: 28px;
    line-height: 1.25;
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
