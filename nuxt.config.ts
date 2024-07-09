// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    secretShareKey: '',
  },

  site: {
    url: 'https://www.4242.pro/',
  },

  compatibilityDate: '2024-07-06',
  modules: ["nuxt-og-image"]
})
