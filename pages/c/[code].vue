<template>
  <div>
    <p>Redirecting, one moment pl0x..</p>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from '#app';
import { ref } from 'vue';

const route = useRoute();
const router = useRouter();
const decryptedCode = ref(null);

// call appwrite

const { data, error } = await useAsyncData('decryptedCode', () =>
    $fetch('/api/decrypt', {
      method: 'POST',
      body: { code: route.params.code },
    })
);

if (error.value) {
  console.error('Error fetching decrypted code:', error.value);
  decryptedCode.value = null;
} else {
  decryptedCode.value = data.value.decryptedCode;

  const mode = decryptedCode.value.mode === 'full' ? ' the full checkout form ' : ' the creditcard form ';

  defineOgImageComponent('Frame', {
    description: decryptedCode.value.name + ' has completed ' + mode + ' in ' + decryptedCode.value.score.toFixed(4) + ' sec.',
    title: '4242.pro - R u 10x dev?',
    bg: 'linear-gradient(to bottom right, #4f46e5, #1e1b4b)'
  });

  // Redirecting user with Nuxt
  await router.push('/');
}
</script>

<style scoped>

</style>
