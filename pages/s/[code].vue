<script setup>
import { useRoute } from '#app';
import { ref, onMounted } from 'vue';

const route = useRoute();
const decryptedCode = ref(null);

const code = route.params.code;

if (code) {
  try {
    // Use $fetch to call the decrypt API
    const data = await $fetch('/api/decrypt', {
      method: 'POST',
      body: {code: code},
    });

    // Store the decrypted code
    decryptedCode.value = data.decryptedCode;

    const mode = decryptedCode.value.mode === 'full' ? ' the full checkout form ' : ' the creditcard form ';

    defineOgImageComponent('Frame', {
      description: decryptedCode.value.name + ' has completed ' + mode + ' in ' + decryptedCode.value.score.toFixed(4) + ' sec.',
      title: '4242.pro - R u 10x dev?',
      bg: 'linear-gradient(to bottom right, #4f46e5, #1e1b4b)'
    })

    // redirecting user with nuxt
    await navigateTo('/')

  } catch (error) {
    console.error('Error fetching decrypted code:', error);
    decryptedCode.value = null;
  }
}
</script>

<template>
  <div>
    <p>Redirecting, one moment pl0x..</p>
  </div>
</template>

<style scoped>

</style>
