<script setup lang="ts">
import type { TodoItem } from '~/types/types'

defineProps<{
  todo: TodoItem
}>()

const emit = defineEmits<{
  toggle: []
  'update-text': [value: string]
  commit: []
  remove: []
}>()

function onTextInput(event: Event) {
  emit('update-text', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <li class="todo-item" :class="{ 'todo-item--done': todo.done }">
    <input
      type="checkbox"
      class="todo-item__checkbox"
      :checked="todo.done"
      aria-label="Отметить как выполненный"
      @change="emit('toggle')"
    />

    <input
      type="text"
      class="todo-item__text"
      placeholder="Что нужно сделать?"
      :value="todo.text"
      @input="onTextInput"
      @change="emit('commit')"
    />

    <button
      type="button"
      class="todo-item__remove"
      aria-label="Удалить пункт"
      @click="emit('remove')"
    >
      ×
    </button>
  </li>
</template>

<style scoped lang="scss">
.todo-item {
  display: flex;
  align-items: center;
  gap: 8px;

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

  &--done &__text {
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
</style>
