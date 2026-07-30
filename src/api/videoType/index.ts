import http from "@/utils/http.ts";

// 获取分区列表
export function listVideoType() {
    return http.request({
        url: `/videoType/list`,
        method: "get"
    });
}