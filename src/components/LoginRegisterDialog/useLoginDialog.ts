import { createApp, h, ref, watch } from "vue";
import type { App, Ref } from "vue";
import { ElMessage } from "element-plus";
import ElementPlus from "element-plus";
import LoginRegisterDialog from "./index.vue";
import { store } from "@/stores";

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

interface RegisterForm {
  email: string;
  password: string;
  code: string;
  confirmPassword: string;
}

interface LoginRegisterOptions {
  initialTab?: "login" | "register";
  onLogin?: (form: LoginForm) => void | Promise<void>;
  onRegister?: (form: RegisterForm) => void | Promise<void>;
  onClose?: () => void;
}

let currentInstance: {
  app: App<Element>;
  container: HTMLElement;
  visible: Ref<boolean>;
} | null = null;

function destroyInstance(container: HTMLElement, app: App<Element>) {
  app.unmount();

  if (document.body.contains(container)) {
    document.body.removeChild(container);
  }

  if (currentInstance?.container === container) {
    currentInstance = null;
  }
}

export function useLoginDialog() {
  const showLoginDialog = (options: LoginRegisterOptions = {}) => {
    if (currentInstance) {
      destroyInstance(currentInstance.container, currentInstance.app);
    }

    const container = document.createElement("div");
    document.body.appendChild(container);

    let closedBySubmit = false;

    const app = createApp({
      setup() {
        const visible = ref(true);

        const handleLogin = async (form: LoginForm) => {
          closedBySubmit = true;

          try {
            await options.onLogin?.(form);
          } catch (error) {
            ElMessage.error("登录处理过程中出现错误");
            console.error("Login handler error:", error);
          }
        };

        const handleRegister = async (form: RegisterForm) => {
          try {
            await options.onRegister?.(form);
          } catch (error) {
            ElMessage.error("注册处理过程中出现错误");
            console.error("Register handler error:", error);
          }
        };

        watch(visible, (val) => {
          if (val) return;

          if (!closedBySubmit) {
            options.onClose?.();
          }

          setTimeout(() => {
            destroyInstance(container, app);
          }, 300);
        });

        currentInstance = { app, container, visible };

        return () =>
          h(LoginRegisterDialog, {
            visible: visible.value,
            "onUpdate:visible": (val: boolean) => {
              visible.value = val;
            },
            initialTab: options.initialTab || "login",
            onLogin: handleLogin,
            onRegister: handleRegister,
          });
      },
    });

    app.use(store);
    app.use(ElementPlus);
    app.mount(container);

    return {
      close: () => {
        if (currentInstance) {
          currentInstance.visible.value = false;
        }
      },
    };
  };

  return {
    showLoginDialog,
  };
}
