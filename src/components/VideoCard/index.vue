<template>
  <div 
    class="group rounded-lg cursor-pointer" 
    :class="{ 'video-card-interactive': imageLoaded }"
  >
    <router-link :to="`/video/${props.videoItem.aid}`" target="_blank">
      <VideoCardCover
        :videoItem="props.videoItem"
        @loaded="onCoverLoaded"
      />
      <VideoCardInfo
        :videoItem="props.videoItem"
        :hideAuthor="hideAuthor"
      />
    </router-link>
    
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VideoCardCover from './component/VideoCardCover.vue';
import VideoCardInfo from './component/VideoCardInfo.vue';

const props = defineProps<{
  videoItem: any;
  hideAuthor?: boolean;
}>();

const imageLoaded = ref(false);

function onCoverLoaded() {
  imageLoaded.value = true;
}

function goVideoDetail() {
  window.open('/video/' + props.videoItem.aid, '_blank');
}
</script>

<style lang="scss" scoped>
.video-card-interactive {
  position: relative;
  background-color: transparent;
  box-shadow: 0 0 0 0 transparent;
  
  /* 丝滑的过渡动画 */
  transition:
    background-color 0.25s ease,
    box-shadow 0.25s ease;

  /* 解除 paint 限制，允许 box-shadow 顺利向外绘制不被切边 */
  contain: layout style;
  min-width: 0;

  /* 使用 CSS 变量定义浅色模式下的悬浮灰色 */
  --card-hover-fill: rgba(0, 0, 0, 0.1); 
}

/* 自动适配 Tailwind 的 .dark 暗黑模式环境 */
:global(.dark) .video-card-interactive {
  /* 暗黑模式下换成微亮的浅灰色 */
  --card-hover-fill: rgba(255, 255, 255, 0.08); 
}

/* 只有真正的鼠标指针设备才触发（防止手机触屏滑动时误触变灰） */
@media (hover: hover) and (pointer: fine) {
  .video-card-interactive:hover {
    background-color: var(--card-hover-fill);
    box-shadow: 0 0 0 8px var(--card-hover-fill);
  }
}

/* 鼠标按住卡片时的微弱下沉反馈 */
.video-card-interactive:active {
  background-color: var(--card-hover-fill);
  box-shadow: 0 0 0 8px var(--card-hover-fill);
  filter: brightness(0.92);
}
</style>

