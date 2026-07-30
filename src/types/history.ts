// 内容类型枚举
export enum ContentType {
    VIDEO = 1,
    LIVE = 2,
    ARTICLE = 3
  }
  
// 历史记录项接口
export interface History {
id: number;
uid: number;
contentType: ContentType;
contentId: number;
watchTime: string;
progress: number;
deviceId: string | null;
isDeleted: boolean;

// 前端展示需要的额外字段
title: string;
picture: string;
authorName: string;
authorAvatar: string;
duration?: number; // 视频时长（秒）
liveStatus?: boolean; // 直播状态
readingProgress?: number; // 专栏阅读进度百分比
}

// 分组后的历史记录
export interface HistoryGroup {
date: string;
items: History[];
}

// 筛选条件
export interface HistoryFilterItem {
contentType: ContentType;
timeRange: 'all' | 'today' | 'week' | 'month' | 'custom';
startDate?: string;
endDate?: string;
keyword?: string;
}

// 排序方式
export type SortMethod = 'latest' | 'type';
