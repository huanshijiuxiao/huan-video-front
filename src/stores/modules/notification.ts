import { computed, ref } from "vue";
import { defineStore } from "pinia";
import {
  deleteNotification,
  getNotifications,
  getUnreadCounts,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api/notification";
import type {
  NotificationItem,
  NotificationType,
  UnreadCounts,
} from "@/types/notification";

const types: NotificationType[] = ["reply", "at", "like", "system"];

function emptyLists(): Record<NotificationType, NotificationItem[]> {
  return { reply: [], at: [], like: [], system: [] };
}

function emptyFlags(value: boolean): Record<NotificationType, boolean> {
  return { reply: value, at: value, like: value, system: value };
}

function emptyCursors(): Record<NotificationType, number | undefined> {
  return {
    reply: undefined,
    at: undefined,
    like: undefined,
    system: undefined,
  };
}

const emptyUnread = (): UnreadCounts => ({
  reply: 0,
  at: 0,
  like: 0,
  system: 0,
  total: 0,
});

export const useNotificationStore = defineStore("notification", () => {
  const lists = ref(emptyLists());
  const cursors = ref(emptyCursors());
  const hasMore = ref(emptyFlags(true));
  const loading = ref(emptyFlags(false));
  const unread = ref(emptyUnread());

  const totalUnread = computed(() => unread.value.total);

  async function fetchList(
    type: NotificationType,
    reset = false,
    pageSize = 20,
  ) {
    if (loading.value[type]) return;
    if (!reset && !hasMore.value[type]) return;

    loading.value[type] = true;

    try {
      const response = await getNotifications({
        type,
        cursor: reset ? undefined : cursors.value[type],
        pageSize,
      });

      if (response.code !== 200) {
        throw new Error(response.msg || "通知加载失败");
      }

      const incoming = response.data || [];
      const current = reset ? [] : lists.value[type];
      const byId = new Map<number, NotificationItem>();

      [...current, ...incoming].forEach((item) => byId.set(item.id, item));

      lists.value[type] = [...byId.values()]
        .sort((a, b) => b.id - a.id);

      cursors.value[type] = incoming.at(-1)?.id;
      hasMore.value[type] = incoming.length === pageSize;
    } finally {
      loading.value[type] = false;
    }
  }

  async function fetchUnread() {
    const response = await getUnreadCounts();

    if (response.code === 200 && response.data) {
      unread.value = response.data;
    }
  }

  function handleRealtime(item: NotificationItem) {
    if (!types.includes(item.type)) return;

    const list = lists.value[item.type];
    const index = list.findIndex((current) => current.id === item.id);

    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }

    // 服务端推送的是权威未读数，避免多设备计数漂移。
    if (item.unreadCounts) {
      unread.value = item.unreadCounts;
    } else if (!item.isRead) {
      unread.value[item.type]++;
      unread.value.total++;
    }
  }

  async function markRead(item: NotificationItem) {
    if (item.isRead) return true;

    const response = await markNotificationRead(item.id);
    if (response.code !== 200 || !response.data) return false;

    item.isRead = 1;
    unread.value[item.type] = Math.max(0, unread.value[item.type] - 1);
    unread.value.total = Math.max(0, unread.value.total - 1);
    return true;
  }

  async function markAllRead(type: NotificationType) {
    const response = await markAllNotificationsRead(type);
    if (response.code !== 200 || !response.data) return false;

    lists.value[type].forEach((item) => {
      item.isRead = 1;
    });

    unread.value.total = Math.max(
      0,
      unread.value.total - unread.value[type],
    );
    unread.value[type] = 0;
    return true;
  }

  async function remove(item: NotificationItem) {
    const response = await deleteNotification(item.id);
    if (response.code !== 200 || !response.data) return false;

    lists.value[item.type] = lists.value[item.type]
      .filter((current) => current.id !== item.id);

    if (!item.isRead) {
      unread.value[item.type] = Math.max(0, unread.value[item.type] - 1);
      unread.value.total = Math.max(0, unread.value.total - 1);
    }

    return true;
  }

  function reset() {
    lists.value = emptyLists();
    cursors.value = emptyCursors();
    hasMore.value = emptyFlags(true);
    loading.value = emptyFlags(false);
    unread.value = emptyUnread();
  }

  return {
    lists,
    hasMore,
    loading,
    unread,
    totalUnread,
    fetchList,
    fetchUnread,
    handleRealtime,
    markRead,
    markAllRead,
    remove,
    reset,
  };
});