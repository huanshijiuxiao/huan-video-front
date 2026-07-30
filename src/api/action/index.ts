import http from "@/utils/http.ts";

export function likeAction(data?: any) {
  return http.request({
    url: "/action/like",
    method: "post",
    data: data,
  });
}

export function dealFavAction(data?: any) {
  return http.request({
    url: "/action/fav/deal", 
    method: "post",
    data: data,
  });
}

export function hasLike(param?: any) {
  return http.request({
    url: "/action/like/has",
    method: "get",
    params: param,
  });
}

export function hasFav(param?: any) {
  return http.request({
    url: "/action/fav/has",
    method: "get",
    params: param,
  });
}

export function hasCoin(param?: any) {
  return http.request({
    url: "/action/coin/has",
    method: "get",
    params: param,
  });
}

