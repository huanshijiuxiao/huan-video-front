import type { AuthorizeVO, LoginParams, RegisterParams, UserInfo } from "@/types/user";
import { getToken, removeToken, setToken } from "@/utils/auth";
import { defineStore } from "pinia";
import { store } from "@/stores";
import { getCurrentUserInfo, login, logout, register } from "@/api/user";

interface AuthState {
  token: string | null;
  userInfo: UserInfo | null;
  roles?: string[];
  role?: string | null;
}

export const useAuthStore = defineStore({
  id: "user",
  state: (): AuthState => ({
    token: getToken() || null,
    userInfo: null,
    role: null,
  }),
  getters: {
    getToken: (state) => {
      return state.token || getToken();
    },
    getUserInfo: (state) => state.userInfo,
    getUserId: (state) => state.userInfo?.uid,
    isAuthenticated: (state) => state.token,
    isAdmin: (state) => state.userInfo?.role === "ADMIN" || state.role === "ADMIN",
  },
  actions: {
    async login(credentials: LoginParams) {
      const response = await login(credentials);

      if (response.code !== 200 || !response.data?.token) {
        throw new Error(response.msg || "登录失败，请稍后重试");
      }

      const { token, role } = response.data as AuthorizeVO;
      this.token = token;
      this.role = role ?? null;
      setToken(token);

      await this.fetchUserInfo();
      return response.data;
    },

    async register(payload: RegisterParams) {
      const response = await register(payload);

      if (response.code !== 200) {
        throw new Error(response.msg || "注册失败，请稍后重试");
      }

      return response.data;
    },

    async fetchUserInfo() {
      const token = this.token || getToken();

      if (!token) {
        throw new Error("Token不存在，请先登录");
      }

      this.token = token;

      try {
        const response = await getCurrentUserInfo();
        const { data } = response;

        if (!data) {
          throw new Error("验证失败，请重新登录");
        }

        this.userInfo = data;
        this.role = data.role ?? null;

        return data;
      } catch (error) {
        this.resetToken();
        console.error("获取用户信息失败:", error);
        throw error;
      }
    },

    async logout() {
      try {
        await logout();
      } catch (error) {
        console.error("登出请求失败:", error);
      } finally {
        this.resetToken();
        window.location.reload();
      }
    },

    resetToken() {
      this.token = null;
      this.userInfo = null;
      this.roles = [];
      this.role = null;
      removeToken();
    },

    async loginDialogShown() {
      const { useLoginDialog } = await import("@/components/LoginRegisterDialog/useLoginDialog");
      const { showLoginDialog } = useLoginDialog();

      showLoginDialog({
        onLogin: async () => {
          try {
            await this.fetchUserInfo();
          } catch (error) {
            console.error("登录失败:", error);
          }
        },
      });
    },
  },
});

export function useAuthStoreHook() {
  return useAuthStore(store);
}
