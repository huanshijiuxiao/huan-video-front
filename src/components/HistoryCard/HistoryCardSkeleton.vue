<template>
  <div class="flex relative bg-white dark:bg-zinc-800 rounded-lg p-3 border border-transparent animate-pulse select-none">
    <!-- Cover image skeleton -->
    <div class="relative w-48 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-200 dark:bg-zinc-700">
      <!-- Duration badge skeleton -->
      <div class="absolute bottom-2 right-2 w-10 h-5 rounded bg-zinc-300 dark:bg-zinc-600"></div>
      <!-- Progress bar skeleton -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-zinc-300 dark:bg-zinc-600">
        <div class="h-full w-3/5 bg-zinc-400 dark:bg-zinc-500 rounded"></div>
      </div>
    </div>

    <!-- Info section skeleton -->
    <div class="flex-1 ml-4 flex flex-col justify-between min-w-0">
      <div>
        <!-- Title skeleton -->
        <div class="space-y-2 mb-3">
          <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-11/12"></div>
          <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
        </div>

        <!-- Author & watch time skeleton -->
        <div class="flex items-center gap-3 mb-3">
          <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-20"></div>
          <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-24"></div>
        </div>

        <!-- Progress info skeleton -->
        <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-16"></div>
      </div>

      <!-- Action buttons skeleton -->
      <div class="flex items-center gap-3 mt-2">
        <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-20"></div>
        <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-12"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>
