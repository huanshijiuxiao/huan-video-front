import http from "@/utils/http.ts";

import type { History, ContentType } from "@/types/history.ts";

export function getHistoryList(params?: any) {
  return http.request({
    url: "/history/list",
    method: "get",
    params,
  });
}

export function getHistory(params?: any) {
  return http.request({
    url: "/history/current",
    method: "get",
    params,
  });
}

/**
 * 获取当前用户指定内容的播放历史
 * @param contentId 内容ID
 * @param contentType 内容类型（可选）
 */
export function getCurrentUserHistoryByContentId(
  contentId: number,
  contentType?: ContentType
) {
  return http.request<History>({
    url: "/history/current",
    method: "get",
    params: {
      contentId,
      ...(contentType !== undefined && { contentType }),
    },
  });
}

/**
 * 上报播放进度
* @param data 播放进度数据
 */
export function reportPlaybackHistory(data: {
  contentId: string | null;
  contentType: number;
  progress: number;
  duration: number;
}) {
  return http.request({
    url: "/history/report",
    method: "post",
    data,
  });
}


/**
 * 删除历史记录
 * @param contentId 内容ID
 */
export function deleteHistory(contentId: number) {
  return http.request({
    url: `/history/delete/${contentId}`,
    method: "get",
  });
}

/**
 * 清空所有历史记录
 */
export function clearAllHistory() {
  return http.request({
    url: "/history/clear",
    method: "get",
  });
}

