<script setup lang="ts">
import type { Note } from '~/types/types'

const props = defineProps<{
  notes: Note[]
}>()

const completionLabels = computed(() => {
  const labels = new Map<string, string>()
  for (const note of props.notes) {
    const done = note.todos.filter((todo) => todo.done).length
    labels.set(note.id, `${done}/${note.todos.length}`)
  }
  return labels
})

</script>

<template>
  <ul v-if="notes.length" class="notes-list">
    <li v-for="note, i in notes" :key="note.id" class="notes-list__item">
      <NuxtLink :to="`/${note.id}`" class="notes-list__link">
        <span class="notes-list__title">{{ note.title || note.todos[0]?.text }}</span>
        <span class="notes-list__meta">
          {{ completionLabels.get(note.id) }}
        </span>
      </NuxtLink>
    </li>
  </ul>
  <p v-else class="notes-list__empty">Заметок пока нет</p>
</template>

<style scoped lang="scss">
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
</style>
