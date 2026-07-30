<template>
  <div class="max-w-[1400px] mx-auto px-4 py-6">

    <template v-if="userInfo">

      <div class="pt-4 mb-6">
        <div class="flex gap-5 items-center">
          <!-- Avatar -->
          <div class="flex-shrink-0 ">
            <img
              :src="userInfo.avatar"
              width="96"
              height="96"
              class="border-4 border-white dark:border-zinc-800 shadow-md rounded-full object-cover"
            />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0 pt-2">
            <div class="flex items-center gap-3 mb-1">
              <h1 class="text-xl font-bold text-zinc-800 dark:text-white truncate">
                {{ userInfo.nickname || userInfo.username }}
              </h1>
            </div>

            <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-1">
              <template v-if="userInfo.introduction">{{ userInfo.introduction }}</template>
              <template v-else class="text-zinc-400">这个用户很懒，什么都没留下～</template>
            </p>

            

            
          </div>
          <div class="flex-shrink-0 pt-2  ">
            <!-- Stats -->
            <div class="flex items-center justify-center gap-6 mb-3">
              <div class="text-center">
                <div class="text-sm font-semibold text-zinc-800 dark:text-white">{{ NumberUtil.formatCount(videoCount) }}</div>
                <div class="text-xs text-zinc-400 dark:text-zinc-500">投稿</div>
              </div>
              <div class="text-center">
                <div class="text-sm font-semibold text-zinc-800 dark:text-white">{{ NumberUtil.formatCount(userInfo.follower || 0) }}</div>
                <div class="text-xs text-zinc-400 dark:text-zinc-500">粉丝</div>
              </div>
              <div class="text-center">
                <div class="text-sm font-semibold text-zinc-800 dark:text-white">{{ NumberUtil.formatCount(userInfo.following || 0) }}</div>
                <div class="text-xs text-zinc-400 dark:text-zinc-500">关注</div>
              </div>
              <div class="text-center sm:block">
                <div class="text-sm font-semibold text-zinc-800 dark:text-white">{{ NumberUtil.formatCount(userInfo.coins || 0) }}</div>
                <div class="text-xs text-zinc-400 dark:text-zinc-500">硬币</div>
              </div>
            </div>
            <!-- Actions -->
            <div class="flex items-center gap-2">
              <template v-if="!isOwner">
                <div v-if="followRelation?.attribute === 1" class="relative group">
                  <button
                    disabled
                    class="inline-flex items-center gap-1 px-5 py-1.5 bg-sky-600/80 text-white text-xs font-medium  transition-colors"
                  >
                    <el-icon :size="14"><Check /></el-icon>
                    已关注
                  </button>
                  <div class="absolute top-full w-full z-10 pt-1 hidden group-hover:block">
                    <div class="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg shadow-lg py-1 overflow-hidden min-w-[100px]">
                      <button
                        @click="handleFollow(2)"
                        class="w-full px-3 py-1.5 text-center text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium whitespace-nowrap"
                      >
                        取消关注
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  v-else
                  @click="handleFollow(1)"
                  class="inline-flex items-center gap-1 px-5 py-1.5 bg-sky-500 text-white text-xs font-medium hover:bg-sky-600/80 transition-colors"
                >
                  <el-icon :size="14"><Plus /></el-icon>
                  关注
                </button>
              </template>
              
              <!-- 发消息按钮 -->
              <div>
                <button
                  @click="$router.push({ path: '/message/whisper/' + userInfo.uid })"
                  class="inline-flex items-center gap-1 px-5 py-1.5 bg-sky-500 text-white text-xs font-medium hover:bg-sky-600/80 transition-colors"
                >
                  <svg-icon name="mail" :height="20" :width="20"></svg-icon>
                  发消息
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <!-- ===== Tabs ===== -->
      <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-sm px-6 py-0 mb-6">
        <div class="flex gap-1">
          <router-link
            v-for="tab in tabs"
            :key="tab.name"
            :to="{name : tab.name}"
            @click="switchTab(tab.name)"
            class="relative px-4 py-3 text-[16px] font-medium transition-colors duration-200"
            :class="activeTab === tab.name ? 'text-sky-500' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'"
          >
            {{ tab.label }}
            <Transition name="tab-underline">
              <div
                v-if="activeTab === tab.name"
                :key="activeTab"
                class="absolute bottom-0 left-3 right-3 h-1 rounded-full bg-sky-500"
              ></div>
            </Transition>
          </router-link>
        </div>
      </div>
      <router-view></router-view>
    </template>

    <div v-else-if="!loading" class="flex flex-col items-center justify-center py-20 text-zinc-400">
      <svg-icon name="empty-user" :width="80" :height="80" class="mb-3"></svg-icon>
      <span class="text-sm">用户不存在</span>
      <router-link to="/" class="text-xs text-sky-500 hover:text-sky-600 mt-2">返回首页</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import {  Check, Plus } from '@element-plus/icons-vue';
