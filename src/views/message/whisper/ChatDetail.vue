
<template>
  <div v-if="chatUser" class="h-full flex flex-col bg-white/70 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-200">
    <!-- 聊天头部 -->
    <div class="h-12 flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/40 text-sm font-semibold text-zinc-700 dark:text-zinc-100 shrink-0">
      {{ chatUser.nickname }}
    </div>

    <!-- 消息列表 -->
    <div
      ref="messageContainer"
      class="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-300 bg-zinc-50/50 dark:bg-zinc-950/30"
      @scroll="onScroll"
    >
      <div v-if="loadingMore" class="flex justify-center py-3 text-zinc-400 dark:text-zinc-500"><Loading color="#409eff" scale="0.7" /></div>
      <div v-if="!hasMore && messages.length > 0" class="text-center text-zinc-400 dark:text-zinc-500 text-xs py-2">没有更多消息了</div>
      <div v-if="messages.length === 0 && !loadingMore" class="flex items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm">
        暂无消息，发送第一条消息吧
      </div>
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex"
        :class="msg.senderId === currentUserId ? 'justify-end' : 'justify-start'"
      >
        <div class="max-w-[70%]">
          <div
            class="px-3 py-2 rounded-lg text-sm break-words"
            :class="msg.senderId === currentUserId
              ? 'bg-sky-500 dark:bg-sky-600 text-white rounded-br-sm'
              : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-700 rounded-bl-sm'"
          >
            <span v-if="msg.isRecalled === 1" class="italic text-xs" :class="msg.senderId === currentUserId ? 'text-zinc-200 dark:text-zinc-300 ' : 'text-zinc-500 dark:text-zinc-600'">
              {{ msg.senderId === currentUserId ? '你撤回了一条消息' : '对方撤回了一条消息' }}
            </span>
            <span v-else>{{ msg.content }}</span>
          </div>
          <div class="flex items-center mt-0.5" :class="msg.senderId === currentUserId ? 'justify-end' : 'justify-start'">
            <span class="text-[10px] text-zinc-400 dark:text-zinc-500">{{ formatTime(msg.sendTime) }}</span>
            <button
              v-if="msg.senderId === currentUserId && msg.isRecalled === 0 && canRecall(msg.sendTime)"
              class="text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-red-400 dark:hover:text-red-300 ml-2"
              @click="handleRecall(msg.id)"
            >
              撤回
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="shrink-0 border-t border-zinc-200 dark:border-zinc-800 p-3 bg-white dark:bg-zinc-950/60">
      <div class="flex items-end gap-2">
        <el-input
          v-model="inputText"
          type="textarea"
          :rows="2"
          placeholder="输入消息..."
          :disabled="sending"
          @keydown.enter.exact="handleSend"
          resize="none"
        />
        <el-button type="primary" :loading="sending" @click="handleSend" :disabled="!inputText.trim()">
          发送
        </el-button>
      </div>
    </div>
  </div>
  <div v-else class="w-full h-full flex justify-center items-center flex-col overflow-hidden select-none bg-white/70 dark:bg-zinc-900/60">
    <div class="w-[402px] h-[204px] mb-8 bg-no-repeat bg-[url('~assets/img/bilibili/no_message.png')] bg-[length:402px_204px] opacity-90 dark:opacity-60"></div>
    <div class="text-[#8896b8] dark:text-zinc-500 text-sm leading-6">快找小伙伴聊天吧 ( ゜- ゜)つロ</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue';
import { useAuthStore } from '@/stores/modules/auth';
import { useChatStore } from '@/stores/modules/chat';
import { getChatMessages, sendMessage as apiSendMessage, recallMessage as apiRecallMessage, markChatRead } from '@/api/message';
import Loading from '@/components/Loading/index.vue';

const props = defineProps<{
  chatUser: { uid: number; nickname: string; avatarUrl: string } | null;
}>();

const emit = defineEmits<{
  (e: 'message-sent', msg: any): void;
  (e: 'message-recalled', msgId: number): void;
}>();

const authStore = useAuthStore();
const chatStore = useChatStore();
const currentUserId = computed(() => authStore.userInfo?.uid ?? 0);

const messages = ref<any[]>([]);
const inputText = ref('');
const sending = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const offset = ref(0);
const messageContainer = ref<HTMLElement | null>(null);
const isLoadingMessages = ref(false);

