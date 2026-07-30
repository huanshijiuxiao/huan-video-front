<template>
  <div class="h-full overflow-y-auto rounded border border-white/80 bg-white/90 text-zinc-600 shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-300 dark:shadow-black/30">
    <div v-if="loading && replies.length === 0" class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <div v-for="index in 5" :key="index" class="flex gap-4 px-5 py-5">
        <div class="skeleton h-12 w-12 shrink-0 rounded-full"></div>
        <div class="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
          <div class="skeleton h-4 w-40 rounded"></div>
          <div class="skeleton h-4 w-3/5 rounded"></div>
          <div class="skeleton h-3 w-24 rounded"></div>
        </div>
        <div class="skeleton h-[72px] w-40 shrink-0 rounded max-[720px]:w-28"></div>
      </div>
    </div>

    <div
      v-else-if="loadError && replies.length === 0"
      class="flex h-full min-h-64 flex-col items-center justify-center px-5 text-center text-zinc-400 dark:text-zinc-500"
    >
      <el-icon :size="36"><WarningFilled /></el-icon>
      <span class="mt-3 text-sm">{{ loadError }}</span>
      <button
        class="mt-4 rounded border border-zinc-200 px-4 py-1.5 text-sm text-zinc-600 transition-colors hover:border-sky-400 hover:text-sky-500 dark:border-zinc-700 dark:text-zinc-300"
        @click="loadReplies(true)"
      >
        重新加载
      </button>
    </div>

    <div
      v-else-if="replies.length === 0"
      class="flex h-full min-h-64 flex-col items-center justify-center text-zinc-400 dark:text-zinc-500"
    >
      <SvgIcon name="empty-like" :width="72" :height="72" />
      <span class="mt-3 text-sm">暂时没有收到回复</span>
    </div>

    <template v-else>
      <div class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <article
          v-for="reply in replies"
          :key="reply.id"
          class="relative flex min-h-[112px] gap-4 px-5 py-5 transition-colors"
          :class="canOpen(reply) ? 'cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30' : ''"
          @click="openReply(reply)"
        >
          <span v-if="!reply.isRead" class="absolute left-2.5 top-7 h-1.5 w-1.5 rounded-full bg-sky-500" title="未读"></span>

          <button
            class="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-zinc-100 text-left shadow-sm dark:border-zinc-900 dark:bg-zinc-800"
            :class="reply.user?.uid ? 'cursor-pointer' : 'cursor-default'"
            :title="reply.user?.uid ? `访问 ${displayName(reply)} 的主页` : displayName(reply)"
            @click.stop="openUser(reply)"
          >
            <img
              v-if="reply.user?.avatar"
              :src="reply.user.avatar"
              :alt="`${displayName(reply)}的头像`"
              class="h-full w-full object-cover"
            />
            <span v-else class="flex h-full w-full items-center justify-center text-base font-semibold text-zinc-400">
              {{ displayName(reply).slice(0, 1) }}
            </span>
          </button>

          <div class="min-w-0 flex-1 py-0.5 flex flex-col gap-2.5">
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <button
                class="max-w-40 truncate text-sm font-semibold text-zinc-800 hover:text-sky-500 dark:text-zinc-100 dark:hover:text-sky-400"
                :class="reply.user?.uid ? 'cursor-pointer' : 'cursor-default'"
                @click.stop="openUser(reply)"
              >
                {{ displayName(reply) }}
              </button>
              <span class="text-sm text-zinc-500 dark:text-zinc-400">{{ actionText(reply.actionType) }}</span>
            </div>

            <p class="line-clamp-2 break-words text-sm leading-5 text-zinc-700 dark:text-zinc-200">
              {{ reply.content || '该回复已失效' }}
            </p>

            <div class="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <SvgIcon name="comment" :width="14" :height="14" class="text-sky-400" />
              <time :datetime="reply.createTime">{{ TimeUtil.formatDateTimeChinese(reply.createTime) }}</time>
            </div>
          </div>

          <div class="ml-2 w-40 shrink-0 self-center max-[720px]:w-28">
            <div
              v-if="reply.actionType === 'video_comment'"
              class="relative flex aspect-video items-center overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800"
              :title="reply.previewTitle || '我的视频'"
            >
              <img
                v-if="reply.previewCover && !failedCoverIds.has(reply.id)"
                :src="reply.previewCover"
                :alt="reply.previewTitle || '视频封面'"
                class="h-full w-full object-cover"
                @error="markCoverFailed(reply.id)"
              />
              <div v-else class="flex h-full w-full items-center gap-2 bg-gradient-to-br from-sky-50 to-indigo-50 px-3 text-zinc-500 dark:from-zinc-800 dark:to-zinc-800/60 dark:text-zinc-300">
                <SvgIcon name="comment" :width="20" :height="20" class="shrink-0 text-sky-400" />
                <span class="line-clamp-2 text-xs leading-5">{{ reply.previewTitle || '视频已失效' }}</span>
              </div>
              <div
                v-if="reply.previewCover && !failedCoverIds.has(reply.id)"
                class="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-1 text-xs text-white"
              >
                {{ reply.previewTitle }}
              </div>
            </div>

            <div v-else class="flex min-h-[72px] items-center rounded bg-zinc-50 px-3 text-xs leading-5 text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-400">
              <p class="line-clamp-3 break-words">{{ reply.previewContent || '原评论已失效' }}</p>
            </div>
          </div>
        </article>
      </div>

      <div class="flex min-h-14 items-center justify-center border-t border-zinc-100 text-sm dark:border-zinc-800">
        <button
          v-if="hasMore"
          class="rounded px-4 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-sky-500 disabled:cursor-wait disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-800"
          :disabled="loading"
          @click="loadReplies(false)"
        >
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
        <span v-else class="text-xs text-zinc-400 dark:text-zinc-600">没有更多了</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { WarningFilled } from '@element-plus/icons-vue';
