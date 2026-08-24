<script setup lang="ts">
import type { TodoItem } from '~/types/types'

defineProps<{
  todos: TodoItem[]
}>()

const emit = defineEmits<{
  add: []
  toggle: [id: string]
  'update-text': [id: string, value: string]
  commit: []
  remove: [id: string]
}>()
</script>

<template>
  <div>
    <ul class="todo-list">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="emit('toggle', todo.id)"
        @update-text="(value) => emit('update-text', todo.id, value)"
        @commit="emit('commit')"
        @remove="emit('remove', todo.id)"
      />
    </ul>

    <button type="button" class="add-todo" @click="emit('add')">+ Добавить пункт</button>
  </div>
</template>

<style scoped lang="scss">
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0;
  margin: 0 0 12px;
  list-style: none;
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
</style>
