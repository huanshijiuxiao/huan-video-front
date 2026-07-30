<template>
  <div>
    <div class="bg-white rounded-lg shadow-sm border border-zinc-100 p-4 mb-4 space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-zinc-500 w-12 flex-shrink-0">排序</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            :class="filterButtonClass(currentSort === opt.key)"
            @click="setSortOrder(opt.key)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-zinc-500 w-12 flex-shrink-0">等级</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in levelOptions"
            :key="opt.key"
            :class="filterButtonClass(currentLevel === opt.key)"
            @click="setLevelFilter(opt.key)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-zinc-500 w-12 flex-shrink-0">粉丝</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in followerOptions"
            :key="opt.key"
            :class="filterButtonClass(currentFollower === opt.key)"
            @click="setFollowerFilter(opt.key)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Loading color="#409eff" scale="0.8" />
    </div>

    <div v-else-if="visibleUsers.length === 0" class="flex flex-col items-center justify-center py-20 text-zinc-400">
      <svg-icon name="empty-user" :width="96" :height="96" class="mb-4"></svg-icon>
      <span class="text-lg">没有找到相关用户</span>
      <span class="text-sm mt-1">试试其他关键词或调整筛选条件</span>
    </div>

    <div v-else class="space-y-3 grid md:grid-cols-2 xl:grid-cols-3  gap-4">
      <div
        v-for="user in visibleUsers" 
        :key="user.uid"
        class="flex items-center gap-4 bg-white rounded-lg p-4 border border-zinc-100 hover:shadow-sm hover:border-zinc-200 transition-all cursor-pointer mb-0"
        @click="goToUserSpace(user.uid)"
      >
        <el-avatar :src="user.avatar" :size="56" />
        <div class="flex-1 min-w-0 flex flex-col gap-2">
          
          <div class="font-medium text-zinc-800 text-base truncate">{{ user.nickname }}</div>
          <div v-if="user.introduction" class="text-sm text-zinc-400 truncate">{{ user.introduction }}</div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500">
            <span>粉丝: {{ NumberUtil.formatCount(user.follower || 0) }}</span>
            <span>关注: {{ NumberUtil.formatCount(user.following || 0) }}</span>
            <!-- <span>等级: Lv{{ user.level || 0 }}</span> -->
          </div>
          <!-- 关注 -->
          <div class="flex items-center justify-start" @click.stop>
            <button
              class="text-sm py-1 px-3 rounded-lg min-w-[72px] transition-colors disabled:cursor-not-allowed disabled:opacity-70"
              :class="isFollowed(user.uid)
                ? 'bg-sky-100 text-sky-500 hover:bg-red-50 hover:text-red-500'
                : 'bg-sky-500 hover:bg-sky-400 text-white border border-sky-500 hover:border-sky-400'"
              :disabled="relationLoading[user.uid]"
              @click.stop="handleFollow(user)"
            >
              {{ isFollowed(user.uid) ? "已关注" : "+ 关注" }}
            </button>
          </div>

        </div>
      </div>
    </div>

    <Pagination
      v-if="userPage.pages > 1"
      :pageNum="userPage.current"
      :pageSize="userPage.size"
      :pages="userPage.pages"
      :total="userPage.total"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import Loading from "@/components/Loading/index.vue";
import { ElMessage } from "element-plus";
import Pagination from "@/components/Pagination/index.vue";
import { searchUser } from "@/api/search";
import { getRelation, modifyRelation } from "@/api/relation";
import NumberUtil from "@/utils/NumberUtil";
import type { UserInfo } from "@/types/user";
import type { Relation } from "@/types/relation";
import { useAuthStore } from "@/stores/modules/auth";
import { useLoginDialog } from "@/components/LoginRegisterDialog/useLoginDialog";

const props = defineProps<{
  keyword: string;
}>();

const authStore = useAuthStore();
const { showLoginDialog } = useLoginDialog();
const userResult = ref<UserInfo[]>([]);
const loading = ref(false);
const relationMap = reactive<Record<number, Relation | null>>({});
const relationLoading = reactive<Record<number, boolean>>({});
const userPage = reactive({
  current: 1,
  size: 20,
  total: 0,
  pages: 0,
});

const sortOptions = [
  { key: "", label: "默认排序" },
  { key: "follower-desc", label: "粉丝数由高到低" },
  { key: "follower-asc", label: "粉丝数由低到高" },
  { key: "level-desc", label: "等级由高到低" },
  { key: "level-asc", label: "等级由低到高" },
];
const currentSort = ref("");

const levelOptions = [
  { key: "", label: "全部" },
  { key: "lv1", label: "Lv1+" },
  { key: "lv3", label: "Lv3+" },
  { key: "lv5", label: "Lv5+" },
];
const currentLevel = ref("");
const levelMap: Record<string, number> = {
  lv1: 1,
  lv3: 3,
  lv5: 5,
};

