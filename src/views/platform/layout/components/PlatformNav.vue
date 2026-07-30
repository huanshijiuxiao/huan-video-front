<template>
  <div class="h-14 px-4 flex items-center justify-between">
    <!-- 左侧导航 -->
    <div class="flex items-center flex-shrink-0 mr-4">
      <div class="h-16 leading-16 text-zinc-700 dark:text-zinc-300 text-lg font-semibold cursor-pointer">
        <span>创作中心</span>
      </div>
      <!-- 主站 -->
      <div class="h-16 leading-16 text-zinc-700 dark:text-zinc-300 text-sm cursor-pointer ml-4">
        <router-link to="/" target="_blank">
          <span>主站</span>
        </router-link>
      </div>
    </div>


    <!-- 右侧菜单 -->
    <div class="flex items-center gap-3">
      
      <NavUserCard manager-path="/platform/upload/video" :show-account-setting="false" />
    </div>
  </div>
</template>
<script setup lang="ts">
import NavUserCard from '@/components/NavUserCard/index.vue';
</script>

<style scoped lang="scss">



</style>
