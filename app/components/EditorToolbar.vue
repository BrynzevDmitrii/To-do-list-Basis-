<script setup lang="ts">
defineProps<{
  isNew: boolean
  canUndo: boolean
  canRedo: boolean
  canSave: boolean
}>()

const emit = defineEmits<{
  undo: []
  redo: []
  delete: []
  cancel: []
  save: []
}>()
</script>

<template>
  <div class="editor-toolbar">
    <div class="editor-toolbar__history">
      <button type="button" :disabled="!canUndo" @click="emit('undo')">⟲ Отменить</button>
      <button type="button" :disabled="!canRedo" @click="emit('redo')">⟳ Повторить</button>
    </div>

    <div class="editor-toolbar__actions">
      <button v-if="!isNew" type="button" class="btn btn--danger" @click="emit('delete')">
        Удалить
      </button>
      <button type="button" class="btn" @click="emit('cancel')">
        Отменить редактирование
      </button>
      <button type="button" class="btn btn--primary" :disabled="!canSave" @click="emit('save')">
        Сохранить
      </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-toolbar {
  &__history {
    display: flex;
    flex-wrap: wrap;
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

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 24px;

    @media (max-width: 480px) {
      flex-direction: column;
      align-items: stretch;
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

  &:hover:not(:disabled) {
    background: #d1d5db;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background: #1f2937;
    color: #fff;

    &:hover:not(:disabled) {
      background: #374151;
    }
  }

  &--danger {
    background: #dc2626;
    color: #fff;

    &:hover:not(:disabled) {
      background: #b91c1c;
    }
  }
}
</style>
