<template>
  <div>
    <p>Redirecting, one moment pl0x..</p>
  </div>
</template>

<script setup>
import { useRouter } from '#app';

const router = useRouter();
defineOgImageComponent('Frame', {
  title: '4242.pro - R u 10x dev?',
  bg: 'linear-gradient(to bottom right, #4f46e5, #1e1b4b)'
});

// Redirecting user with Nuxt
await router.push('/')

</script>

<style scoped>

</style>
