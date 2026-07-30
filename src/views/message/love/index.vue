<template>
  <div class="h-full overflow-y-auto rounded border border-white/80 bg-white/90 text-zinc-600 shadow-md dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-300 dark:shadow-black/30">
    <div v-if="loading && likeGroups.length === 0" class="divide-y divide-zinc-100 dark:divide-zinc-800">
      <div v-for="index in 5" :key="index" class="flex gap-4 px-5 py-5">
        <div class="skeleton h-12 w-12 shrink-0 rounded-full"></div>
        <div class="flex min-w-0 flex-1 flex-col gap-2 py-0.5">
          <div class="skeleton h-4 w-40 rounded"></div>
          <div class="skeleton h-3 w-24 rounded"></div>
        </div>
        <div class="skeleton h-[72px] w-40 shrink-0 rounded max-[720px]:w-28"></div>
      </div>
    </div>

    <div
      v-else-if="loadError && likeGroups.length === 0"
      class="flex h-full min-h-64 flex-col items-center justify-center px-5 text-center text-zinc-400 dark:text-zinc-500"
    >
      <el-icon :size="36"><WarningFilled /></el-icon>
      <span class="mt-3 text-sm">{{ loadError }}</span>
      <button class="mt-4 rounded border border-zinc-200 px-4 py-1.5 text-sm text-zinc-600 transition-colors hover:border-sky-400 hover:text-sky-500 dark:border-zinc-700 dark:text-zinc-300" @click="loadLikes(true)">
        重新加载
      </button>
    </div>

    <div
      v-else-if="likeGroups.length === 0"
      class="flex h-full min-h-64 flex-col items-center justify-center text-zinc-400 dark:text-zinc-500"
    >
      <SvgIcon name="empty-like" :width="72" :height="72" />
      <span class="mt-3 text-sm">暂时还没有收到赞</span>
    </div>

    <template v-else>
      <div class="divide-y divide-zinc-100 dark:divide-zinc-800">
        <article
          v-for="group in likeGroups"
          :key="group.key"
          class="relative flex min-h-[112px] gap-4 px-5 py-5 transition-colors"
          :class="canOpen(group.item) ? 'cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30' : ''"
          @click="openLikeGroup(group)"
        >
          <span v-if="group.items.some(item => !item.isRead)" class="absolute left-2.5 top-7 h-1.5 w-1.5 rounded-full bg-sky-500" title="未读"></span>

          <div class="flex h-12 shrink-0 items-center" :style="{ width: `${48 + Math.min(group.users.length - 1, 2) * 22}px` }">
            <button
              v-for="(userItem, index) in group.users.slice(0, 3)"
              :key="userItem.user?.uid || userItem.id"
              class="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-zinc-100 text-left shadow-sm dark:border-zinc-900 dark:bg-zinc-800"
              :class="userItem.user?.uid ? 'cursor-pointer hover:z-10' : 'cursor-default'"
              :style="{ marginLeft: index === 0 ? '0' : '-26px', zIndex: 3 - index }"
              :title="userItem.user?.uid ? `访问 ${displayName(userItem)} 的主页` : displayName(userItem)"
              @click.stop="openUser(userItem)"
            >
              <img
                v-if="userItem.user?.avatar"
                :src="userItem.user.avatar"
                :alt="`${displayName(userItem)}的头像`"
                class="h-full w-full object-cover"
              />
              <span v-else class="flex h-full w-full items-center justify-center text-base font-semibold text-zinc-400">
                {{ displayName(userItem).slice(0, 1) }}
              </span>
              <span v-if="index === 2 && group.users.length > 3" class="absolute inset-0 flex items-center justify-center bg-black/55 text-xs font-semibold text-white">
                +{{ group.users.length - 3 }}
              </span>
            </button>
          </div>

          <div class="min-w-0 flex-1 py-0.5 flex flex-col gap-2.5">
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <template v-for="(userItem, index) in group.users.slice(0, 2)" :key="userItem.user?.uid || userItem.id">
                <button
                  class="max-w-32 truncate text-sm font-semibold text-zinc-800 hover:text-sky-500 dark:text-zinc-100 dark:hover:text-sky-400"
                  :class="userItem.user?.uid ? 'cursor-pointer' : 'cursor-default'"
                  @click.stop="openUser(userItem)"
                >
                  {{ displayName(userItem) }}
                </button>
                <span v-if="index === 0 && group.users.length > 1" class="text-sm text-zinc-400">、</span>
              </template>
              <span v-if="group.users.length > 2" class="text-sm text-zinc-500 dark:text-zinc-400">等 {{ group.users.length }} 人</span>
              <span class="text-sm text-zinc-500 dark:text-zinc-400">{{ actionText(group.item.actionType) }}</span>
            </div>
            <div class="mt-2 flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <SvgIcon name="like" :width="14" :height="14" class="text-rose-400" />
              <time :datetime="group.item.createTime">{{ TimeUtil.formatDateTimeChinese(group.item.createTime) }}</time>
              <span v-if="group.users.length > 1" class="rounded-full bg-rose-50 px-2 py-0.5 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400">
                {{ group.users.length }} 个赞
              </span>
            </div>
          </div>

          <div class="ml-2 w-40 shrink-0 self-center max-[720px]:w-28">
            <div
              v-if="group.item.actionType === 'video_like'"
              class="relative flex aspect-video items-center overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800"
              :title="group.item.previewTitle || group.item.content || '我的视频'"
            >
              <img
                v-if="group.item.previewCover && !failedCoverIds.has(group.item.id)"
                :src="group.item.previewCover"
                :alt="group.item.previewTitle || group.item.content || '视频封面'"
                class="h-full w-full object-cover"
                @error="markCoverFailed(group.item.id)"
              />
              <div v-else class="flex h-full w-full items-center gap-2 bg-gradient-to-br from-sky-50 to-rose-50 px-3 text-zinc-500 dark:from-zinc-800 dark:to-zinc-800/60 dark:text-zinc-300">
                <span class="line-clamp-2 text-xs leading-5">{{ group.item.previewTitle || group.item.content || '我的视频' }}</span>
              </div>
              <div v-if="group.item.previewCover && !failedCoverIds.has(group.item.id)" class="absolute inset-x-0 bottom-0 truncate bg-black/55 px-2 py-1 text-xs text-white">
                {{ group.item.previewTitle || group.item.content }}
              </div>
            </div>

            <div v-else class="flex min-h-[72px] items-center rounded bg-zinc-50 px-3 text-xs leading-5 text-zinc-500 dark:bg-zinc-800/70 dark:text-zinc-400">
              <p class="line-clamp-3 break-words">{{ group.item.previewContent || group.item.content || '原评论已失效' }}</p>
            </div>
          </div>
        </article>
      </div>

      <div class="flex min-h-14 items-center justify-center border-t border-zinc-100 text-sm dark:border-zinc-800">
        <button
          v-if="hasMore"
          class="rounded px-4 py-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-sky-500 disabled:cursor-wait disabled:opacity-60 dark:text-zinc-400 dark:hover:bg-zinc-800"
          :disabled="loading"
          @click="loadLikes(false)"
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

