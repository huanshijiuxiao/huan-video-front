<template>
  <span
    class="loading"
    :style="{ '--loading-color': color, '--loading-scale': scale }"
    role="status"
    aria-label="加载中"
  />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string
    scale?: number
  }>(),
  {
    color: 'currentColor',
    scale: 1,
  },
)
</script>

<style scoped>
.loading {
  --loading-width: calc(6px * var(--loading-scale));
  --loading-height: calc(10px * var(--loading-scale));
  display: block;
  position: relative;
  width: var(--loading-width);
  height: var(--loading-height);
  color: var(--loading-color);
  background-color: currentColor;
  animation: rectangle 1s ease-in-out -0.2s infinite;
}

.loading::before,
.loading::after {
  position: absolute;
  width: var(--loading-width);
  height: var(--loading-height);
  content: "";
  background-color: currentColor;
}

.loading::before {
  left: calc(-14px * var(--loading-scale));
  animation: rectangle 1s ease-in-out -0.4s infinite;
}

.loading::after {
  right: calc(-14px * var(--loading-scale));
  animation: rectangle 1s ease-in-out infinite;
}

@keyframes rectangle {
  0%,
  80%,
  100% {
    height: calc(20px * var(--loading-scale));
    box-shadow: 0 0 currentColor;
  }

  40% {
    height: calc(30px * var(--loading-scale));
    box-shadow: 0 calc(-20px * var(--loading-scale)) currentColor;
  }
}
</style>
