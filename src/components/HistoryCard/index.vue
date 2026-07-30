<template>
  <div 
    class="flex relative group bg-white dark:bg-zinc-800 rounded-lg p-3 hover:shadow-md transition-all duration-200 border border-transparent hover:border-pink-200 dark:hover:border-pink-900"
  >
    <!-- 视频封面 -->
    <router-link 
      :to="`/video/${props.item.contentId}`"
      class="relative w-48 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-100 dark:bg-zinc-700"
    >
      <img 
        :src="props.item.picture" 
        :alt="props.item.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      
      <!-- 时长标签 -->
      <span class="absolute bottom-2 right-2 px-1.5 py-0.5 text-xs text-white bg-black bg-opacity-75 rounded">
          {{ TimeUtil.formatDuration(props.item.duration) }}
      </span>
      
      <!-- 进度条 -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-zinc-300 dark:bg-zinc-600">
        <div
          class="h-full bg-sky-500 transition-all duration-300"
          :style="{ width: `${props.item.progress}%` }"
        ></div>
      </div>
      
      <!-- 已看完标识 -->
      <div 
        v-if="props.item.progress === 100"
        class="absolute top-2 left-2 px-2 py-0.5 text-xs text-white bg-green-500 rounded-full"
      >
        已看完
      </div>
    </router-link>
    
    <!-- 视频信息 -->
    <div class="flex-1 ml-4 flex flex-col justify-between min-w-0">
      <div>
        <router-link 
          :to="`/video/${props.item.contentId}`"
          class="block"
        >
          <h3 class="text-base font-medium leading-tight mb-2 line-clamp-2 text-zinc-800 dark:text-white group-hover:text-sky-500 transition-colors">
            {{ props.item.title }}
          </h3>
        </router-link>
          <div class="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
          <span class="inline-flex items-center">
            <el-icon class="mr-1"><User /></el-icon>
            {{ props.item.authorName }}
          </span>
          
          <span class="flex items-center">
            <el-icon class="mr-1"><Clock /></el-icon>
                {{ TimeUtil.timeAgo(props.item.watchTime) }}
          </span>
        </div>
        
        <!-- 进度信息 -->
        <div class="text-xs text-zinc-400 dark:text-zinc-500">
          <span v-if="props.item.progress < 100">
            观看至 {{ Math.floor(props.item.progress) }}%
          </span>
          <span v-else>
            已看完
          </span>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex items-center gap-3 mt-2">
        <router-link 
          :to="`/video/${props.item.contentId}`"
          class="flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-pink-500 transition-colors"
        >
          <el-icon class="mr-1"><VideoPlay /></el-icon>
          {{ props.item.progress === 100 ? '重新观看' : '继续观看' }}
        </router-link>
        
        <button 
          @click="handleDelete"
          class="flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 transition-colors"
        >
          <el-icon class="mr-1"><Delete /></el-icon>
          删除
        </button>
      </div>
    </div>
  </div>
</template>
  <script setup lang="ts">
import { User, Clock, VideoPlay, Delete } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import TimeUtil from '@/utils/TimeUtil';
import { History } from '@/types/history';

const props = defineProps<{
  item: History;
}>();

const emit = defineEmits<{
  (e: 'remove', id: number): void;
}>();
/**
 * 删除历史记录
 */
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条历史记录吗？',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    emit('remove', props.item.contentId);
  } catch {
    // 用户取消删除
  }
};
</script>
  <style scoped>
/* 限制文本行数 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>