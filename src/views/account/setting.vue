<template>
  <div class="min-h-full bg-zinc-100 dark:bg-zinc-900 px-4 py-6">
    <div class="mx-auto flex max-w-[1180px] flex-row gap-5 lg:flex-row">
      <aside class="account-sidebar">
        <div class="flex items-center gap-3 border-b border-zinc-100 pb-5 dark:border-zinc-700">
          <img
            :src="avatarPreview || profileForm.avatar"
            class="h-14 w-14 rounded-full object-cover ring-2 ring-sky-100 dark:ring-sky-900"
            alt="用户头像"
          />
          <div class="min-w-0">
            <div class="truncate text-base font-semibold text-zinc-900 dark:text-white">
              {{ displayName }}
            </div>
            <div class="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
              UID {{ profileForm.uid || "--" }}
            </div>
          </div>
        </div>

        <nav class="mt-4 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          <button
            v-for="item in settingTabs"
            :key="item.key"
            class="setting-nav-item"
            :class="{ active: activeTab === item.key }"
            @click="activeTab = item.key"
          >
            <el-icon :size="18">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </button>
        </nav>
      </aside>

      <main class="min-w-0 flex-1">
        <section class="account-panel">
          <div class="panel-header">
            <div>
              <h1>{{ currentTab?.title }}</h1>
              <p>{{ currentTab?.description }}</p>
            </div>
            <el-tag v-if="!hasUserInfo" type="warning" effect="light">等待用户信息</el-tag>
          </div>

          <template v-if="activeTab === 'profile'">
            <div class="profile-grid">
              <div class="avatar-box">
                <img
                  :src="avatarPreview || profileForm.avatar"
                  class="h-24 w-24 rounded-full object-cover shadow-sm"
                  alt="头像预览"
                />
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  accept="image/png,image/jpeg,image/webp"
                  :on-change="handleAvatarChange"
                >
                  <el-button :icon="Upload" plain>更换头像</el-button>
                </el-upload>
                <span class="text-xs text-zinc-400">
                  {{ croppedAvatarFile ? "头像已裁剪，保存资料时上传" : "支持 JPG、PNG、WebP" }}
                </span>
              </div>

              <el-form
                ref="profileFormRef"
                :model="profileForm"
                :rules="profileRules"
                label-position="top"
                class="min-w-0"
              >
                <div class="grid gap-4 md:grid-cols-2">
                  <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="profileForm.nickname" maxlength="20" show-word-limit />
                  </el-form-item>
                  <el-form-item label="用户名">
                    <el-input v-model="profileForm.username" disabled />
                  </el-form-item>
                  <el-form-item label="性别">
                    <el-segmented v-model="profileForm.sex" :options="sexOptions" />
                  </el-form-item>
                  <el-form-item label="生日">
                    <el-date-picker
                      v-model="profileForm.birthday"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="选择生日"
                      class="w-full"
                    />
                  </el-form-item>
                </div>

                <el-form-item label="个人简介" prop="introduction">
                  <el-input
                    v-model="profileForm.introduction"
                    type="textarea"
                    :rows="4"
                    maxlength="120"
                    show-word-limit
                    resize="none"
                  />
                </el-form-item>

                <div class="form-actions">
                  <el-button @click="resetProfile">重置</el-button>
                  <el-button type="primary" :loading="savingProfile" @click="saveProfile">
                    保存资料
                  </el-button>
                </div>
              </el-form>
            </div>
          </template>

          <template v-else-if="activeTab === 'security'">
            <div class="space-y-5">
              <div class="security-item">
                <div>
                  <h3>登录密码</h3>
                  <p>定期更新密码可以降低账号被盗风险。</p>
                </div>
                <el-button type="primary" plain @click="openPasswordDialog">修改密码</el-button>
              </div>

              <div class="security-item">
                <div>
                  <h3>登录状态</h3>
                  <p>当前账号正在此设备保持登录。</p>
                </div>
                <el-button type="danger" plain @click="authStore.logout()">退出登录</el-button>
              </div>
            </div>
          </template>

          <template v-else>
            <div class="space-y-4">
              <div
                v-for="item in notificationItems"
                :key="item.key"
                class="notice-item"
              >
                <div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.description }}</p>
                </div>
                <el-switch v-model="notificationForm[item.key]" />
              </div>
              <div class="form-actions">
                <el-button @click="resetNotifications">重置</el-button>
                <el-button type="primary" @click="saveNotifications">保存偏好</el-button>
              </div>
            </div>
          </template>
        </section>
      </main>
    </div>

    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="420px">
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-position="top"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePassword">确认修改</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="avatarCropperVisible"
      title="裁剪头像"
      width="720px"
      destroy-on-close
      @closed="clearCropperSource"
    >
      <div class="cropper-dialog-body">
        <div class="cropper-stage">
          <VueCropper
            v-if="cropperSource"
            ref="avatarCropperRef"
            :img="cropperSource"
            :wrapper="{ width: '100%', height: 360 }"
            :crop-layout="{ width: 240, height: 240 }"
            :center-box="true"
            output-type="png"
          />
        </div>
        <div class="cropper-tools">
          <el-button @click="avatarCropperRef?.zoomOut?.()">缩小</el-button>
          <el-button @click="avatarCropperRef?.zoomIn?.()">放大</el-button>
          <el-button @click="avatarCropperRef?.rotateLeft?.()">左转</el-button>
          <el-button @click="avatarCropperRef?.rotateRight?.()">右转</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="avatarCropperVisible = false">取消</el-button>
        <el-button type="primary" :loading="croppingAvatar" @click="confirmAvatarCrop">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { FormInstance, FormRules, UploadFile } from "element-plus";
