<template>
  <el-dialog
    v-model="isVisible"
    :title="activeTab === 'login' ? '登录' : '注册'"
    width="420px"
    destroy-on-close
    append-to-body
    class="login-register-modal"
    @closed="resetForms"
  >
    <el-tabs v-model="activeTab" class="mb-4" @tab-change="clearValidate">
      <el-tab-pane label="登录" name="login" />
      <el-tab-pane label="注册" name="register" />
    </el-tabs>

    <el-form
      v-if="activeTab === 'login'"
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-position="top"
      @submit.prevent="handleLogin"
    >
      <el-form-item prop="email">
        <el-input
          v-model.trim="loginForm.email"
          :prefix-icon="Message"
          placeholder="请输入邮箱"
          size="large"
          clearable
          @keyup.enter="handleLogin"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          :prefix-icon="Lock"
          type="password"
          placeholder="请输入密码"
          size="large"
          show-password
          @keyup.enter="handleLogin"
        />
      </el-form-item>

      <div class="flex items-center justify-between mt-1 mb-5">
        <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
        <el-link type="primary" :underline="false" disabled>忘记密码</el-link>
      </div>

      <el-button
        type="primary"
        class="w-full"
        size="large"
        :loading="loading"
        @click="handleLogin"
      >
        登录
      </el-button>
    </el-form>

    <el-form
      v-else
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-position="top"
      @submit.prevent="handleRegister"
    >
      <el-form-item prop="email">
        <el-input
          v-model.trim="registerForm.email"
          :prefix-icon="Message"
          placeholder="请输入邮箱"
          size="large"
          clearable
          @keyup.enter="handleRegister"
        />
      </el-form-item>

      <el-form-item prop="code">
        <div class="verification-row">
          <el-input
            v-model.trim="registerForm.code"
            :prefix-icon="Key"
            placeholder="请输入 6 位验证码"
            maxlength="6"
            size="large"
            @keyup.enter="handleRegister"
          />
          <el-button
            size="large"
            :loading="codeSending"
            :disabled="codeSeconds > 0"
            @click="handleSendCode"
          >
            {{ codeSeconds > 0 ? `${codeSeconds}s 后重发` : "获取验证码" }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          :prefix-icon="Lock"
          type="password"
          placeholder="请输入密码"
          size="large"
          show-password
          @keyup.enter="handleRegister"
        />
      </el-form-item>

      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          :prefix-icon="Lock"
          type="password"
          placeholder="请确认密码"
          size="large"
          show-password
          @keyup.enter="handleRegister"
        />
      </el-form-item>

      <el-button
        type="primary"
        class="w-full mt-2"
        size="large"
        :loading="loading"
        @click="handleRegister"
      >
        注册
      </el-button>
    </el-form>

    <div class="mt-5 text-center text-sm text-zinc-500">
      <template v-if="activeTab === 'login'">
        还没有账号？
        <el-link type="primary" :underline="false" @click="activeTab = 'register'">立即注册</el-link>
      </template>
      <template v-else>
        已有账号？
        <el-link type="primary" :underline="false" @click="activeTab = 'login'">去登录</el-link>
      </template>
    </div>
  </el-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { Key, Lock, Message } from "@element-plus/icons-vue";
import { sendRegisterCode } from "@/api/user";
import { useAuthStore } from "@/stores/modules/auth";
import type { LoginParams, RegisterParams } from "@/types/user";

const props = defineProps<{
  visible: boolean;
  initialTab?: "login" | "register";
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "login", data: LoginForm): void;
  (e: "register", data: RegisterForm): void;
}>();

interface LoginForm extends LoginParams {
  remember: boolean;
}

interface RegisterForm extends RegisterParams {
  confirmPassword: string;
}

const authStore = useAuthStore();
const loading = ref(false);
const codeSending = ref(false);
const codeSeconds = ref(0);
let codeTimer: ReturnType<typeof setInterval> | undefined;
const activeTab = ref<"login" | "register">(props.initialTab || "login");
const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();

const isVisible = computed({
  get: () => props.visible,
  set: (value) => emit("update:visible", value),
});

