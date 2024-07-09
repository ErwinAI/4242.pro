<script setup>
import { useRoute, useFetch } from '#app';
import { ref, onMounted } from 'vue';

const route = useRoute();
const decryptedCode = ref(null);

onMounted(async () => {
  const code = route.params.code;

  if (code) {
    try {
      // Use $fetch to call the decrypt API
      const { data, error } = await useFetch('/api/decrypt', {
        method: 'POST',
        body: { code: code },
      });

      if (error.value) {
        console.error('Error:', error.value);
        decryptedCode.value = null;
        return;
      }

      decryptedCode.value = data.value.decryptedCode;
    } catch (error) {
      console.error('Error fetching decrypted code:', error);
      decryptedCode.value = null;
    }
  }
});
</script>

<template>
  <div>
    <h1>Decryption Page</h1>
    <p v-if="decryptedCode">Decrypted Code: {{ decryptedCode }}</p>
  </div>
</template>

<style scoped>

</style>