const followerOptions = [
  { key: "", label: "全部" },
  { key: "under100", label: "100以下" },
  { key: "100to1000", label: "100-1000" },
  { key: "over1000", label: "1000以上" },
];
const currentFollower = ref("");
const followerMap: Record<string, { min?: number; max?: number }> = {
  under100: { max: 99 },
  "100to1000": { min: 100, max: 1000 },
  over1000: { min: 1000 },
};

const visibleUsers = computed(() => {
  const followerRange = followerMap[currentFollower.value] || {};
  const levelMin = levelMap[currentLevel.value] || 0;

  const filtered = userResult.value.filter((user) => {
    const follower = user.follower || 0;
    const level = user.level || 0;

    if (level < levelMin) return false;
    if (followerRange.min !== undefined && follower < followerRange.min) return false;
    if (followerRange.max !== undefined && follower > followerRange.max) return false;

    return true;
  });

  if (!currentSort.value) {
    return filtered;
  }

  return [...filtered].sort((a, b) => {
    const left = getSortableValue(a, currentSort.value);
    const right = getSortableValue(b, currentSort.value);
    return right - left;
  });
});

function filterButtonClass(active: boolean) {
  return [
    "px-4 py-1.5 text-sm rounded-full transition-colors border",
    active ? "bg-sky-50 text-sky-600 border-sky-200" : "text-zinc-600 hover:bg-zinc-50 border-transparent",
  ];
}

function getSortableValue(user: UserInfo, key: string) {
  if (key === "follower") return user.follower || 0;
  if (key === "level") return user.level || 0;
  if (key === "dynamicCount") return user.dynamicCount || 0;
  return 0;
}

function setSortOrder(key: string) {
  currentSort.value = key;
  userPage.current = 1;
  fetchUsers();
}

function setLevelFilter(key: string) {
  currentLevel.value = key;
  userPage.current = 1;
  fetchUsers();
}

function setFollowerFilter(key: string) {
  currentFollower.value = key;
  userPage.current = 1;
  fetchUsers();
}

async function fetchUsers() {
  if (!props.keyword) {
    userResult.value = [];
    return;
  }

  loading.value = true;

  try {
    const followerRange = followerMap[currentFollower.value] || {};
    const res = await searchUser({
      keyword: props.keyword,
      page: userPage.current,
      size: userPage.size,
      orderBy: currentSort.value || undefined,
      orderDir: currentSort.value ? "desc" : undefined,
      followerMin: followerRange.min,
      followerMax: followerRange.max,
      levelMin: levelMap[currentLevel.value] || undefined,
    });

    if (res.code === 200) {
      userResult.value = res.data.records || [];
      userPage.current = res.data.current;
      userPage.total = res.data.total;
      userPage.pages = res.data.pages;
      userPage.size = res.data.size;
      await fetchRelations(userResult.value);
    }
  } catch (error) {
    console.error("搜索用户失败:", error);
  } finally {
    loading.value = false;
  }
}

async function fetchRelations(users: UserInfo[]) {
  Object.keys(relationMap).forEach((key) => {
    delete relationMap[Number(key)];
  });

  if (!authStore.isAuthenticated) return;

  await Promise.all(
    users
      .filter((user) => !isSelf(user.uid))
      .map(async (user) => {
        try {
          const res = await getRelation(user.uid);
          if (res.code === 200) {
            relationMap[user.uid] = res.data;
          }
        } catch {
          relationMap[user.uid] = null;
        }
      }),
  );
}

function isSelf(uid: number) {
  return authStore.getUserId === uid;
}

function isFollowed(uid: number) {
  return relationMap[uid]?.attribute === 1;
}

async function handleFollow(user: UserInfo) {
  if (!authStore.isAuthenticated) {
    showLoginDialog({
      initialTab: "login",
      onLogin: async () => {
        await authStore.fetchUserInfo();
        await fetchRelations(userResult.value);
      },
    });
    return;
  }

  if (isSelf(user.uid) || relationLoading[user.uid]) {
    ElMessage.warning("无法关注自己或操作过于频繁");
    return;
  }

  relationLoading[user.uid] = true;
  const followed = isFollowed(user.uid);

  try {
    const res = await modifyRelation({ fid: user.uid, act: followed ? 2 : 1 });
    if (res.code === 200) {
      relationMap[user.uid] = res.data;
      user.follower = Math.max(0, (user.follower || 0) + (followed ? -1 : 1));
      ElMessage.success(followed ? "已取消关注" : "关注成功");
      return;
    }

    ElMessage.error(res.msg || "操作失败");
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || "操作失败");
  } finally {
    relationLoading[user.uid] = false;
  }
}

function handlePageChange(page: number) {
  userPage.current = page;
  fetchUsers();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goToUserSpace(uid: number) {
  window.open(`/space/${uid}`, "_blank");
}

watch(
  () => props.keyword,
  () => {
    userPage.current = 1;
    fetchUsers();
  },
  { immediate: true }
);
</script>