const loginForm = reactive<LoginForm>({
  email: "",
  password: "",
  remember: false,
});

const registerForm = reactive<RegisterForm>({
  email: "",
  password: "",
  code: "",
  confirmPassword: "",
});

const validateConfirmPassword = (_rule: unknown, value: string, callback: (error?: Error) => void) => {
  if (!value) {
    callback(new Error("请确认密码"));
    return;
  }

  if (value !== registerForm.password) {
    callback(new Error("两次输入密码不一致"));
    return;
  }

  callback();
};

const loginRules = reactive<FormRules<LoginForm>>({
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于 6 个字符", trigger: "blur" },
  ],
});

const registerRules = reactive<FormRules<RegisterForm>>({
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱地址", trigger: ["blur", "change"] },
  ],
  code: [
    { required: true, message: "请输入邮箱验证码", trigger: "blur" },
    { pattern: /^\d{6}$/, message: "验证码应为 6 位数字", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度不能小于 6 个字符", trigger: "blur" },
  ],
  confirmPassword: [{ validator: validateConfirmPassword, trigger: ["blur", "change"] }],
});

watch(
  () => props.initialTab,
  (tab) => {
    if (tab) {
      activeTab.value = tab;
    }
  }
);

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function clearValidate() {
  nextTick(() => {
    loginFormRef.value?.clearValidate();
    registerFormRef.value?.clearValidate();
  });
}

function resetForms() {
  loginForm.password = "";
  registerForm.email = "";
  registerForm.password = "";
  registerForm.code = "";
  registerForm.confirmPassword = "";
  loginFormRef.value?.clearValidate();
  registerFormRef.value?.clearValidate();
  loading.value = false;
  resetCodeCountdown();
}

function resetCodeCountdown() {
  if (codeTimer) clearInterval(codeTimer);
  codeTimer = undefined;
  codeSeconds.value = 0;
}

function startCodeCountdown() {
  resetCodeCountdown();
  codeSeconds.value = 60;
  codeTimer = setInterval(() => {
    codeSeconds.value -= 1;
    if (codeSeconds.value <= 0) resetCodeCountdown();
  }, 1000);
}

async function handleSendCode() {
  if (!registerFormRef.value || codeSending.value || codeSeconds.value > 0) return;

  try {
    await registerFormRef.value.validateField("email");
    codeSending.value = true;
    const response = await sendRegisterCode(registerForm.email);
    if (response.code !== 200) throw new Error(response.msg || "验证码发送失败");
    startCodeCountdown();
    ElMessage.success("验证码已发送，请查收邮件");
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(getErrorMessage(error, "验证码发送失败，请稍后重试"));
    }
  } finally {
    codeSending.value = false;
  }
}

async function handleLogin() {
  if (!loginFormRef.value || loading.value) return;

  await loginFormRef.value.validate();
  loading.value = true;

  try {
    await authStore.login({
      email: loginForm.email,
      password: loginForm.password,
    });

    ElMessage.success("登录成功");
    emit("login", { ...loginForm });
    isVisible.value = false;
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "登录失败，请检查邮箱或密码"));
  } finally {
    loading.value = false;
  }
}

async function handleRegister() {
  if (!registerFormRef.value || loading.value) return;

  await registerFormRef.value.validate();
  loading.value = true;

  try {
    await authStore.register({
      email: registerForm.email,
      password: registerForm.password,
      code: registerForm.code,
    });

    ElMessage.success("注册成功，请登录");
    emit("register", { ...registerForm });
    loginForm.email = registerForm.email;
    loginForm.password = "";
    activeTab.value = "login";
    resetForms();
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "注册失败，请稍后重试"));
  } finally {
    loading.value = false;
  }
}

onBeforeUnmount(resetCodeCountdown);
</script>

<style>
.login-register-modal .el-dialog__body {
  padding-top: 0;
}

.verification-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 124px;
  gap: 10px;
  width: 100%;
}

@media (max-width: 480px) {
  .login-register-modal {
    width: calc(100vw - 32px) !important;
  }

  .verification-row {
    grid-template-columns: minmax(0, 1fr) 112px;
  }
}
</style>
