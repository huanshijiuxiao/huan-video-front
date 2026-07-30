import http from "@/utils/http.ts";


export function ListFav(param?: any) {
  return http.request({
    url: "/fav/list",
    method: "get",
    params: param
  });
}

export function createFavFolder(title: string) {
  return http.request({
    url: "/fav/create",
    method: "get",
    params: { title },
  });
}

export function listFavItems(params?: any) {
  return http.request({
    url: "/fav/items",
    method: "get",
    params,
  });
}
