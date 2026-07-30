<template>
    <div class="size-full px-8 md:px-16 mt-8">
        <div class="flex md:flex-row w-full gap-10 h-full">
            <div class="w-3/4 md:w-3/4 min-w-100"> 
                <div>
                    <h2 class="text-xl font-bold mb-2">{{ videoInfo.title }}</h2>
                    <div class="flex items-center gap-2 mb-2">
                      
                      <!-- 播放量 -->
                      <div class="text-zinc-500 dark:text-zinc-400 text-sm flex items-center gap-0.5">
                        <svg-icon name="play" :height="16" :width="16"></svg-icon>
                        <span>{{ stats?.view }}</span>
                      </div>
                      <!-- 弹幕量 -->
                      <div class="text-zinc-500 dark:text-zinc-400 text-sm flex items-center gap-0.5">
                        <svg-icon name="barrage" :height="16" :width="16" ></svg-icon>
                        <span>{{ stats?.barrage }}</span>
                      </div>
                      <!-- 发布时间 -->
                      <div class="text-zinc-500 dark:text-zinc-400 text-sm">
                        {{ TimeUtil.formatDateTime(videoInfo.publicTime) }}
                      </div>
                    </div>
                </div>
                <video-player 
                    ref="videoPlayerRef"
                    :playUrl="playUrl" 
                    :contentId="aid"
                    @send-barrage="handleSendBarrage"
                ></video-player>
                <video-action :stats="stats" :aid="aid"></video-action>
                <!-- 视频描述 -->
                <div class="video-description mt-4">
                    <p class="text-zinc-700 dark:text-zinc-300">{{ videoInfo.description }}</p>
                </div>
                <!-- tags -->
                <div class="video-tags mt-4">
                    <div 
                      class="bg-white dark:bg-zinc-700 text-zinc-500 dark:text-zinc-300 px-3 py-1 rounded-full text-sm inline-block mr-3 cursor-pointer"
                        v-for="tag in videoInfo.tags" 
                        :key="tag"
                    >
                        {{ tag }}
                    </div>
                </div>
                <!-- 评论区域 -->                
                <comment-card 
                    ref="commentSectionRef"
                    :contentId="aid" 
                    :contentType="1"
                    :ownerId="owner?.uid"
                    :initialCommentId="commentId"
                ></comment-card>

            </div>
            <div class="w-1/4 md:w-1/4">
              <div class="sticky top-12 flex flex-col gap-4">
                <!-- 作者卡片 -->
                <author-card :owner="owner"></author-card>
                  <!-- 弹幕列表 -->
                <barrage-card 
                    :contentId="aid"
                ></barrage-card>
                
              </div>
                
            </div>
        </div>
        
        
    </div>
</template>

<script lang="ts" setup>
import VideoPlayer from "@/components/VideoPlayer/index.vue"    
import CommentCard from "@/components/CommentCard/index.vue"
import VideoAction from "@/components/VideoAction/index.vue"
import AuthorCard from "@/components/AuthorCard/index.vue"
import BarrageCard from "@/components/BarrageCard/index.vue"

import { getVideoInfo } from "@/api/video"

