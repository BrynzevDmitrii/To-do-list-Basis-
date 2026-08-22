<script setup lang="ts">
const route = useRoute()
const id = computed<string>(() => String(route.params.id ?? ''))
const isNew = computed<boolean>(() => id.value === 'new')
</script>

<template>
  <section>
    <h1>{{ isNew ? 'Новая заметка' : 'Изменение заметки' }}</h1>
    <p v-if="!isNew">id: {{ id }}</p>

    <nav>
      <NuxtLink to="/">К списку</NuxtLink>
    </nav>
  </section>
</template>
