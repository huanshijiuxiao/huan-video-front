// 消息类型枚举
export enum MessageType {
    AT = 'at',
    REPLY = 'reply',
    LIKE = 'like',
    SYSTEM = 'system',
    WHISPER = 'whisper', // 私信
    NOTICE = 'notice'    // 通知
  }
  
  // 消息状态
  export enum MessageStatus {
    READ = 'read',
    UNREAD = 'unread',
    DELETED = 'deleted'
  }
  
  // 消息项
  export interface Message {
    id: number;
    type: MessageType;
    title: string;
    content: string;
    sender?: {
      id: number;
      name: string;
      avatar: string;
      isFollowed: boolean;
    };
    createTime: Date;
    status: MessageStatus;
    targetId?: number;      // 关联的视频/动态/评论ID
    targetType?: string;    // 关联的内容类型
    thumbnail?: string;     // 预览图
    replyContent?: string;  // 如果是回复类消息，这里是回复的内容
  }
  
  // 消息分组
  export interface MessageCategory {
    id: string;
    name: string;
    icon: string;
    count: number; // 未读数量
    type: MessageType | 'all';
    messages?: Message[];
  }
  