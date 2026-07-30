<template>
    <div class="relative flex items-center w-[600px] h-[42px] bg-zinc-100 dark:bg-zinc-800 rounded-full">
      <input
        type="text"
        placeholder="搜索视频、用户..."
        v-model="inputValue"
        @keyup.enter="handleSearch"
        class="w-4/5 h-4/5 ml-1 p-2 border-none outline-none rounded-md bg-transparent focus:text-zinc-500"
      />
      <div 
        class="absolute top-[5px] right-[7px] flex items-center justify-center w-8 h-8 rounded-full cursor-pointer text-zinc-600 transition hover:bg-sky-50 hover:text-sky-500 dark:text-gray-300 dark:shadow-black/30  dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
        @click="handleSearch"
      >
        <svg-icon name="search" :width="16" :height="16"></svg-icon>
      </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const inputValue = ref('');
const router = useRouter();

inputValue.value = router.currentRoute.value.query.keyword as string || '';


function handleSearch() {
  const keyword = inputValue.value.trim();
  if (!keyword) return;
  router.push({ path: '/search', query: { keyword } });
}


</script>

<style lang="scss" scoped>


</style>
