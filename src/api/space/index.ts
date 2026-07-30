import http from "@/utils/http";

export function getUserSpaceInfo(params?: { uid?: number }) {
    return http.request({
        url: "/user/info",
        method: "get",
        params,
    }) as Promise<{ code: number; msg: string; data: any }>;
}

export function listUserVideos(params?: {
    uid?: number;
    pageNum?: number;
    pageSize?: number;
}) {
    return http.request({
        url: "/video/list",
        method: "get",
        params,
    });
}

export function listLikedVideos(params?: {
    uid?: number;
    pageNum?: number;
    pageSize?: number;
}) {
    return http.request({
        url: "/stat/likedList",
        method: "get",
        params,
    });
}
