import { UserInfo } from "./user";


export type NotificationType = "reply" | "at" | "like" | "system";

export interface NotificationPush {
  id: number;
  type: 'reply' | 'at' | 'like' | 'system';
  actorId?: number;
  actorName?: string;
  actorAvatar?: string;
  content: string;
  targetId?: number;
  targetType?: string;
  createTime: string;
  unreadCounts: Record<string, number>;
}

export type NotificationActionType =
  | "video_comment"
  | "comment_reply"
  | "video_like"
  | "comment_like"
  | "mention"
  | "system";

export interface UnreadCounts {
  reply: number;
  at: number;
  like: number;
  system: number;
  total: number;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  actionType: NotificationActionType;
  user?: UserInfo; 
  content: string;
  targetId?: number;
  subjectId?: number;
  targetType?: "video" | "dynamic" | "comment" | "system";
  previewContent?: string;
  previewCover?: string;
  previewTitle?: string;
  previewTargetId?: number;
  isRead: number;
  createTime: string;
  unreadCounts?: UnreadCounts;
}
