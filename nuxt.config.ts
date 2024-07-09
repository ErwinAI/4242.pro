// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  debug: false,
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  site: {
    url: 'http://localhost:4000/',
  },

  compatibilityDate: '2024-07-06',
  modules: ['nuxt-og-image'],
})
