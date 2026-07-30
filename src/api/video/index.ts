import http from "@/utils/http.ts";

export function listVideoInfo(params?: any) {
    return http.request({
        url: "/video/list",
        method: "get",
        params,
    });
}

export function listMyVideoInfo(params?: any) {
    return http.request({
        url: "/video/my/list",
        method: "get",
        params,
    });
}

export function listAuditVideo(params?: any) {
    return http.request({
        url: "/admin/video/audit/list",
        method: "get",
        params,
    });
}

export function auditVideo(aid: number, status: number, auditMessage?: string) {
    return http.request({
        url: "/admin/video/audit",
        method: "post",
        params: { aid, status, auditMessage },
    });
}


export function addVideoInfo(data: any) {
    return http.request({
        url: "/video/add",
        method: "post",
        data,
        headers: { 'Content-Type': undefined },
    });
}

export function updateVideoInfo(data: any) {
    return http.request({
        url: "/video/update",
        method: "post",
        data,
        headers: { 'Content-Type': undefined },
    });
}

export function getVideoInfo(params?: any) {
    return http.request({
        url: "/video/view",
        method: "get",
        params,
    });
}


export function deleteVideoInfo(aid: number) {
    return http.request({
        url: "/video/delete",
        method: "post",
        params: { aid },
    });
}


export function recommendVideos(data?: any) {
    return http.request({
        url: '/video/recommend',
        method: 'post',
        data,
    });}