import { ElMessage } from "element-plus";
import { Bell, Lock, Upload, User } from "@element-plus/icons-vue";
import { VueCropper } from "cropper-next-vue";
import "cropper-next-vue/style.css";
import { useAuthStore } from "@/stores/modules/auth";
import { updatePassword, updateUserInfo } from "@/api/user";

type SettingTab = "profile" | "security" | "notification";
type NoticeKey = "reply" | "follow" | "system" | "message";
type CropperInstance = {
  getCropBlob?: () => Promise<Blob>;
  rotateLeft?: () => void;
  rotateRight?: () => void;
  zoomIn?: () => void;
  zoomOut?: () => void;
};

interface ProfileForm {
  uid?: number;
  avatar: string;
  username: string;
  nickname: string;
  sex: number;
  birthday: string;
  introduction: string;
}

const authStore = useAuthStore();
const activeTab = ref<SettingTab>("profile");
const savingProfile = ref(false);
const avatarPreview = ref("");
const avatarCropperVisible = ref(false);
const cropperSource = ref("");
const croppedAvatarFile = ref<File | null>(null);
const croppingAvatar = ref(false);
const passwordDialogVisible = ref(false);
const profileFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();
const avatarCropperRef = ref<CropperInstance>();

const profileForm = reactive<ProfileForm>({
  uid: undefined,
  avatar: "",
  username: "",
  nickname: "",
  sex: 0,
  birthday: "",
  introduction: "",
});

const passwordForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const notificationForm = reactive<Record<NoticeKey, boolean>>({
  reply: true,
  follow: true,
  system: true,
  message: true,
});

const settingTabs = [
  {
    key: "profile" as const,
    label: "个人资料",
    title: "个人资料",
    description: "管理头像、昵称、生日和个人简介。",
    icon: User,
  },
  {
    key: "security" as const,
    label: "账号安全",
    title: "账号安全",
    description: "查看登录状态，维护密码和绑定信息。",
    icon: Lock,
  },
  {
    key: "notification" as const,
    label: "通知偏好",
    title: "通知偏好",
    description: "设置你希望收到的互动和系统提醒。",
    icon: Bell,
  },
];

const sexOptions = [
  { label: "男", value: 1 },
  { label: "女", value: 2 },
  { label: "保密", value: 3 },
];

const notificationItems: Array<{ key: NoticeKey; title: string; description: string }> = [
  { key: "reply", title: "评论与回复", description: "有人评论或回复你时提醒。" },
  { key: "follow", title: "关注动态", description: "关注、粉丝变化和互动提醒。" },
  { key: "system", title: "系统通知", description: "审核结果、账号安全和平台公告。" },
  { key: "message", title: "私信消息", description: "收到新的私信会展示提醒。" },
];

const profileRules: FormRules = {
  nickname: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 2, max: 20, message: "昵称长度为 2-20 个字符", trigger: "blur" },
  ],
  introduction: [{ max: 120, message: "简介最多 120 个字符", trigger: "blur" }],
};

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: "请输入当前密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 24, message: "密码长度为 6-24 个字符", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (_rule, value, callback) => {
        if (value !== passwordForm.newPassword) callback(new Error("两次输入的密码不一致"));
        else callback();
      },
      trigger: "blur",
    },
  ],
};

const hasUserInfo = computed(() => Boolean(authStore.userInfo));
const displayName = computed(() => profileForm.nickname || profileForm.username || "账号设置");
const currentTab = computed(() => settingTabs.find((item) => item.key === activeTab.value));

watch(
  () => authStore.userInfo,
  (userInfo) => {
    if (!userInfo) return;

    profileForm.uid = userInfo.uid;
    profileForm.avatar = userInfo.avatar;
    profileForm.username = userInfo.username;
    profileForm.nickname = userInfo.nickname;
    profileForm.sex = userInfo.sex ?? 0;
    profileForm.birthday = userInfo.birthday || "";
    profileForm.introduction = userInfo.introduction || "";
    clearAvatarDraft();
  },
  { immediate: true },
);

function handleAvatarChange(uploadFile: UploadFile) {
  const file = uploadFile.raw;
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    ElMessage.warning("请选择图片文件");
    return;
  }

  clearCropperSource();
  cropperSource.value = URL.createObjectURL(file);
  avatarCropperVisible.value = true;
}

