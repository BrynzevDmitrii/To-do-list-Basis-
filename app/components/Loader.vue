<template>
  <div class="loader" role="status" aria-live="polite" aria-label="Загрузка">
    <span class="loader__spinner" />
  </div>
</template>

<style scoped lang="scss">
.loader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 0;

  &__spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #1f2937;
    border-radius: 50%;
    animation: loader-spin 0.7s linear infinite;
  }
}

@keyframes loader-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
