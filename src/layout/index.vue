
<template>
  <div class="size-full">
    <div class="flex flex-col size-full">
      <header class="relative z-50 w-full bg-white dark:bg-black shadow-sm">
        <LayoutNav
          :show-sidebar-trigger="!showSidebar"
          @open-sidebar="overlaySidebarOpen = true"
        />
      </header>
      <div class="flex flex-1 overflow-hidden"  >
        <!-- 在小屏幕上宽度减小 -->
        <aside class="w-[72px] md:w-[72px] bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0" v-if="showSidebar">
          <LayoutAside />
        </aside>
        
        <main class="app-scroll-container flex-1 bg-zinc-100 dark:bg-zinc-800 overflow-auto">
          <div class="m-auto w-7/8">
            <RouterView />
          </div>
        </main>
      </div>

      <Transition name="sidebar-overlay">
        <div
          v-if="!showSidebar && overlaySidebarOpen"
          class="fixed inset-x-0 bottom-0 top-14 z-40"
        >
          <button
            type="button"
            class="absolute inset-0 size-full bg-black/30 cursor-default"
            aria-label="关闭侧边栏"
            @click="overlaySidebarOpen = false"
          ></button>
          <aside class="sidebar-overlay-panel absolute inset-y-0 left-0 w-[72px] bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800 shadow-xl">
            <LayoutAside @navigate="overlaySidebarOpen = false" />
          </aside>
        </div>
      </Transition>
    </div>
  </div>
</template>
<script setup lang="ts">
import LayoutNav from './components/LayoutNav.vue'
import LayoutAside from './components/LayoutAside.vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';


const route = useRoute();
const overlaySidebarOpen = ref(false);

const showSidebar = computed(() => route.meta.showSidebar !== undefined ? route.meta.showSidebar : true);

const closeOverlayOnEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    overlaySidebarOpen.value = false;
  }
};

onMounted(() => window.addEventListener('keydown', closeOverlayOnEscape));
onBeforeUnmount(() => window.removeEventListener('keydown', closeOverlayOnEscape));

watch(() => route.fullPath, () => {
  overlaySidebarOpen.value = false;
});

</script>
<style lang="scss" scoped>
.el-main{
  padding: 0 8px;
}

.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity 180ms ease;
}

.sidebar-overlay-enter-active .sidebar-overlay-panel,
.sidebar-overlay-leave-active .sidebar-overlay-panel {
  transition: transform 180ms ease;
}

.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}

.sidebar-overlay-enter-from .sidebar-overlay-panel,
.sidebar-overlay-leave-to .sidebar-overlay-panel {
  transform: translateX(-100%);
}
</style>
