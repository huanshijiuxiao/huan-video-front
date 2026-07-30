<template>
  <Transition name="back-top-fade">
    <button
      v-show="visible"
      type="button"
      class="fixed bottom-24 right-8 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg shadow-gray-900/10 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:shadow-black/30 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
      aria-label="回到顶部"
      title="回到顶部"
      @click="scrollToTop"
    >
      <el-icon :size="20">
        <ArrowUpBold />
      </el-icon>
    </button>
  </Transition>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowUpBold } from "@element-plus/icons-vue";

const route = useRoute();
const visible = ref(true);
let scrollTarget: HTMLElement | Window | null = null;

function findScrollTarget(): HTMLElement | Window {
  return document.querySelector<HTMLElement>(".app-scroll-container") ?? window;
}

function getScrollTop(target: HTMLElement | Window) {
  return target === window ? window.scrollY : (target as HTMLElement).scrollTop;
}

function updateVisible() {
  if (!scrollTarget) {
    visible.value = false;
    return;
  }

  visible.value = getScrollTop(scrollTarget) > 240;
}

function removeScrollListener() {
  if (!scrollTarget) {
    return;
  }

  scrollTarget.removeEventListener("scroll", updateVisible);
}

function bindScrollTarget() {
  removeScrollListener();
  scrollTarget = findScrollTarget();
  scrollTarget.addEventListener("scroll", updateVisible, { passive: true });
  updateVisible();
}

function scrollToTop() {
  if (!scrollTarget) {
    return;
  }

  scrollTarget.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

onMounted(() => {
  bindScrollTarget();
});

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    bindScrollTarget();
  }
);

onBeforeUnmount(() => {
  removeScrollListener();
});
</script>

<style scoped>
.back-top-fade-enter-active,
.back-top-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.back-top-fade-enter-from,
.back-top-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
