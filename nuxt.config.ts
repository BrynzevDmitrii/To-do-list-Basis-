export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: false,

  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  css: ['~/assets/css/main.css'],

  vite: {
    server: {
      watch: {
        usePolling: true,
        interval: 300
      }
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  },

  app: {
    head: {
      title: 'Заметки',
      htmlAttrs: { lang: 'ru' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})
