<template>
  <div>
    <p>Redirecting, one moment pl0x..</p>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from '#app';
import { ref } from 'vue';
const { $csrfFetch } = useNuxtApp()

const route = useRoute();
const router = useRouter();
const decryptedCode = ref(null);

// call /api/code
try {
  const { data, error } = await useAsyncData('code', () =>
    $fetch('/api/code', {
      method: 'POST',
      body: { code: route.params.code },
    })
  );

  const mode = data.value.mode === 'full' ? ' the full checkout form ' : ' the creditcard form ';

  defineOgImageComponent('Frame', {
    description: data.value.username + ' has completed ' + mode + ' in ' + data.value.time.toFixed(4) + ' sec.',
    title: '4242.pro - R u 10x dev?',
    bg: 'linear-gradient(to bottom right, #4f46e5, #1e1b4b)'
  });

  // Redirecting user with Nuxt
  await router.push('/');

} catch(e) {
  console.error('Error fetching:', e);
  decryptedCode.value = null;
}
</script>

<style scoped>

</style>
