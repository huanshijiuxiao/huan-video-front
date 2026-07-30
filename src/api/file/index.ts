import http from "@/utils/http.ts";

export function uploadFile(formData: FormData) {
  return http.request({
    url: "/file/upload",
    method: "post",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  }) as Promise<{ code: number; msg: string; data: string }>;
}

export function uploadSlice(formData: FormData) {
  return http.request({
    url: "/file/uploadSlice",
    method: "post",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function getUploadedChunks(guid: string) {
  return http.request({
    url: "/file/uploadedChunks",
    method: "get",
    params: { guid },
  });
}

export function cancelUpload(guid: string) {
  return http.request({
    url: "/file/cancelUpload",
    method: "post",
    params: { guid },
  });
}
