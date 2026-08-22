<script setup lang="ts">
import { useNotes } from '~/composables/useNotes'
import type { Note } from '~/types/types'

const { sortedlist } = useNotes()
const notes = ref<Note[]>([])

const completionLabels = computed(() => {
  const labels = new Map<string, string>()
  for (const note of notes.value) {
    const done = note.todos.filter((todo) => todo.done).length
    labels.set(note.id, `${done}/${note.todos.length}`)
  }
  return labels
})

onMounted(() => {
  notes.value = sortedlist()
})
</script>

<template>
  <section class="container">
    <h1 class="title">Заметки</h1>

    <ul v-if="notes.length" class="notes-list">
      <li v-for="note in notes" :key="note.id" class="notes-list__item">
        <NuxtLink :to="`/${note.id}`" class="notes-list__link">
          <span class="notes-list__title">{{ note.title || 'Без названия' }}</span>
          <span class="notes-list__meta">
            {{ completionLabels.get(note.id) }}
          </span>
        </NuxtLink>
      </li>
    </ul>
    <p v-else class="notes-list__empty">Заметок пока нет</p>

    <div class="add-button-wrapper">
      <span class="add-button-text">Добавить новую заметку</span>
      <NuxtLink to="/new" class="add-button" title="Создать заметку" aria-label="Создать заметку">
        +
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.container {
  padding: 32px 0;
  max-width: 600px;
  margin: 0 auto;

  .title {
    font-size: 32px;
    line-height: 1.25;
    margin-bottom: 24px;
  }

  .notes-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0;
    margin: 0 0 32px;
    list-style: none;

    &__link {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      color: inherit;
      text-decoration: none;
      transition: border-color 0.15s ease, background 0.15s ease;

      &:hover {
        border-color: #1f2937;
        background: #f9fafb;
      }
    }

    &__title {
      font-size: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__meta {
      flex-shrink: 0;
      font-size: 13px;
      color: #6b7280;
    }

    &__empty {
      margin: 0 0 32px;
      color: #6b7280;
    }
  }

  .add-button-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .add-button-text {
    position: absolute;
    top: 100%;
    margin-top: 8px;
    font-size: 12px;
    line-height: 1;
    opacity: 0.5;
  }


  .add-button {
    position: relative;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #1f2937;
    color: #fff;
    font-size: 32px;
    line-height: 1;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    transition: background 0.15s ease, transform 0.1s ease;

    &:hover {
      background: #374151;
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
