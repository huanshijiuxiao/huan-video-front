<template>
  <section class="rounded-lg bg-white p-4 dark:bg-zinc-800">
    <div class="mb-4 flex items-center justify-between border-b border-zinc-100 pb-3 dark:border-zinc-700">
      <h2 class="m-0 text-lg font-semibold">{{ title }}</h2>
      <router-link v-if="to" :to="to" class="text-xs text-sky-500 hover:text-sky-600">查看全部</router-link>
    </div>
    <slot />
  </section>
</template>
<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
defineProps<{ title: string; to?: RouteLocationRaw }>()
</script>
