<template>
  <div class="h-full">
    <NuxtPage />
  </div>
</template>

<script setup>
useHead({
  htmlAttrs: {
    lang: 'en',
  },
  charset: 'utf-8',
  title: '4242.pro - R u 10x engineer?',

  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'title', content: '4242.pro - R u 10x engineer?' },
    { name: 'description', content: "Let's see if ur a 10x engineer or a n00b, your goal is to fill this checkout form asap." },
    { property: 'og:title', content: '4242.pro - R u 10x engineer?' },
    { property: 'og:description', content: "Let's see if ur a 10x engineer or a n00b, your goal is to fill this checkout form asap." },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://4242.pro/' },
    { property: 'og:image:type', content: 'image/png' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: '4242.pro' },
    { property: 'twitter:card', content: 'summary_large_image' },
    { property: 'twitter:site', content: '@erwin_ai' },
  ],
  link: [
    { rel: 'canonical', href: 'https://4242.pro/' },
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
  ],
  script: [
    { src: '/main.js' },
    { src: 'https://scripts.simpleanalyticscdn.com/latest.js', body: true, async: true, defer: true, 'data-collect-dnt': 'true' },
  ],
})
</script>

<style>
html {
  height: 100%;
  background-color: #f3f3f3;
}
body {
  height: 100%;
}

#__nuxt {
  height: 100%;
}
</style>
