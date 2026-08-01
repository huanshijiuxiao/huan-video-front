import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { AuthorizeVO } from "@/types/user";
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from "@/utils/auth";

const baseURL = import.meta.env.VITE_BASE_API ?? "/api/v1";

const http: AxiosInstance = axios.create({
  baseURL,
  timeout: 60000,
  headers: { "Content-Type": "application/json;charset=UTF-8" },
});

const refreshHttp = axios.create({
  baseURL,
  timeout: 60000,
  headers: { "Content-Type": "application/json;charset=UTF-8" },
});

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

type RetryRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;
let unauthorizedDialogVisible = false;

http.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  config.headers["X-Client-Type"] = config.headers["X-Client-Type"] ?? "Frontend";
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

http.interceptors.response.use(
  (response) => response.data,
  async (error: AxiosError) => {
    if (error.response?.status !== 401) return Promise.reject(error);

    const config = error.config as RetryRequestConfig | undefined;
    if (!config || isAuthenticationRequest(config.url)) return Promise.reject(error);

    if (!config._retry && getRefreshToken()) {
      config._retry = true;
      try {
        const accessToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${accessToken}`;
        return http.request(config);
      } catch (refreshError) {
        clearSessionAndPromptLogin();
        return Promise.reject(refreshError);
      }
    }

    clearSessionAndPromptLogin();
    return Promise.reject(error);
  }
);

function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.reject(new Error("刷新令牌不存在"));

  if (!refreshPromise) {
    refreshPromise = refreshHttp
      .post<ApiResponse<AuthorizeVO>>("/user/refresh", { refreshToken })
      .then(({ data: response }) => {
        if (response.code !== 200 || !response.data?.accessToken || !response.data?.refreshToken) {
          throw new Error(response.msg || "刷新登录状态失败");
        }
        setAccessToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        return response.data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

function isAuthenticationRequest(url?: string) {
  return Boolean(url && (
    url.includes("/user/login") ||
    url.includes("/user/register") ||
    url.includes("/user/refresh")
  ));
}

function clearSessionAndPromptLogin() {
  clearTokens();
  void import("@/stores/modules/auth").then(({ useAuthStore }) => useAuthStore().clearAuth());
  if (unauthorizedDialogVisible) return;

  unauthorizedDialogVisible = true;
  void import("@/components/LoginRegisterDialog/useLoginDialog")
    .then(({ useLoginDialog }) => {
      const { showLoginDialog } = useLoginDialog();
      showLoginDialog({
        initialTab: "login",
        onLogin: () => { unauthorizedDialogVisible = false; },
        onClose: () => { unauthorizedDialogVisible = false; },
      });
    })
    .catch(() => { unauthorizedDialogVisible = false; });
}

export default http;
