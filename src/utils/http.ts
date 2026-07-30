// 封装axios
import axios, { AxiosInstance } from "axios";
import { getToken, removeToken } from "@/utils/auth.ts";

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_API ?? "/api/v1",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

let unauthorizedDialogVisible = false;

http.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthRequest = requestUrl.includes("/user/login") || requestUrl.includes("/user/register");

      if (!isAuthRequest) {
        removeToken();
        void import("@/stores/modules/auth").then(({ useAuthStore }) => {
          useAuthStore().resetToken();
        });

        if (!unauthorizedDialogVisible) {
          unauthorizedDialogVisible = true;

          import("@/components/LoginRegisterDialog/useLoginDialog")
            .then(({ useLoginDialog }) => {
              const { showLoginDialog } = useLoginDialog();

              showLoginDialog({
                initialTab: "login",
                onLogin: () => {
                  unauthorizedDialogVisible = false;
                },
                onClose: () => {
                  unauthorizedDialogVisible = false;
                },
              });
            })
            .catch(() => {
              unauthorizedDialogVisible = false;
            });
        }
      }
    }

    return Promise.reject(error);
  }
);

export default http;
