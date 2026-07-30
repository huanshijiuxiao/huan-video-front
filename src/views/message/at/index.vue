<template>
  <div class="h-full overflow-y-auto rounded border border-white/80 bg-white/90 text-zinc-600 shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-300 dark:shadow-black/30">
    <div v-if="loading" class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <div v-for="index in 4" :key="index" class="flex gap-3 px-5 py-5">
        <div class="skeleton h-12 w-12 shrink-0 rounded-full"></div>
        <div class="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
          <div class="skeleton h-4 w-44 rounded"></div>
          <div class="skeleton h-4 w-3/5 rounded"></div>
          <div class="skeleton mt-1 h-3 w-24 rounded"></div>
        </div>
        <div class="skeleton h-[72px] w-32 shrink-0 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(true);

</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, rgb(244 244 245) 25%, rgb(228 228 231) 37%, rgb(244 244 245) 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

:global(.dark) .skeleton {
  background: linear-gradient(90deg, rgb(39 39 42) 25%, rgb(63 63 70) 37%, rgb(39 39 42) 63%);
  background-size: 400% 100%;
}

@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>