import { getUserInfo } from '@/api/user';
import { listUserVideos } from '@/api/space';
import { getRelation, modifyRelation } from '@/api/relation';
import { useAuthStore } from '@/stores/modules/auth';
import NumberUtil from '@/utils/NumberUtil';
import { ElMessage } from 'element-plus';
import type { UserInfo } from '@/types/user';
import type { Relation } from '@/types/relation';
import { useLoginDialog } from '@/components/LoginRegisterDialog/useLoginDialog';


const route = useRoute();
const authStore = useAuthStore();
const { showLoginDialog } = useLoginDialog();

// State
const loading = ref(true);
const userInfo = ref<UserInfo | null>(null);
const followRelation = ref<Relation | null>(null);
const videoCount = ref(0);

// Tabs
const activeTab = ref('SpaceHome');
const tabs = [
  { name: 'SpaceHome', label: '主页' },
  { name: 'SpaceVideo', label: '投稿' },
  { name: 'SpaceFavList', label: '收藏' },
  { name: 'SpaceFollowing', label: '关注' },
  { name: 'SpaceFollowers', label: '粉丝' },
];

// Computed
const isOwner = computed(() => {
  if (!authStore.isAuthenticated) return false;
  return authStore.getUserId === userInfo.value?.uid;
});

// Methods
async function fetchUserInfo() {
  loading.value = true;
  try {
    const uid = route.params.uid ? Number(route.params.uid) : null;
    const finalUid = uid || authStore.getUserId;
    if (!finalUid) { loading.value = false; return; }

    const res = await getUserInfo(finalUid);
    if (res.code === 200 && res.data) {
      userInfo.value = res.data;
      try {
        const videoRes: any = await listUserVideos({ uid: finalUid, pageNum: 1, pageSize: 1 });
        if (videoRes.code === 200) videoCount.value = videoRes.data?.total || 0;
      } catch { /* keep the profile available if statistics fail */ }
      await checkFollow();
    }
  } catch {
    ElMessage.error('获取用户信息失败');
  } finally {
    loading.value = false;
  }
}
async function checkFollow() {
  if (!authStore.isAuthenticated || isOwner.value || !userInfo.value?.uid) return;
  try {
    const res = await getRelation(userInfo.value.uid);
    if (res.code === 200) followRelation.value = res.data;
  } catch { /* ignore */ }
}

const requestLoginThen = (action: () => void | Promise<void>) => {
  showLoginDialog({
    initialTab: 'login',
    onLogin: async () => {
      await action();
    },
  });
};

async function handleFollow(act: number) {
  if (!authStore.isAuthenticated) {
    requestLoginThen(() => handleFollow(act));
    return;
  }

  try {
    const res = await modifyRelation({ fid: userInfo.value?.uid, act });
    if (res.code === 200) followRelation.value = res.data;
    else ElMessage.error(res.msg || '操作失败');
  } catch { /* ignore */ }
}

function switchTab(tabKey: string) {
  activeTab.value = tabKey;
}


onMounted(fetchUserInfo);
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tab-underline-enter-active,
.tab-underline-leave-active {
  transition: opacity .2s ease, transform .25s ease;
}

.tab-underline-enter-from {
  opacity: 0;
  transform: translateX(10px) scaleX(.65);
}

.tab-underline-leave-to {
  opacity: 0;
  transform: translateX(-10px) scaleX(.65);
}
</style>
