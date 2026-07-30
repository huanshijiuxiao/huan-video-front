<template>
  <div class="px-1 flex flex-col gap-2 h-full relative py-4">
    <router-link 
      v-for="item in navigationItems" 
      :key="item.path"
      :to="item.path"
      :class="{ 'bg-black/10': isActive(item.path, item.exact) }"
      class="w-16 rounded-[10px] py-4 cursor-pointer flex flex-col items-center justify-center hover:bg-black/10 transition-colors duration-200"
      @click="emit('navigate')"
    >
      <svg-icon :name="item.icon" :width="24" :height="24"></svg-icon>
      <span class="max-w-full block overflow-hidden text-ellipsis whitespace-nowrap text-[10px] font-normal leading-[1.4rem]">
        {{ item.label }}
      </span>
    </router-link>
    <div class="absolute bottom-12 left-1/2 transform translate-x-[-50%]">
      <ThemeToggle />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute } from "vue-router";
import { NavigationItem } from "@/types/navigation";

const route = useRoute();

const emit = defineEmits<{
  navigate: []
}>();



// 动态导航菜单数据
const navigationItems = ref<NavigationItem[]>([
  {
    label: '首页',
    path: '/',
    icon: 'home',
    exact: true // 精确匹配，只有路径完全是 '/' 时才会被认为是激活状态
  },
  {
    label: '分区',
    path: '/category',
    icon: 'category'
  },
  {
    label: '消息',
    path: '/message/whisper',
    icon: 'mail'
  },
  {
    label: '动态',
    path: '/dynamic',
    icon: 'dynamic'
  },
  {
    label: '历史记录',
    path: '/history',
    icon: 'history'
  },
]);

/**
 * 判断导航项是否处于激活状态
 * @param path - 导航项路径
 * @param exact - 是否精确匹配
 * @returns 是否激活
 */
const isActive = (path: string, exact?: boolean) => {
  if (exact) {
    return route.path === path;
  }
  // 非精确匹配时，检查当前路径是否以导航项路径开头
  return route.path.startsWith(path) && (path !== '/' || route.path === '/');
};

</script>
