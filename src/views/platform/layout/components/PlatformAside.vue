<template>
  <div class="platform-aside flex flex-col h-full select-none">
    <nav class="pa-nav">
      <div class="flex flex-col items-center justify-center py-4">
        <button
          @click="router.push('/platform/upload/video')"
          class="mx-auto w-2/3 text-center px-4 py-2 text-sm bg-sky-600/80 text-white hover:bg-sky-400 transition-colors font-medium whitespace-nowrap rounded"
        >
          投稿
        </button>
      </div>

      <template v-for="item in filteredNavItems" :key="item.path || item.label">
        <div
          v-if="!item.children"
          class="nav-item"
          :class="{ 'nav-item-active': isActive(item.path || '', item.exact) }"
          @click="navigateTo(item)"
          :title="item.label"
        >
          <div class="icon-wrap">
            <svg-icon :name="item.icon" :width="22" :height="22"></svg-icon>
          </div>
          <span class="nav-label" :class="{ 'font-semibold': isActive(item.path || '', item.exact) }">
            {{ item.label }}
          </span>
        </div>

        <div v-else class="flex flex-col">
          <div
            class="nav-item"
            :class="{ 'nav-item-active': isGroupActive(item) }"
            @click="toggleGroup(item)"
            :title="item.label"
          >
            <div class="icon-wrap" :class="{ 'icon-wrap-active': isGroupActive(item) }">
              <svg-icon :name="item.icon || 'category'" :width="22" :height="22"></svg-icon>
            </div>
            <span class="nav-label" :class="{ 'font-semibold': isGroupActive(item) }">
              {{ item.label }}
            </span>
            <svg-icon
              name="arrow-down"
              :width="22"
              :height="22"
              class="ml-auto transition-transform duration-200"
              :class="{ 'transform rotate-180': isExpanded(item) }"
            ></svg-icon>
          </div>

          <Transition name="submenu">
            <div v-if="isExpanded(item)" class="submenu-container">
              <div
                v-for="child in item.children"
                :key="child.label"
                class="submenu-item"
                :class="{ 'submenu-item-active': isActive(child.path || '', child.exact) }"
                @click="navigateTo(child)"
                :title="child.label"
              >
                <span class="submenu-label">{{ child.label }}</span>
              </div>
            </div>
          </Transition>
        </div>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/modules/auth";
import { NavigationItem } from "@/types/navigation";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// 💡 优化 1：静态配置无需用 ref 包裹，避免不必要的响应式追踪开销
const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: '首页', path: '/platform', icon: 'home', exact: true },
  {
    label: '内容管理',
    path: '/platform/upload-manager',
    icon: 'category',
    children: [
      { label: '稿件管理', path: '/platform/upload-manager/article', icon: 'doc' },
      { label: '申诉管理', path: '/platform/upload-manager/appeal', icon: 'mail' },
    ],
  },
  { 
    label: '互动管理',
    path: '/platform/interaction',
    icon: 'mail', 
    children: [
      { label: '评论管理', path: '/platform/interaction/comment', icon: 'mail' },
      { label: '弹幕管理', path: '/platform/interaction/barrage', icon: 'barrage' },
    ],
  },
  { label: '数据统计', path: '/platform/data', icon: 'coin' },
  { 
    label: '审核管理',
    path: '/platform/audit',
    icon: 'history',
    adminOnly: true,
    children: [
      { label: '视频审核', path: '/platform/audit/video' },
      { label: '评论审核', path: '/platform/audit/comment' }
    ]
  },
];

const expandedGroups = ref<Set<string>>(new Set());

// 💡 优化 2：解决上一轮修改带来的副作用死循环，采用“纯函数”过滤
const filteredNavItems = computed(() => {
  const isAdmin = authStore.isAdmin;
  return NAVIGATION_ITEMS
    .filter(item => !item.adminOnly || isAdmin)
    .map(item => {
      if (item.children) {
        return {
          ...item,
          children: item.children.filter(child => !child.adminOnly || isAdmin)
        };
      }
      return item;
    });
});

