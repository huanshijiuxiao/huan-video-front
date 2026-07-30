import http from "@/utils/http.ts";
import type {
  AccountProfileParams,
  AuthorizeVO,
  ChangePasswordParams,
  LoginParams,
  RegisterParams,
  UserInfo,
} from "@/types/user";

export function login(data: LoginParams) {
  return http.request({
    url: "/user/login",
    method: "post",
    data,
  }) as Promise<{ code: number; msg: string; data: AuthorizeVO }>;
}

export function register(data: RegisterParams) {
  return http.request({
    url: "/user/register",
    method: "post",
    data,
  }) as Promise<{ code: number; msg: string; data: unknown }>;
}

export function sendRegisterCode(email: string) {
  return http.request({
    url: "/user/register/code",
    method: "post",
    params: { email },
  }) as Promise<{ code: number; msg: string; data: boolean }>;
}

export function getCurrentUserInfo() {
  return http.request({
    url: "/user/current",
    method: "get",
  }) as Promise<{ code: number; msg: string; data: UserInfo }>;
}

export function getUserInfo(uid: number) {
  return http.request({
    url: "/user/info",
    method: "get",
    params: { uid },
  }) as Promise<{ code: number; msg: string; data: UserInfo }>;
}

export function updateUserInfo(data: AccountProfileParams) {
  const formData = new FormData();

  if (data.uid !== undefined) formData.append("uid", String(data.uid));
  formData.append("nickname", data.nickname);
  formData.append("sex", String(data.sex));
  if (data.birthday) formData.append("birthday", data.birthday);
  if (data.introduction) formData.append("introduction", data.introduction);
  if (data.avatarFile) formData.append("avatarFile", data.avatarFile);

  return http.request({
    url: "/user/update",
    method: "post",
    data: formData,
    headers: { "Content-Type": "multipart/form-data" },
  }) as Promise<{ code: number; msg: string; data: boolean }>;
}

export function updatePassword(data: ChangePasswordParams) {
  return http.request({
    url: "/user/password",
    method: "post",
    data,
  }) as Promise<{ code: number; msg: string; data: boolean }>;
}

export function logout() {
  return http.request({
    url: "/user/logout",
    method: "post",
  }) as Promise<{ code: number; msg: string; data: unknown }>;
}
