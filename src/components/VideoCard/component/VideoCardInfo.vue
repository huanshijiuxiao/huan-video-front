<template>
  <div class="w-full mt-4 flex flex-col justify-between gap-1 items-start">
    <!-- 信息区域骨架屏 -->
    <template v-if="!avatarLoaded && !props.hideAuthor">
      <div class="w-full animate-pulse select-none">
        <!-- 标题骨架 -->
        <div class="space-y-2">
          <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-11/12"></div>
          <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
        </div>
        <!-- 底部作者 + 发布时间骨架 -->
        <div class="flex flex-row gap-2 mt-4">
          <div v-if="!hideAuthor" class="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0"></div>
          <div class="flex flex-col justify-center gap-1.5 w-full">
            <div v-if="!hideAuthor" class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-3/5"></div>
            <div class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    </template>
    <!-- 真实内容 -->
    <div v-show="avatarLoaded || props.hideAuthor" class="w-full flex flex-col justify-between gap-1 items-start">
      <div class="w-full flex-1 keep-two-lines " :title="props.videoItem.title">
        <div class="line-clamp-2 text-base leading-snug">
          <span >{{ props.videoItem.title }}</span>
        </div>
      </div>

      <div class="flex flex-row gap-2">
        <router-link
          v-if="!hideAuthor"
          :to="`/space/${props.videoItem.owner.uid}`"
          target="_blank"
        >
          <img
            :src="props.videoItem.owner.avatar"
            :alt="props.videoItem.owner.nickname"
            class="w-10 h-10 rounded-full object-cover"
            @load="onAvatarLoaded"
          >
        </router-link>
        <div class="flex flex-col justify-center gap-1.5">
          <div class="text-sm text-zinc-500 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-500 cursor-pointer">
            <router-link
              v-if="!hideAuthor"
              :to="`/space/${props.videoItem.owner.uid}`"
              target="_blank"
            >
              {{ props.videoItem.owner.nickname }}
            </router-link>
          </div>
          
          <div class="text-xs text-zinc-400 dark:text-zinc-500 rounded">
            {{ TimeUtil.timeAgo(props.videoItem.publicTime) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import TimeUtil from '@/utils/TimeUtil';
import { ref } from 'vue';

const props = defineProps<{
  videoItem: any;
  hideAuthor?: boolean;
}>();

const avatarLoaded = ref(false);

function onAvatarLoaded() {
  avatarLoaded.value = true;
}

function goPersonalSpace(uid: number) {
  window.open('/space/' + uid, '_blank');
}
</script>
<style lang="scss" scoped>
.keep-two-lines {
  display: block;
  min-height: calc( var(--text-base--line-height) * 2em);
}
</style>
