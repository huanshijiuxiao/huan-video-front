<template>
  <div class="rounded-lg overflow-hidden relative">
    <!-- 封面骨架屏 -->
    <div
      v-if="!imageLoaded"
      class="w-full aspect-video bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse select-none"
    ></div>
    <!-- 真实内容 -->
    <div v-show="imageLoaded">
      <img
        :src="props.videoItem.picture"
        :alt="props.videoItem.title"
        class="w-full h-full object-cover aspect-video"
        @load="onImageLoad"
      >
      <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent"></div>
      <div class="absolute right-0 bottom-0 flex justify-between items-center w-full text-white text-sm px-2 py-1">
        <div class="flex items-center gap-2">
          <span class="flex items-center gap-0.5">
            <svg-icon name="play" :height="16" :width="16"></svg-icon>
            <span>{{ NumberUtil.formatCount(props.videoItem.stat?.view || 0) }}</span>
          </span>
          <span class="flex items-center gap-0.5">
            <svg-icon name="barrage" :height="16" :width="16"></svg-icon>
            <span>{{ NumberUtil.formatCount(props.videoItem.stat?.barrage || 0) }}</span>
          </span>
          <span class="flex items-center justify-center gap-0.5">
            <svg-icon name="like" :height="16" :width="16" ></svg-icon>
            <span>{{ NumberUtil.formatCount(props.videoItem.stat?.like || 0) }}</span>
          </span>
        </div>
        <div>
          {{ TimeUtil.formatDuration(props.videoItem.duration) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TimeUtil from '@/utils/TimeUtil';
import NumberUtil from '@/utils/NumberUtil';

const props = defineProps<{
  videoItem: any;
}>();

const emit = defineEmits<{
  (e: 'loaded'): void;
}>();

const imageLoaded = ref(false);

function onImageLoad() {
  imageLoaded.value = true;
  emit('loaded');
}
</script>
