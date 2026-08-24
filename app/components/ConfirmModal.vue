<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    message?: string
    confirmLabel?: string
    cancelLabel?: string
    danger?: boolean
  }>(),
  {
    message: '',
    confirmLabel: 'Подтвердить',
    cancelLabel: 'Отмена',
    danger: false
  }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const cancelButton = useTemplateRef<HTMLButtonElement>('cancelButton')
const confirmButton = useTemplateRef<HTMLButtonElement>('confirmButton')

let elementFocusedBeforeOpen: HTMLElement | null = null

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      elementFocusedBeforeOpen = document.activeElement as HTMLElement | null
      nextTick(() => cancelButton.value?.focus())
    } else {
      elementFocusedBeforeOpen?.focus()
      elementFocusedBeforeOpen = null
    }
  }
)

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('cancel')
    return
  }

  if (event.key !== 'Tab') return

  const focusables = [cancelButton.value, confirmButton.value].filter(
    (el): el is HTMLButtonElement => el !== null
  )
  if (focusables.length === 0) return

  const first = focusables[0]
  const last = focusables[focusables.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}

</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="confirm-overlay" @click.self="emit('cancel')" @keydown="onKeydown">
      <div class="confirm-dialog" role="alertdialog" aria-modal="true" :aria-label="title">
        <h2 class="confirm-dialog__title">{{ title }}</h2>
        <p v-if="message" class="confirm-dialog__message">{{ message }}</p>

        <div class="confirm-dialog__actions">
          <button ref="cancelButton" type="button" class="btn" @click="emit('cancel')">
            {{ cancelLabel }}
          </button>
          <button
            ref="confirmButton"
            type="button"
            class="btn"
            :class="danger ? 'btn--danger' : 'btn--primary'"
            @click="emit('confirm')"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.confirm-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
  z-index: 100;
}

.confirm-dialog {
  width: 100%;
  max-width: 360px;
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);

  &__title {
    margin: 0 0 8px;
    font-size: 18px;
    line-height: 1.3;
  }

  &__message {
    margin: 0 0 20px;
    font-size: 14px;
    line-height: 1.5;
    color: #4b5563;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
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
