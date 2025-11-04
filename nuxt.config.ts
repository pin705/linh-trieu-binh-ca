// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    'nuxt-mongoose',
    'nuxt-auth-utils',
    '@nuxtjs/tailwindcss'
  ],

  mongoose: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/linh-trieu-binh-ca',
    options: {},
    modelsDir: 'server/models',
    devtools: true,
  },

  runtimeConfig: {
    // Private keys available only on server side
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/linh-trieu-binh-ca',
    
    // Public keys exposed to client
    public: {
      apiBase: '/api'
    }
  }
})
