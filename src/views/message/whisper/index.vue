<template>
  <div class="h-full">
    <div class="flex h-full text-xs text-zinc-600 dark:text-zinc-300 bg-white/90 dark:bg-zinc-900/90 border border-white/80 dark:border-zinc-800 rounded shadow-md dark:shadow-black/30 overflow-hidden">
      <!-- 左侧聊天列表 -->
      <div class="w-60 border-r border-zinc-200 dark:border-zinc-800 relative bg-white/80 dark:bg-zinc-950/40">
        <div class="pl-6 leading-9 h-9 border-b border-zinc-200 dark:border-zinc-800 select-none overflow-hidden text-zinc-600 dark:text-zinc-300">
          <span>最近消息</span>
        </div>
        <div id="chat-list" class="h-[calc(100%-36px)] relative overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-thumb-rounded">
          <div class="list">
            <div
              v-for="item in chatStore.sortedChatList"
              :key="item.user.uid"
              class="w-full flex flex-row items-center p-5 pl-8 relative overflow-hidden cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 group transition-colors"
              :class="{ 'bg-zinc-200 dark:bg-zinc-800/80': chatStore.chatId === item.user.uid }"
              @click="changeChat(item.user.uid)"
            >
              <!-- 删除图标 -->
              <div
                class="hidden text-zinc-400 dark:text-zinc-500 group-hover:flex group-hover:text-zinc-600 dark:group-hover:text-zinc-300 absolute top-50% left-3 ease-out transition-all duration-200 "
                @click.stop="closeChat(item.user.uid)"
              >
                <svg-icon name="close" :width="16" :height="16"></svg-icon>              
              </div>
              <!-- 头像和昵称 -->
              <div class="w-10 h-10 mr-2 flex-shrink-0 relative">
                <img
                  :src="item.user.avatarUrl || ''"
                  class="w-full h-full rounded-full object-cover"
                  alt="avatar"
                />
              </div>
              <div class="flex flex-col justify-center min-w-0">
                <div class="overflow-hidden whitespace-nowrap text-ellipsis text-zinc-800 dark:text-zinc-100 text-sm leading-none">
                  {{ item.user.nickname }}
                </div>
                <div class="overflow-hidden whitespace-nowrap text-ellipsis text-zinc-400 dark:text-zinc-500 py-2 -mb-1.5" v-if="item.detail.list.length > 0">
                  {{ item.detail.list[item.detail.list.length - 1]?.withdraw === 1
                    ? `${item.detail.list[item.detail.list.length - 1].senderId === currentUserId ? '你' : '对方'}撤回了一条消息`
                    : item.detail.list[item.detail.list.length - 1]?.content || '' }}
                </div>
              </div>
              <div
                v-if="item.chat.unread > 0"
                class="absolute top-5 right-2 text-center text-white text-xs leading-4 h-4 min-w-4 rounded-full bg-red-500 px-1"
              >
                {{ item.chat.unread > 99 ? '99+' : item.chat.unread }}
              </div>
            </div>
            <div v-if="chatStore.chatList.length === 0 && !loading" class="text-center text-zinc-400 dark:text-zinc-500 py-8 text-sm">
              暂无聊天记录
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧聊天内容区 -->
      <div class="flex-1">
        <ChatDetail ref="chatDetailRef" :chat-user="currentChatUser" @message-sent="onMessageSent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/modules/auth';
import { useChatStore } from '@/stores/modules/chat';
import { getRecentChatList, createChat, deleteChat, markChatRead } from '@/api/message';
import ChatDetail from './ChatDetail.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const chatStore = useChatStore();
const chatDetailRef = ref<InstanceType<typeof ChatDetail> | null>(null);

const currentUserId = computed(() => authStore.userInfo?.uid ?? 0);
const loading = ref(false);

const currentChatUser = computed(() => {
  if (chatStore.chatId <= 0) return null;
  const item = chatStore.chatList.find(c => c.user.uid === chatStore.chatId);
  return item ? item.user : null;
});

async function fetchList() {
  if (loading.value) return;
  loading.value = true;
  try {
    const res: any = await getRecentChatList();
    if (res.code === 200) {
      chatStore.chatList = res.data.list || [];
    }
  } catch (e) {
    console.error('获取聊天列表失败:', e);
  } finally {
    loading.value = false;
  }
}

async function changeChat(uid: number) {
  if (chatStore.chatId === uid) return;
  chatStore.chatId = uid;
  await markChatRead(uid);
  const item = chatStore.chatList.find(c => c.user.uid === uid);
  if (item) {
    item.chat.unread = 0;
  }
}

async function createNewChat(userId: number) {
  try {
    const res: any = await createChat(userId);
    if (res.code === 200) {
      if (res.data) {
        const exists = chatStore.chatList.some(c => c.user.uid === res.data.user.uid);
        if (!exists) {
          chatStore.chatList.unshift(res.data);
        }
      }
      chatStore.chatId = userId;
    }
  } catch (e) {
    console.error('创建聊天失败:', e);
    chatStore.chatId = -1;
  }
}

async function closeChat(uid: number) {
  const i = chatStore.chatList.findIndex((item: any) => item.user.uid === uid);
  if (i !== -1) {
    chatStore.chatList.splice(i, 1);
  }
  if (chatStore.chatId === uid) {
    chatStore.chatId = chatStore.chatList.length > 0 ? chatStore.chatList[0].user.uid : -1;
  }
  try {
    await deleteChat(uid);
  } catch (e) {
    console.error('删除聊天失败:', e);
  }
}

function onMessageSent(msg: any) {
  const item = chatStore.chatList.find(c => c.user.uid === msg.receiverId || c.user.uid === msg.senderId);
  if (item) {
    if (item.detail.list.length > 0) {
      item.detail.list[item.detail.list.length - 1] = msg;
    } else {
      item.detail.list.push(msg);
    }
    item.chat.lastMessageTime = new Date(msg.sendTime).getTime();
  }
}

watch(
  () => route.params.mid,
  async (mid) => {
    if (mid && mid !== ':id') {
      const uid = Number(mid);
      if (uid > 0) {
        await createNewChat(uid);
      }
    }
  },
  { immediate: true }
);

onMounted(async () => {
  chatStore.isChatPage = true;
  await fetchList();
  // if (chatStore.chatId <= 0 && chatStore.chatList.length > 0) {
  //   chatStore.chatId = chatStore.chatList[0].user.uid;
  // }
});

onBeforeUnmount(() => {
  chatStore.isChatPage = false;
});
</script>

<style scoped>
.w-60 {
  min-width: 240px;
}
.scrollbar-thin::-webkit-scrollbar {
  width: 4px;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
:global(.dark) .scrollbar-thin::-webkit-scrollbar-thumb {
  background: #4b5563;
}
</style>
