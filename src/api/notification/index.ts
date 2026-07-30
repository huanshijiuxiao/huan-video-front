import http from "@/utils/http";

import type {
  NotificationItem,
  NotificationType,
  UnreadCounts,
} from "@/types/notification";

interface ApiResult<T> {
  code: number;
  msg?: string;
  data: T;
}

export function getNotifications(params: {
  type: NotificationType;
  cursor?: number;
  pageSize?: number;
}) {
  return http.get<unknown, ApiResult<NotificationItem[]>>(
    "/msg/notifications",
    { params },
  );
}

export function getUnreadCounts() {
  return http.get<unknown, ApiResult<UnreadCounts>>(
    "/msg/notifications/unread-count",
  );
}

export function markNotificationRead(id: number) {
  return http.post<unknown, ApiResult<boolean>>(
    `/msg/notifications/${id}/read`,
  );
}

export function markAllNotificationsRead(type?: NotificationType) {
  return http.post<unknown, ApiResult<boolean>>(
    "/msg/notifications/read-all",
    null,
    { params: { type } },
  );
}

export function deleteNotification(id: number) {
  return http.delete<unknown, ApiResult<boolean>>(
    `/msg/notifications/${id}`,
  );
}