const likes = computed(() => lists.value.like);
const loading = computed(() => loadingMap.value.like);
const hasMore = computed(() => hasMoreMap.value.like);

interface LikeGroup {
  key: string;
  item: NotificationItem;
  items: NotificationItem[];
  users: NotificationItem[];
}

const likeGroups = computed<LikeGroup[]>(() => {
  const grouped = new Map<string, NotificationItem[]>();

  likes.value.forEach((item) => {
    const targetKey = item.subjectId ?? item.targetId;
    const key = targetKey == null
      ? `${item.actionType}:notification:${item.id}`
      : `${item.actionType}:${item.targetType || 'unknown'}:${targetKey}`;
    const current = grouped.get(key);
    if (current) current.push(item);
    else grouped.set(key, [item]);
  });

  return [...grouped.entries()].map(([key, items]) => {
    const sortedItems = [...items].sort((a, b) => b.id - a.id);
    const latest = sortedItems[0];
    const previewSource = sortedItems.find(item => item.previewCover || item.previewTitle || item.previewContent);
    const usersById = new Map<string, NotificationItem>();

    sortedItems.forEach((item) => {
      const userKey = item.user?.uid ? `user:${item.user.uid}` : `notification:${item.id}`;
      if (!usersById.has(userKey)) usersById.set(userKey, item);
    });

    return {
      key,
      items: sortedItems,
      users: [...usersById.values()],
      item: previewSource
        ? {
            ...latest,
            previewCover: previewSource.previewCover,
            previewTitle: previewSource.previewTitle,
            previewContent: previewSource.previewContent,
          }
        : latest,
    };
  }).sort((a, b) => b.item.id - a.item.id);
});

function displayName(item: NotificationItem) {
  return item.user?.nickname || item.user?.username || '未知用户';
}

function actionText(actionType: NotificationActionType) {
  return actionType === 'comment_like' ? '赞了我的评论' : '赞了我的视频';
}

function canOpen(item: NotificationItem) {
  return Boolean(
    (item.actionType === 'video_like' && item.targetId)
    || (item.actionType === 'comment_like' && item.previewTargetId),
  );
}

function openUser(item: NotificationItem) {
  if (item.user?.uid) router.push(`/space/${item.user.uid}`);
}

async function openLikeGroup(group: LikeGroup) {
  const unreadItems = group.items.filter(item => !item.isRead);
  if (unreadItems.length) {
    await Promise.all(unreadItems.map(item => notificationStore.markRead(item)));
  }

  const item = group.item;

  if (item.actionType === 'video_like' && item.targetId) {
    router.push(`/video/${item.targetId}`);
    return;
  }
  if (item.actionType === 'comment_like' && item.previewTargetId) {
    router.push({
      path: `/video/${item.previewTargetId}`,
      query: item.targetId ? { comment: String(item.targetId) } : undefined,
    });
  }
}

function markCoverFailed(id: number) {
  failedCoverIds.value = new Set(failedCoverIds.value).add(id);
}

async function loadLikes(reset: boolean) {
  loadError.value = '';
  try {
    await notificationStore.fetchList('like', reset, PAGE_SIZE);
    if (reset && likes.value.some(item => !item.isRead)) {
      await notificationStore.markAllRead('like');
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : '收到的赞加载失败，请稍后重试';
  }
}

onMounted(() => loadLikes(true));
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
