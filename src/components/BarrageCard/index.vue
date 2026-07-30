<template>
  <div class="bg-white dark:bg-zinc-800 rounded-xl p-5 shadow-sm cursor-pointer">
    <div class="border-zinc-200 dark:border-zinc-700 flex items-center justify-between" @click="toggleBarragePanel">
      <h4 class="text-base font-bold text-zinc-900 dark:text-white">弹幕列表</h4>
      <div class="flex items-center text-xs text-sky-600 dark:text-sky-400 transition-transform duration-300 hover:scale-110">
        <SvgIcon 
          :name="open ? 'arrow-up' : 'arrow-down'" 
          class="transition-transform duration-300"
          :class="{ 'rotate-180': open }"
        />
      </div>
    </div>
    <Transition
      name="slide-fade"
      mode="out-in"
    >
      <div v-if="open" class="mt-2">
        <!-- 弹幕加载中 -->
        <div class="text-center text-xs text-zinc-400 dark:text-zinc-500 py-8" v-if="loading">
          <Loading color="#409eff" scale="0.8" />
        </div>
        <div class="text-center text-xs text-zinc-400 dark:text-zinc-500 py-8" v-if="barrageList.length === 0 && !loading">
          暂无弹幕
        </div>        
        <div v-else class="max-h-96 overflow-y-auto">
          <table class="w-full text-xs table-fixed">
            <thead class="sticky top-0 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th class="px-4 py-2 text-left text-zinc-700 dark:text-zinc-300 font-medium w-1/5">时间</th>
                <th class="px-4 py-2 text-left text-zinc-700 dark:text-zinc-300 font-medium w-2/5">弹幕内容</th>
                <th class="px-4 py-2 text-left text-zinc-700 dark:text-zinc-300 font-medium">发送时间</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="barrage in barrageList" 
                :key="barrage.id" 
                class="group border-t border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                <td class="px-4 py-2 text-zinc-600 dark:text-zinc-400">
                    {{ formatBarrageTime(barrage.time ?? 0) }}
                </td>
                <td class="px-4 py-2 break-all text-zinc-800 dark:text-zinc-200 truncate" :title="barrage.text">
                  <span 
                    v-if="isOwnBarrage(barrage)" 
                    class="inline-block px-1.5 py-0.5 text-xs bg-sky-500 text-white rounded mr-1 group-hover:hidden"
                  >
                    我
                  </span>
                  {{ barrage.text }}
                </td>
                <td class="px-4 py-2 text-zinc-600 dark:text-zinc-400 text-xs">
                  <span class="group-hover:hidden">{{ TimeUtil.formatDateTime(barrage.createTime) }}</span>
                  <div class="hidden group-hover:flex gap-1 justify-end items-center">
                    <button 
                      v-if="isOwnBarrage(barrage)"
                      @click="handleDeleteBarrage(barrage)"
                      class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors text-xs px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      删除
                    </button>
                  </div>
                  

                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>

import SvgIcon from "@/components/SvgIcon.vue";
import { BarrageDTO } from "@/types/barrage";
import Loading from "@/components/Loading/index.vue";
import { ref } from "vue";
import { useAuthStore } from "@/stores/modules/auth";
import { getBarrageList,deleteBarrage } from "@/api/barrage";
import TimeUtil from "@/utils/TimeUtil";
import { ElMessage, ElMessageBox } from "element-plus";

const open = ref(false);
const authStore = useAuthStore();

const props = defineProps({
  contentId: {
    type: Number,
    required: true
  },
});

const loading = ref(false);

const barrageList = ref<BarrageDTO[]>([]);

function toggleBarragePanel() {
  open.value = !open.value;
  if (open.value && barrageList.value.length === 0) {
    fetchBarrageList();
  }
}

// 判断是否是自己的弹幕
function isOwnBarrage(barrage: BarrageDTO): boolean {
  const currentUid = authStore.getUserId;
  return !!barrage.uid && !!currentUid && barrage.uid === currentUid;
}

// 获取视频信息和弹幕列表
async function fetchBarrageList() {
  if (!props.contentId) return;
  loading.value = true;
  try {
    const res: any = await getBarrageList(props.contentId);
    
    // 检查返回的数据格式
    if (res.code === 200) {
      barrageList.value = res.data;
      
    } else {
      console.error("获取弹幕列表失败:", res.msg);
      barrageList.value = [];
    }
    loading.value = false;
  } catch (error) {
    console.error("获取弹幕列表异常:", error);
    barrageList.value = [];
  }
}


// 删除弹幕
async function handleDeleteBarrage(barrage: BarrageDTO) {
  if (!barrage.id) {
    ElMessage.error('弹幕ID不存在');
    return;
  }

  try {
    await ElMessageBox.confirm(
      '确定要删除这条弹幕吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    const res: any = await deleteBarrage(barrage.id);
    if (res.code === 200) {
      ElMessage.success('删除成功');
    } else {
      ElMessage.error(res.msg || '删除失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除弹幕失败:', error);
      ElMessage.error('删除失败，请稍后再试');
    }
  }
}

function formatBarrageTime(time: number): string {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
</script>

<style scoped>
/* 滑动淡入淡出动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* 箭头旋转动画 */
.rotate-180 {
  transform: rotate(180deg);
}

/* 表格样式优化 */
table {
  border-collapse: separate;
  border-spacing: 0;
}

/* 滚动条样式 */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}

/* 深色模式滚动条 */
.dark .max-h-96::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark .max-h-96::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style>
 import TimeUtil from '@/utils/TimeUtil';
