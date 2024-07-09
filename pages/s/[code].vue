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

      defineOgImageComponent('NuxtSeo', {
        title: decryptedCode.value.name + ' has completed ' + mode + ' in ' + decryptedCode.value.score.toFixed(4) + ' sec.',
        description: 'Want to try and beat them? 4242.pro',
        theme: '#4f46e5',
        colorMode: 'dark',
      })

    } catch (error) {
      console.error('Error fetching decrypted code:', error);
      decryptedCode.value = null;
    }
  }
</script>

<template>
  <div>
    <h1>Decryption Page</h1>
    <p v-if="decryptedCode">Decrypted Code: {{ decryptedCode }}</p>
  </div>
</template>

<style scoped>

</style>
