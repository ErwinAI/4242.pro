// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  debug: false,
  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  routeRules: {
    '/api/code': {
      csurf: false
    }
  },

  csurf: { // optional
    https: false,
    cookie: {
      path: '/',
      httpOnly: true,
      sameSite: 'strict'
    },
    methodsToProtect: ['POST'], // the request methods we want CSRF protection for
    addCsrfTokenToEventCtx: true // default false, to run useCsrfFetch on server set it to true
  },

  runtimeConfig: {
    secretShareKey: '',
  },

  site: {
    url: 'https://www.4242.pro/',
  },

  compatibilityDate: '2024-07-06',
  modules: ['nuxt-og-image', "nuxt-csurf"],
})
