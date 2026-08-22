<script setup lang="ts">
import { useNotes } from '~/composables/useNotes'
import { useUndoableState } from '~/composables/useUndoableState'
import type { NoteDraft, Note } from '~/types/types'

const route = useRoute()
const router = useRouter()
const { getById, save, remove } = useNotes()

const id = computed<string>(() => String(route.params.id ?? ''))
const isNew = computed<boolean>(() => id.value === 'new')

const { state, commit, undo, redo, reset, canUndo, canRedo } = useUndoableState<NoteDraft>({ title: '', todos: [] })

const loaded = ref(false)
const notFound = ref(false)
const isCancelOpen = ref(false)
const isDeleteOpen = ref(false)

onMounted(() => {
  if (!isNew.value) {
    const note = getById(id.value)
    if (!note) {
      notFound.value = true
      loaded.value = true
      return
    }
    reset({
      title: note.title,
      todos: note.todos.map((todo) => ({ ...todo }))
    })
  }
  loaded.value = true

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
  state.value.title = (event.target as HTMLInputElement).value
}

function addTodo() {
  state.value.todos.push({ id: crypto.randomUUID(), text: '', done: false })
  commit()
}

function removeTodo(todoId: string) {
  state.value.todos = state.value.todos.filter((todo) => todo.id !== todoId)
  commit()
}

function toggleTodo(todoId: string) {
  const todo = state.value.todos.find((t) => t.id === todoId)
  if (todo) todo.done = !todo.done
  commit()
}

function onTodoTextInput(todoId: string, event: Event) {
  const todo = state.value.todos.find((t) => t.id === todoId)
  if (todo) todo.text = (event.target as HTMLInputElement).value
}

function handleSave() {
  const note: Note = {
    id: isNew.value ? crypto.randomUUID() : id.value,
    title: state.value.title.trim(),
    todos: state.value.todos,
    updatedAt: Date.now()
  }
  save(note)
  router.push('/')
}

function confirmCancel() {
  isCancelOpen.value = false
  router.push('/')
}

function confirmDelete() {
  isDeleteOpen.value = false
  remove(id.value)
  router.push('/')
}
</script>

<template>
  <section v-if="loaded" class="editor">
    <template v-if="notFound">
      <p class="editor__not-found">Заметка не найдена.</p>
      <NuxtLink to="/" class="editor__back">К списку</NuxtLink>
    </template>

    <template v-else>
      <header class="editor__header">
        <h1 class="editor__title">{{ isNew ? 'Новая заметка' : 'Изменение заметки' }}</h1>
        <NuxtLink to="/" class="editor__back">К списку</NuxtLink>
      </header>

      <input type="text" class="editor__name-input" placeholder="Название заметки" :value="state.title"
        @input="onTitleInput" @change="commit" />

      <ul class="todo-list">
        <li v-for="todo in state.todos" :key="todo.id" class="todo-list__item"
          :class="{ 'todo-list__item--done': todo.done }">
          <input type="checkbox" class="todo-list__checkbox" :checked="todo.done" aria-label="Отметить как выполненный"
            @change="toggleTodo(todo.id)" />

          <input type="text" class="todo-list__text" placeholder="Что нужно сделать?" :value="todo.text"
            @input="onTodoTextInput(todo.id, $event)" @change="commit" />

          <button type="button" class="todo-list__remove" aria-label="Удалить пункт" @click="removeTodo(todo.id)">
            ×
          </button>
        </li>
      </ul>

      <button type="button" class="add-todo" @click="addTodo">+ Добавить пункт</button>

      <div class="history-actions">
        <button type="button" :disabled="!canUndo" @click="undo">⟲ Отменить</button>
        <button type="button" :disabled="!canRedo" @click="redo">⟳ Повторить</button>
      </div>

      <div class="editor__actions">
        <button v-if="!isNew" type="button" class="btn btn--danger" @click="isDeleteOpen = true">
          Удалить
        </button>
        <button type="button" class="btn" @click="isCancelOpen = true">
          Отменить редактирование
        </button>
        <button type="button" class="btn btn--primary" @click="handleSave">
          Сохранить
        </button>
      </div>

      <ConfirmDialog :open="isCancelOpen" title="Отменить редактирование?"
        message="Несохранённые изменения будут потеряны." confirm-label="Отменить"
        cancel-label="Продолжить редактирование" @confirm="confirmCancel" @cancel="isCancelOpen = false" />

      <ConfirmDialog :open="isDeleteOpen" title="Удалить заметку?" message="Это действие необратимо."
        confirm-label="Удалить" cancel-label="Отмена" danger @confirm="confirmDelete" @cancel="isDeleteOpen = false" />
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

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;
  }
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0 0 12px;
  list-style: none;

  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__checkbox {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &__text {
    flex: 1;
    padding: 8px 10px;
    font-size: 14px;
    border: 1px solid #d1d5db;
    border-radius: 6px;

    &:focus {
      outline: none;
      border-color: #1f2937;
    }
  }

  &__item--done &__text {
    color: #9ca3af;
    text-decoration: line-through;
  }

  &__remove {
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #9ca3af;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;

    &:hover {
      background: #f3f4f6;
      color: #dc2626;
    }
  }
}

.add-todo {
  padding: 8px 12px;
  border: 1px dashed #9ca3af;
  border-radius: 8px;
  background: transparent;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    border-color: #1f2937;
    color: #1f2937;
  }
}

.history-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;

  button {
    padding: 6px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: #fff;
    font-size: 13px;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: #f3f4f6;
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  background: #e5e7eb;
  color: #111827;
  transition: background 0.15s ease;

  &:hover {
    background: #d1d5db;
  }

  &--primary {
    background: #1f2937;
    color: #fff;

    &:hover {
      background: #374151;
    }
  }

  &--danger {
    background: #dc2626;
    color: #fff;

    &:hover {
      background: #b91c1c;
    }
  }
}
</style>
