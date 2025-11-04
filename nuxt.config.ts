// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    'nuxt-mongoose',
    'nuxt-auth-utils'
  ],
  
  mongoose: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/linh-trieu-binh-ca',
    options: {},
    modelsDir: 'server/models',
    devtools: true
  },
  
  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET || 'change-this-secret-in-production'
  }
})