// 💡 优化 3：将原本只在初始化执行一次的 IIFE 改为 watch 监听。
// 这样即使外部路由跳转，对应的侧边栏分组也能自动展开。
watch(
  () => route.path,
  (newPath) => {
    const next = new Set(expandedGroups.value);
    for (const item of NAVIGATION_ITEMS) {
      if (item.children && item.children.some(child => newPath.startsWith(child.path || ''))) {
        next.add(item.path || item.label);
      }
    }
    expandedGroups.value = next;
  },
  { immediate: true }
);

const isExpanded = (item: NavigationItem): boolean => {
  return expandedGroups.value.has(item.path || item.label);
};

const toggleGroup = (item: NavigationItem) => {
  const key = item.path || item.label;
  const next = new Set(expandedGroups.value);
  next.has(key) ? next.delete(key) : next.add(key);
  expandedGroups.value = next;
};

const isActive = (path: string, exact?: boolean): boolean => {
  if (exact) return route.path === path;
  return route.path.startsWith(path) && path !== '/platform';
};

const isGroupActive = (item: NavigationItem): boolean => {
  if (!item.children) return false;
  return item.children.some(child => isActive(child.path || '', child.exact));
};

const navigateTo = (item: NavigationItem) => {
  if (item.onClick) {
    item.onClick();
    return;
  }
  if (item.path) {
    router.push(item.path);
  }
};
</script>

<style>
@reference "tailwindcss";

.platform-aside {
  @apply flex flex-col h-full select-none;
}

.pa-nav {
  @apply flex-1 overflow-y-auto overflow-x-hidden space-y-0.5 px-1;
  -ms-overflow-style: none; 
  scrollbar-width: none; 
}
.pa-nav::-webkit-scrollbar { 
  display: none; 
}

/* ─── 导航项 ─── */
.nav-item {
  @apply relative flex flex-row items-center gap-4 pl-8 py-2.5 cursor-pointer select-none;
  @apply text-zinc-600 dark:text-zinc-400;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.nav-item:hover {
  @apply bg-zinc-50 dark:bg-white/5;
  transform: scale(1.02); 
}
.nav-item:active {
  transform: scale(0.98) !important;
}

.nav-item-active {
  @apply text-sky-600/80;
}
.nav-item-active:hover {
  @apply bg-sky-50/80 dark:bg-sky-900/20;
}


.nav-label {
  @apply max-w-full block overflow-hidden text-ellipsis whitespace-nowrap text-base leading-tight font-medium;
  letter-spacing: 0.02em;
}

/* ─── 子菜单 ─── */
.submenu-container {
  @apply overflow-hidden flex flex-col items-center gap-2 transition-all duration-150; 
}

.submenu-item {
  @apply relative flex flex-row items-center justify-center gap-1 px-1 py-2.5 cursor-pointer select-none w-full;
  @apply text-zinc-400;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.submenu-item:hover {
  @apply bg-zinc-50 dark:bg-white/5;
}
.submenu-item:active {
  transform: scale(0.97);
}

.submenu-item-active {
  @apply text-sky-600/80 dark:text-sky-500 font-medium;
}

.submenu-label {
  @apply text-base leading-tight truncate;
}
</style>

<style scoped>
.submenu-enter-active {
  animation: submenu-in 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.submenu-leave-active {
  animation: submenu-out 0.15s ease-in;
}

@keyframes submenu-in {
  from { opacity: 0; transform: translateY(-6px) scaleY(0.95); max-height: 0; }
  to   { opacity: 1; transform: translateY(0) scaleY(1); max-height: 200px; }
}
@keyframes submenu-out {
  from { opacity: 1; transform: translateY(0) scaleY(1); max-height: 200px; }
  to   { opacity: 0; transform: translateY(-4px) scaleY(0.95); max-height: 0; }
}
</style>