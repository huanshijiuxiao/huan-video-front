
<template>
  <div class="size-full">
    <div class="flex flex-col size-full ">
      <header class="relative z-50 w-full bg-white/80 dark:bg-black/20 shadow-sm">
        <PlatformNav />
      </header>
      <div class="flex flex-1 overflow-hidden"  >
        <!-- 在小屏幕上宽度减小 -->
        <aside class="w-50 bg-white/80 dark:bg-black/20 border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0" v-if="showSidebar">
          <PlatformAside />
        </aside>
        
        <main class="app-scroll-container flex-1 overflow-auto max-w-7xl mx-auto my-8 px-4 sm:px-2 lg:px-4 py-2 sm:py-6 bg-white/80 dark:bg-black/20 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700">
          <RouterView :key="route.fullPath" />
        </main>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import PlatformNav from './components/PlatformNav.vue'
import PlatformAside from './components/PlatformAside.vue'
import { computed } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();

const showSidebar = computed(() => route.meta.showSidebar !== undefined ? route.meta.showSidebar : true);

</script>
<style lang="scss" scoped>
.el-main{
  padding: 0 8px;
}
</style>
