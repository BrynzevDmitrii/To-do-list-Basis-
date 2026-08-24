<script setup lang="ts">
import Loader from '~/components/Loader.vue'
import { useNotesStore } from '~/stores/notes'

const notesStore = useNotesStore()
const notes = computed(() => notesStore.sortedList)
const NoteIsReady = ref(false)

onMounted(() => {
  NoteIsReady.value = true
})
</script>

<template>
  <Loader v-if="!NoteIsReady" />
  <section v-else class="container">
    <h1 class="title">Заметки</h1>

    <NotesList :notes="notes" />

    <AddNoteButton />
  </section>
</template>

<style scoped lang="scss">
.container {
  padding: 24px 16px;
  max-width: 600px;
  margin: 0 auto;

  @media (min-width: 768px) {
    padding: 32px 24px;
  }

  .title {
    font-size: 26px;
    line-height: 1.25;
    margin-bottom: 24px;

    @media (min-width: 768px) {
      font-size: 32px;
    }
  }
}
</style>
