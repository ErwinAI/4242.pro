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

  site: {
    url: 'http://localhost:3000/',
  },

  compatibilityDate: '2024-07-06',
  modules: ["nuxt-og-image"]
})
