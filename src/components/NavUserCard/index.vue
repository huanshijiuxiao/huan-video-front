<template>
  <div>
    <div v-if="!userInfo">
      <el-button
        type="text"
        class="text-zinc-500 hover:text-sky-500 transition-colors duration-200"
        @click="login"
      >
        登录
      </el-button>
    </div>
    <div v-else class="relative group flex items-center">
      <router-link 
        :to="`/space/${userInfo.uid}`" 
        target="_blank" 
        class="avatar-img" :style="{ backgroundImage: `url(${userInfo.avatar})` }">
      </router-link>

      <!-- 用户信息下拉菜单 -->
      <div class="absolute right-0 top-full pt-3 z-50 hidden group-hover:block w-[300px]">
        <div class="bg-zinc-100 p-4 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden">
          <div class="flex items-center gap-4 mb-4">
            <h3 class="text-xl text-zinc-900 dark:text-white truncate cursor-pointer transition-colors mb-1">
              {{ userInfo.nickname }}
            </h3>
          </div>

          <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="flex items-center flex-col text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 rounded-lg py-3 cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-900 transition-colors">
              <div class="text-black dark:text-white font-bold text-xl">{{ NumberUtil.formatCount(userInfo.follower || 0) }}</div>
              <div>粉丝</div>
            </div>
            <div class="flex items-center flex-col text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 rounded-lg py-3 cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-900 transition-colors">
              <div class="text-black dark:text-white font-bold text-xl">{{ NumberUtil.formatCount(userInfo.following || 0) }}</div>
              <div>关注</div>
            </div>
            <div class="flex items-center flex-col text-xs text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 rounded-lg py-3 cursor-pointer hover:bg-zinc-300 dark:hover:bg-zinc-900 transition-colors">
              <div class="text-black dark:text-white font-bold text-xl">{{ NumberUtil.formatCount(userInfo.dynamicCount || 0) }}</div>
              <div>动态</div>
            </div>
          </div>

          <div class="bg-white dark:bg-zinc-800 rounded-lg p-2 flex flex-col gap-1">
            <button
              @click="goPersonalSpace"
              class="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-medium whitespace-nowrap"
            >
              个人空间
            </button>
            <button
              @click="goManager"
              class="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-medium whitespace-nowrap"
            >
              投稿管理
            </button>
            <button
              v-if="showAccountSetting"
              @click="goAccountSetting"
              class="w-full px-4 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors font-medium whitespace-nowrap"
            >
              账号设置
            </button>
            <button
              @click="authStore.logout()"
              class="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium whitespace-nowrap"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLoginDialog } from '@/components/LoginRegisterDialog/useLoginDialog';
import { useAuthStore } from '@/stores/modules/auth';
import NumberUtil from '@/utils/NumberUtil';

const props = withDefaults(defineProps<{
  managerPath?: string;
  showAccountSetting?: boolean;
}>(), {
  managerPath: '/platform/upload-manager/article',
  showAccountSetting: true,
});

const authStore = useAuthStore();
const userInfo = computed(() => authStore.userInfo);
const { showLoginDialog } = useLoginDialog();

function login() {
  showLoginDialog({
    initialTab: 'login',
  });
}

function goPersonalSpace() {
  window.open(`/space/${userInfo.value?.uid}`, '_blank');
}

function goManager() {
  window.open(props.managerPath, '_blank');
}

function goAccountSetting() {
  window.open('/account/setting', '_blank');
}
</script>

<style scoped lang="scss">
.avatar-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}
.avatar-img:hover {
  transform: scale(1.2);
}
</style>