// 加载消息
async function loadMessages(userId: number, reset = false) {
  if (isLoadingMessages.value) return;
  isLoadingMessages.value = true;
  loadingMore.value = !reset;

  try {
    const res: any = await getChatMessages(userId, reset ? 0 : offset.value);
    if (res.code === 200) {
      const data = res.data;
      if (reset) {
        messages.value = data.list || [];
        offset.value = (data.list || []).length;
      } else {
        // 加载历史消息（往前追加）
        const oldHeight = messageContainer.value?.scrollHeight || 0;
        messages.value = [...(data.list || []), ...messages.value];
        offset.value += (data.list || []).length;
        // 保持滚动位置
        nextTick(() => {
          if (messageContainer.value) {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight - oldHeight;
          }
        });
      }
      hasMore.value = data.more !== false;
    }
  } catch (e) {
    console.error('加载消息失败:', e);
  } finally {
    isLoadingMessages.value = false;
    loadingMore.value = false;
  }
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
    }
  });
}

// 滚动加载历史
function onScroll() {
  const el = messageContainer.value;
  if (!el || !hasMore.value || loadingMore.value) return;
  if (el.scrollTop < 50) {
    loadMessages(props.chatUser!.uid);
  }
}

// 发送消息
async function handleSend(e?: KeyboardEvent) {
  if (e) {
    if (e.shiftKey) return;
    e.preventDefault();
  }
  const text = inputText.value.trim();
  if (!text || !props.chatUser || sending.value) return;

  sending.value = true;
  try {
    const res: any = await apiSendMessage({
      receiverId: props.chatUser.uid,
      content: text,
    });
    if (res.code === 200) {
      const newMsg = res.data;
      messages.value.push(newMsg);
      inputText.value = '';
      scrollToBottom();
      emit('message-sent', newMsg);
    }
  } catch (e) {
    console.error('发送消息失败:', e);
  } finally {
    sending.value = false;
  }
}

// 撤回消息
async function handleRecall(messageId: number) {
  try {
    const res: any = await apiRecallMessage(messageId);
    if (res.code === 200) {
      const msg = messages.value.find(m => m.id === messageId);
      if (msg) {
        msg.isRecalled = 1;
      }
      emit('message-recalled', messageId);
    }
  } catch (e) {
    console.error('撤回失败:', e);
  }
}

// 检查是否可以撤回（2分钟内）
function canRecall(sendTime: string): boolean {
  const now = Date.now();
  const send = new Date(sendTime).getTime();
  return (now - send) < 2 * 60 * 1000;
}

// 格式化时间
function formatTime(time: string): string {
  if (!time) return '';
  const d = new Date(time);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (isToday) return timeStr;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `昨天 ${timeStr}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`;
}

// 监听目标用户变化，重新加载消息
watch(
  () => props.chatUser?.uid,
  async (newUid) => {
    if (newUid) {
      offset.value = 0;
      hasMore.value = true;
      messages.value = [];
      await loadMessages(newUid, true);
      scrollToBottom();
      void markChatRead(newUid);
    } else {
      messages.value = [];
    }
  },
  { immediate: true },
);

// 添加外部消息（当接收到实时消息时由父组件调用）
function addMessage(msg: any) {
  if (props.chatUser && (msg.senderId === props.chatUser.uid || msg.receiverId === props.chatUser.uid)) {
    messages.value.push(msg);
    scrollToBottom();
  }
}


watch(
  () => chatStore.latestPrivateMessage,
  (message) => {
    if (message) handleNewMessage(message);
  },
  { flush: 'post' },
);

function handleNewMessage(msg: any) {
  console.log('收到新消息:', msg);
  if (!props.chatUser) return;
  if (msg.senderId === props.chatUser.uid || (msg.senderId !== currentUserId.value && msg.receiverId === props.chatUser.uid)) {
    const exists = messages.value.some(m => m.id === msg.id);
    if (!exists) {
      messages.value.push(msg);
      scrollToBottom();
    }
  }
}
defineExpose({ addMessage });
</script>

<style scoped>
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

:deep(.el-textarea__inner) {
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

:global(.dark) :deep(.el-textarea__inner) {
  background-color: #111827;
  border-color: #374151;
  color: #f3f4f6;
  box-shadow: 0 0 0 1px #374151 inset;
}

:global(.dark) :deep(.el-textarea__inner::placeholder) {
  color: #6b7280;
}
</style>
