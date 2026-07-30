<template>
    <div>
      <div class="flex mx-auto pt-2 h-[calc(100vh-64px)] text-zinc-700 dark:text-zinc-200">
        <div class="w-[140px] min-w-[140px] bg-white/85 dark:bg-zinc-950/80 border-r border-white/70 dark:border-zinc-800 shadow-sm dark:shadow-black/20 backdrop-blur">
          <div class="w-full text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            <div class="h-[62px] flex justify-center items-center text-zinc-700 dark:text-zinc-300">
              <svg-icon name="message-send" :width="16" :height="16" class="mr-2.5"></svg-icon>
              <span>消息中心</span>
            </div>
            <ul class="m-0 pl-5">
              <li 
                v-for="(item, index) in routerList" 
                :key="index" 
                class="h-10 flex items-center relative cursor-pointer  hover:text-sky-600 dark:hover:text-sky-500 transition-colors"
                :class="routerIndex === index ?'text-sky-600 dark:text-sky-500' : 'text-zinc-500 dark:text-zinc-400'"
                @click="navigateTo(item.path)"
              >
                <span class="text-[9px] mr-2.5">&#9679;</span>
                <div class="pl-2.5 flex-1 font-semibold relative">
                  {{ item.name }}
                  <span 
                    v-if="unreadCount && unreadCount[index] > 0" 
                    class="absolute right-3 top-3 h-4 min-w-[28px] text-xs bg-red-500 text-white rounded-full text-center leading-4"
                  >
                    {{ unreadCount[index] <= 99 ? unreadCount[index] : '99+' }}
                  </span>
                </div>
              </li>
            </ul>
            <div class="border-t border-zinc-200/80 dark:border-zinc-800 my-2.5"></div>
            <div class="pl-5 relative">
              <div 
                class="h-10 flex items-center cursor-pointer text-zinc-500 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-500 transition-colors"
                :class="{'text-sky-600 dark:text-sky-500': routerIndex === 5}"
                @click="navigateTo('/message/config')"
              >
                <svg-icon name="settings" :width="12" :height="12" class="mr-2"></svg-icon>
                消息设置
              </div>
            </div>
          </div>
        </div>
        <div class="flex-1 flex flex-col bg-white/50 dark:bg-zinc-950/60">
          <div class="p-2.5 pt-2.5 z-10">
            <div class="h-[42px] bg-white/95 dark:bg-zinc-900/95 border border-white/80 dark:border-zinc-800 shadow-[0_2px_4px_0_rgba(121,146,185,0.32)] dark:shadow-black/20 flex items-center justify-between px-4 text-sm text-zinc-600 dark:text-zinc-200 rounded backdrop-blur">
              <span>{{ routerList[routerIndex]?.name || "消息设置" }}</span>
            </div>
          </div>
          <div class="p-2.5 relative flex-1 h-[calc(100%-66px)] overflow-hidden">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </template>
  
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// 路由相关
const router = useRouter();
const route = useRoute();
let previousBodyStyle = "";
let previousAppStyles: string[] = [];
// 定义路由列表
const routerList = [
{ path: '/message/whisper', name: '我的消息' },
{ path: '/message/reply', name: '回复我的' },
{ path: '/message/at', name: '@ 我的' },
{ path: '/message/love', name: '收到的赞' },
{ path: '/message/system', name: '系统通知' },
];
// 计算当前路由索引
const routerIndex = computed(() => {
const index = routerList.findIndex(item => route.path.startsWith(item.path));
console.log('当前路由索引:', index, '当前路由路径:', route.path);
return index === -1 ? 0 : index;
});
// 导航方法
const navigateTo = (path: string) => {
router.push(path);
};
// 未读消息数量
const unreadCount = ref([])

// 组件挂载后
onMounted(() => {
  previousBodyStyle = document.body.style.cssText;
  const apps = document.querySelectorAll('#app');
  previousAppStyles = Array.from(apps).map(element => (element as HTMLElement).style.cssText);
  // 设置背景图
  // const backgroundImage = new URL('@/assets/images/message-bg.png', import.meta.url).href;
  // document.body.style.cssText = `background: url(${backgroundImage}) top/cover no-repeat fixed;`;

  // 设置app背景透明
  // apps.forEach(element => {
  //     (element as HTMLElement).style.cssText = 'background-color: transparent;';
  // });

});

onBeforeUnmount(() => {
  document.body.style.cssText = previousBodyStyle;
  document.querySelectorAll('#app').forEach((element, index) => {
      (element as HTMLElement).style.cssText = previousAppStyles[index] || "";
  });
});
</script>
