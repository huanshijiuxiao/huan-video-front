
import http from "@/utils/http";
import type { PageResult, VideoInfo, SearchVideoParams } from "@/types/video";
import type { UserInfo } from "@/types/user";

export interface SearchUserParams {
  keyword: string;
  page?: number;
  size?: number;
  orderBy?: string;
  orderDir?: string;
  followerMin?: number;
  followerMax?: number;
  levelMin?: number;
}

// 搜索视频
export function searchVideo(params: SearchVideoParams) {
  return http.request({
    url: "/search/video",
    method: "get",
    params,
  }) as Promise<{ code: number; msg: string; data: PageResult<VideoInfo> }>;
}

// 搜索用户
export function searchUser(params: SearchUserParams) {
  return http.request({
    url: "/search/user",
    method: "get",
    params,
  }) as Promise<{ code: number; msg: string; data: PageResult<UserInfo> }>;
}
