<script setup>
defineProps({
  src: String,
  alt: String,
  secondaryCard: Boolean,
})
</script>

<template>
  <div v-if="!secondaryCard">
    <span class="flex items-center pointer-events-none pr-1 z-[3]">
      <img :src="src" :alt="alt" class="h-4 border-none" loading="lazy">
    </span>
  </div>
  <span v-else class="card-icon opacity-100 scale-100 absolute top-0 left-0 transition-all duration-400 ease-[0.15s]">
    <span class="flex items-center pointer-events-none pr-1 z-[3]">
      <img :src="src" :alt="alt" class="h-4 border-none" loading="lazy">
    </span>
  </span>
</template>

<style scoped>

</style>
