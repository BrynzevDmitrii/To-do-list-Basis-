<template>
  <div class="add-button-wrapper">
    <span class="add-button-text">Добавить новую заметку</span>
    <NuxtLink to="/new" class="add-button" title="Создать заметку" aria-label="Создать заметку">
      +
    </NuxtLink>
  </div>
</template>

<style scoped lang="scss">
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
</style>