import TimeUtil from '@/utils/TimeUtil';
import type { NotificationActionType, NotificationItem } from '@/types/notification';
import { useNotificationStore } from '@/stores/modules/notification';

const PAGE_SIZE = 20;
const router = useRouter();
const notificationStore = useNotificationStore();
const { lists, loading: loadingMap, hasMore: hasMoreMap } = storeToRefs(notificationStore);
const loadError = ref('');
const failedCoverIds = ref(new Set<number>());

const replies = computed(() => lists.value.reply);
const loading = computed(() => loadingMap.value.reply);
const hasMore = computed(() => hasMoreMap.value.reply);

function displayName(item: NotificationItem) {
  return item.user?.nickname || item.user?.username || '未知用户';
}

function actionText(actionType: NotificationActionType) {
  return actionType === 'comment_reply' ? '回复了我的评论' : '评论了我的视频';
}

function canOpen(reply: NotificationItem) {
  return Boolean(
    (reply.actionType === 'video_comment' && reply.targetId)
    || (reply.actionType === 'comment_reply' && reply.previewTargetId),
  );
}

function openUser(reply: NotificationItem) {
  if (reply.user?.uid) router.push(`/space/${reply.user.uid}`);
}

async function openReply(reply: NotificationItem) {
  if (!reply.isRead) await notificationStore.markRead(reply);

  if (reply.actionType === 'video_comment' && reply.targetId) {
    router.push({
      path: `/video/${reply.targetId}`,
      query: reply.subjectId ? { comment: String(reply.subjectId) } : undefined,
    });
    return;
  }

  if (reply.actionType === 'comment_reply' && reply.previewTargetId) {
    router.push({
      path: `/video/${reply.previewTargetId}`,
      query: reply.targetId ? { comment: String(reply.targetId) } : undefined,
    });
  }
}

function markCoverFailed(id: number) {
  failedCoverIds.value = new Set(failedCoverIds.value).add(id);
}

async function loadReplies(reset: boolean) {
  loadError.value = '';
  try {
    await notificationStore.fetchList('reply', reset, PAGE_SIZE);
    if (reset && replies.value.some(item => !item.isRead)) {
      await notificationStore.markAllRead('reply');
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '回复加载失败，请稍后重试';
  }
}

onMounted(() => loadReplies(true));
</script>

<style scoped>
.skeleton {
  background: linear-gradient(90deg, rgb(244 244 245) 25%, rgb(228 228 231) 37%, rgb(244 244 245) 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

:global(.dark) .skeleton {
  background: linear-gradient(90deg, rgb(39 39 42) 25%, rgb(63 63 70) 37%, rgb(39 39 42) 63%);
  background-size: 400% 100%;
}

@keyframes skeleton-loading {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}
</style>