async function confirmAvatarCrop() {
  if (!avatarCropperRef.value?.getCropBlob) return;

  croppingAvatar.value = true;
  try {
    const blob = await avatarCropperRef.value.getCropBlob();
    croppedAvatarFile.value = new File([blob], `avatar-${Date.now()}.png`, { type: "image/png" });

    if (avatarPreview.value.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview.value);
    }
    avatarPreview.value = URL.createObjectURL(croppedAvatarFile.value);
    avatarCropperVisible.value = false;
  } catch {
    ElMessage.error("头像裁剪失败");
  } finally {
    croppingAvatar.value = false;
  }
}

function clearCropperSource() {
  if (cropperSource.value) {
    URL.revokeObjectURL(cropperSource.value);
    cropperSource.value = "";
  }
}

function clearAvatarDraft() {
  clearCropperSource();
  if (avatarPreview.value.startsWith("blob:")) {
    URL.revokeObjectURL(avatarPreview.value);
  }
  avatarPreview.value = "";
  croppedAvatarFile.value = null;
}

function resetProfile() {
  const userInfo = authStore.userInfo;
  if (!userInfo) return;

  profileForm.avatar = userInfo.avatar;
  profileForm.username = userInfo.username;
  profileForm.nickname = userInfo.nickname;
  profileForm.sex = userInfo.sex ?? 0;
  profileForm.birthday = userInfo.birthday || "";
  profileForm.introduction = userInfo.introduction || "";
  clearAvatarDraft();
  profileFormRef.value?.clearValidate();
}

async function saveProfile() {
  if (!profileFormRef.value) return;

  await profileFormRef.value.validate(async (valid) => {
    if (!valid) return;
    savingProfile.value = true;
    try {
      const response = await updateUserInfo({
        uid: profileForm.uid,
        nickname: profileForm.nickname,
        sex: profileForm.sex,
        birthday: profileForm.birthday,
        introduction: profileForm.introduction,
        avatarFile: croppedAvatarFile.value,
      });

      if (response.code === 200 && response.data) {
        await authStore.fetchUserInfo();
        clearAvatarDraft();
        ElMessage.success("资料保存成功");
        return;
      }

      ElMessage.error(response.msg || "保存失败");
    } catch (error: any) {
      ElMessage.error(error?.response?.data?.msg || "保存失败");
    } finally {
      savingProfile.value = false;
    }
  });
}

function openPasswordDialog() {
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  passwordDialogVisible.value = true;
}

async function savePassword() {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate((valid) => {
    if (!valid) return;
    updatePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    })
      .then((response) => {
        if (response.code === 200 && response.data) {
          ElMessage.success("密码修改成功");
          passwordDialogVisible.value = false;
          return;
        }
        ElMessage.error(response.msg || "修改失败");
      })
      .catch((error: any) => {
        ElMessage.error(error?.response?.data?.msg || "修改失败");
      });
  });
}

function resetNotifications() {
  notificationForm.reply = true;
  notificationForm.follow = true;
  notificationForm.system = true;
  notificationForm.message = true;
}

function saveNotifications() {
  ElMessage.success("通知偏好已保存到当前页面状态");
}
</script>

<style scoped lang="scss">
.account-sidebar,
.account-panel {
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);

  .dark & {
    background: #1f2937;
    box-shadow: none;
  }
}

.account-sidebar {
  flex-shrink: 0;
  padding: 20px;

  @media (min-width: 1024px) {
    width: 260px;
    align-self: flex-start;
    position: sticky;
    top: 24px;
  }
}

.setting-nav-item {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  min-width: max-content;
  border-radius: 8px;
  padding: 10px 12px;
  color: #4b5563;
  background: transparent;
  transition: background-color 0.2s, color 0.2s;

  &:hover,
  &.active {
    color: #2563eb;
    background: #eff6ff;
  }

  .dark & {
    color: #d1d5db;

    &:hover,
    &.active {
      color: #93c5fd;
      background: rgba(37, 99, 235, 0.14);
    }
  }
}

.account-panel {
  padding: 24px;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f3f4f6;

  h1 {
    margin: 0;
    color: #111827;
    font-size: 24px;
    line-height: 1.2;
    font-weight: 700;
  }

  p {
    margin: 8px 0 0;
    color: #6b7280;
    font-size: 14px;
  }

  .dark & {
    border-color: #374151;

    h1 {
      color: #fff;
    }

    p {
      color: #9ca3af;
    }
  }
}

.profile-grid {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 28px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.cropper-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cropper-stage {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #111827;

  .dark & {
    border-color: #374151;
  }
}

.cropper-tools {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.security-item,
.notice-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid #f3f4f6;
  border-radius: 10px;
  padding: 18px;

  h3 {
    margin: 0;
    color: #111827;
    font-size: 15px;
    font-weight: 700;
  }

  p {
    margin: 6px 0 0;
    color: #6b7280;
    font-size: 13px;
  }

  .dark & {
    border-color: #374151;

    h3 {
      color: #fff;
    }

    p {
      color: #9ca3af;
    }
  }

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
