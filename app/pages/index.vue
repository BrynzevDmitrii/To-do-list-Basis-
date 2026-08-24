<script setup lang="ts">
import Loader from '~/components/Loader.vue'
import { useNotes } from '~/composables/useNotes'
import type { Note } from '~/types/types'

const { sortedlist } = useNotes()
const notes = ref<Note[]>([])
const NoteIsReady = ref(false)

onMounted(() => {
  notes.value = sortedlist()
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
  padding: 32px 0;
  max-width: 600px;
  margin: 0 auto;

  .title {
    font-size: 32px;
    line-height: 1.25;
    margin-bottom: 24px;
  }
}
</style>
