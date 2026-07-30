<template>
  <div class="video-actions flex items-center space-x-4 py-3 px-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm mt-2">
    <!-- 点赞 -->
    <div class="ml-4 flex items-center hover:text-sky-600 cursor-pointer group" :class="liked ? 'text-sky-600': 'text-zinc-500'" @click="handleLike">
      <svg-icon name="video-like" :height="28" :width="28" class=" group-hover:text-sky-600"></svg-icon>
      <span class="text-sm text-inherit dark:text-zinc-400 ml-2 group-hover:text-sky-600">{{ props.stats?.like }}</span>
    </div>
    <!-- 投币-->
    <div class="ml-4 flex items-center hover:text-sky-600 cursor-pointer group" :class="coined ? 'text-sky-600': 'text-zinc-500'">
      <svg-icon name="coin" :height="28" :width="28" class=" group-hover:text-sky-600" ></svg-icon>
      <span class="text-sm text-inherit dark:text-zinc-400 ml-2 group-hover:text-sky-600">{{ props.stats?.coin }}</span>
    </div>
    <!-- 收藏 -->
    <div class="ml-4 flex items-center hover:text-sky-600 cursor-pointer group" :class="favorited ? 'text-sky-600' : 'text-zinc-500'" @click="openFavDialog">
      <svg-icon name="star" :height="28" :width="28" class=" group-hover:text-sky-600"></svg-icon>
      <span class="text-sm text-inherit dark:text-zinc-400 ml-2 group-hover:text-sky-600">{{ props.stats?.favorite }}</span>
    </div>
    <!-- 分享 -->
    <div class="ml-4 flex items-center hover:text-sky-600 cursor-pointergroup text-zinc-500">
      <svg-icon name="share" :height="28" :width="28" class=" group-hover:text-sky-600"></svg-icon>
      <span class="text-sm text-inherit dark:text-zinc-400 ml-2 group-hover:text-sky-60 0">{{ props.stats?.share }}</span>
    </div>

    <!-- 收藏弹窗 -->
    <fav-dialog
        v-model:visible="open"
        :content-id="aid"
        :content-type="1"
        @saved="handleFavSaved"
    />
  </div>
</template>

<script lang="ts" setup>

import { onMounted, ref, PropType, defineAsyncComponent } from 'vue'
import { useAuthStore } from "@/stores/modules/auth"
import { likeAction, hasLike, hasFav, hasCoin } from "@/api/action"
import { VideoStat } from "@/types/videoStat"

const FavDialog = defineAsyncComponent(() => import('@/components/FavDialog/index.vue'))

const authStore = useAuthStore();

const props = defineProps({
  stats: {
    type: Object as PropType<VideoStat | undefined>,
    required: true
  },
  aid: {
    type: Number,
    required: true
  }
})

const open = ref(false);
const liked = ref(false);
const favorited = ref(false);
const coined = ref(false);

function getUserVideoStats(){
  if (authStore.isAuthenticated) {
    hasFav({contentId: props.aid, contentType: 1}).then((res: any) => {
      if (res.code === 200) {
        favorited.value = res.data ?? false;
      }
    })
    hasLike({contentId: props.aid, contentType: 1}).then((res: any) => {
      if (res.code === 200) {
        liked.value = res.data ?? false;
      }
    })
    hasCoin({contentId: props.aid, contentType: 1}).then((res: any) => {
      if (res.code === 200) {
        coined.value = res.data ?? false;
      }
    })
  }
}

function openFavDialog() {
  if (!authStore.isAuthenticated) {
    authStore.loginDialogShown();
    return;
  }
  open.value = true;
}

function handleLike() {
  if (!authStore.isAuthenticated) {
    authStore.loginDialogShown();
    return;
  }
  
  likeAction({contentId: props.aid, contentType: 1, like: liked.value ? 0 : 1}).then((res: any) => {
    if (res.code === 200) {
      liked.value = !liked.value;
      if(props.stats?.like || props.stats?.like === 0) {
        props.stats.like += liked.value ? 1 : -1;
      }
    }
  })
}


function handleFavSaved(status: boolean) {
  if (favorited.value && !status) {
    // 取消收藏
    if(props.stats?.favorite || props.stats?.favorite === 0) {
      props.stats.favorite -= 1;
    }
  } else if (!favorited.value && status) {
    // 收藏
    if(props.stats?.favorite || props.stats?.favorite === 0) {
      props.stats.favorite += 1;
    }
  }
  favorited.value = status;
}

onMounted(() => {
    getUserVideoStats();
})

</script>

<style lang="scss" scoped>

</style>
