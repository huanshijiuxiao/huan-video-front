<template>
  <div class="h-14 px-4 flex items-center justify-between">
    <!-- 左侧导航 -->
    <div class="flex items-center flex-shrink-0 mr-4">
      <div @click="emit('openSidebar')" class="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer" v-if="showSidebarTrigger">
        <svg-icon name="menu" :height="24" :width="24"></svg-icon>
      </div>
      <div class="h-16 leading-16 text-zinc-700 dark:text-zinc-300 text-sm cursor-pointer">
        <router-link to="/">
          <svg-icon name="logo" :height="60" :width="60"></svg-icon>
        </router-link>
      </div>
    </div>

    <!-- 中间搜索框 -->
    <SearchInput></SearchInput>

    <!-- 右侧菜单 -->
    <div class="flex items-center gap-3">
      <NavUserCard />
      <el-button type="primary" round>
        <router-link to="/platform/upload/video" target="_blank">投稿</router-link>
      </el-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import NavUserCard from '@/components/NavUserCard/index.vue';
import SearchInput from '@/components/search/SearchInput.vue';

defineProps<{
  showSidebarTrigger?: boolean
}>();

const emit = defineEmits<{
  openSidebar: []
}>();
</script>

<style scoped lang="scss">



</style>