import { computed, onMounted, ref, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { UserInfo } from "@/types/user"
import { useAuthStore } from "@/stores/modules/auth"
import websocketService from '@/utils/websocket'
import type { Barrage, BarrageDTO } from '@/types/barrage'
import type { CommentDTO } from '@/types/comment'
import {  sendBarrage } from '@/api/barrage'
import TimeUtil from "@/utils/TimeUtil"
import SvgIcon from "@/components/SvgIcon.vue"
import { VideoInfo, VideoStat } from "@/types/video"

const route = useRoute()

const authStore = useAuthStore()


const aid = computed(() => {
  return Number(route.path.split('/').filter(Boolean).pop())
})
const commentId = computed(() => {
  const value = Number(route.query.comment);
  return Number.isFinite(value) && value > 0 ? value : undefined;
});
const videoInfo = ref<VideoInfo>({});
const owner = ref<UserInfo>();
const stats = ref<VideoStat>();
const playUrl = ref<string>('');

// WebSocket 相关
const currentVideoRoom = ref<number | null>(null);
const isWebSocketInitialized = ref(false);

// 视频播放器组件引用 
const videoPlayerRef = ref<any>(null);

// 评论区域组件引用
const commentSectionRef = ref<any>(null);

async function getVideo() {
    await getVideoInfo({aid: aid.value}).then((res: any) => {
      if (res.code === 200) {
          videoInfo.value = res.data.video;
          owner.value = res.data.owner;
          stats.value = res.data.stats;
          playUrl.value = res.data.playUrl;
      }
    })
    
}


// 在全局 WebSocket 连接上注册当前页面的事件监听
function initWebSocketListeners() {
  if (isWebSocketInitialized.value) {
    return;
  }

  websocketService.onReceiveBarrage(onReceiveBarrageCallback);
  websocketService.onReceiveComment(onReceiveCommentCallback);
  isWebSocketInitialized.value = true;
}

// 加入视频房间
async function joinVideoRoom(videoAid: number) {
  if (currentVideoRoom.value) {
    websocketService.leaveVideoRoom(currentVideoRoom.value);
  }
  websocketService.joinVideoRoom(videoAid);
  currentVideoRoom.value = videoAid;
}

// 离开视频房间
function leaveVideoRoom() {
if (currentVideoRoom.value) {
  websocketService.leaveVideoRoom(currentVideoRoom.value);
  currentVideoRoom.value = null;
}
}


function onReceiveBarrageCallback(barrage: any) {
  // 使用 BarrageDTO 类型保存 id 信息
  const barrageDTO: BarrageDTO = {
    id: barrage.id,
    aid: barrage.aid,
    uid: barrage.uid,
    text: barrage.text,
    time: barrage.time,
    createTime: barrage.createTime,
    color: barrage.color,
    mode: barrage.mode || 0,
  };
  if(barrageDTO.uid === authStore.userInfo?.uid) {
    // 如果是自己发送的弹幕，直接返回
    return;
  }
  videoPlayerRef.value?.receiveBarrage(barrageDTO); // 调用 VideoPlayer 的方法来接收弹幕

}

  // 实时接收弹幕回调
function onReceiveCommentCallback(comment: CommentDTO) {
  console.log("收到实时评论:", comment);
  // 调用评论组件的方法来接收评论
  if (commentSectionRef.value) {
    commentSectionRef.value.receiveComment(comment);
  }
}

// 处理发送弹幕
async function handleSendBarrage(barrage: Barrage): Promise<boolean> {
  if (!authStore.isAuthenticated) {
    // 处理发送弹幕
    return false;
  }
  
  try {
    const res: any = await sendBarrage({
      aid: aid.value,
      text: barrage.text,
      time: barrage.time,
      color: barrage.color,
      mode: barrage.mode,
    });
    return res?.code === 200;
  } catch (error) {
    console.error("HTTP 发送弹幕失败", error);
    return false;
  }
}

// 监听 aid 变化
watch(aid, async (newAid, oldAid) => {
  if (newAid && newAid !== oldAid) {
    // 监听 aid 变化
    await joinVideoRoom(newAid);
  }
}, { immediate: false });

watch(
  () => authStore.token,
  (token) => {
    if (!token) {
      isWebSocketInitialized.value = false;
      return;
    }

    initWebSocketListeners();
  },
  { immediate: true },
);

onMounted(async () => {
    await getVideo();
    if (aid.value) {
      await joinVideoRoom(aid.value);
    }
});

onBeforeUnmount(() => {
  // 取消监听
  leaveVideoRoom();
  
  // 取消监听
  if (isWebSocketInitialized.value) {
    websocketService.offReceiveBarrage(onReceiveBarrageCallback);
    websocketService.offReceiveComment(onReceiveCommentCallback);
    isWebSocketInitialized.value = false;
    console.log("WebSocket 监听器已取消");
  }
});

</script>

<style lang="scss" scoped>
</style>

