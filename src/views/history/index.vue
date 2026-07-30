<template>
  <div class="container mx-auto px-4 mt-6">
    <div class="flex sm:flex-col md:flex-row gap-6">      
      <!-- 历史记录列表 -->
      <div class="flex-1 min-w-0">
        <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
          <!-- 标题和统计 -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <h2 class="text-xl font-bold text-zinc-800 dark:text-white">观看历史</h2>
              <span class="text-sm text-zinc-500 dark:text-zinc-400">共 {{ pagination.total }} 条记录</span>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex items-center gap-2">
              <el-button 
                v-if="historyList.length > 0"
                size="small" 
                type="danger"
                plain
                @click="handleClearAll"
              >
                清空全部
              </el-button>
            </div>
          </div>
          
          <!-- 空状态 -->
          <el-empty 
            v-if="historyList.length === 0 && !loading" 
            description="暂无历史记录"
            :image-size="120"
          />
          
          <!-- 加载中 -->
          <!-- 加载中 - 骨架屏 -->
          <div v-if="loading" class="timeline-container">
            <div v-for="n in 3" :key="n" class="timeline-item">
              <div class="timeline-time">
                <div class="h-3 w-16 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse"></div>
              </div>
              <div class="timeline-line">
                <div class="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-pulse"></div>
                <div v-if="n < 3" class="absolute top-6 w-0.5 h-[calc(100%+24px)] bg-zinc-200 dark:bg-zinc-700"></div>
              </div>
              <div class="timeline-content">
                <HistoryCardSkeleton />
              </div>
            </div>
          </div>
            <!-- 历史记录列表 - 时间轴样式 -->
          <template v-else-if="historyList.length > 0">
            <div class="timeline-container">
              <div 
                v-for="(item, index) in historyList"
                :key="item.id || index"
                class="timeline-item"
              >
                <!-- 时间标签 -->
                <div class="timeline-time">
                  <span class="time-text">{{ TimeUtil.timeAgo(item.watchTime) }}</span>
                </div>
                
                <!-- 时间线 -->
                <div class="timeline-line">
                  <div class="timeline-dot"></div>
                  <div v-if="index < historyList.length - 1" class="timeline-connector"></div>
                </div>
                
                <!-- 内容卡片 -->
                <div class="timeline-content">
                  <HistoryCard 
                    :item="item"
                    @remove="removeHistory(item.id)"
                  />
                </div>
              </div>
            </div>
            
            <!-- 加载更多提示 -->
            <div v-if="loadingMore" class="flex justify-center py-6">
              <Loading color="409eff" scale="0.8" />
            </div>
            
            <!-- 没有更多数据提示 -->
            <div v-else-if="!hasMore" class="text-center py-6 text-zinc-400 text-sm">
              没有更多历史记录了
            </div>
            
            <!-- 滚动加载触发器 -->
            <div ref="loadMoreTrigger" class="h-4"></div>
          </template>
        </div>
      </div>
      
      <!-- 筛选器 -->
      <!-- <HistoryFilter
        v-model:contentType="filter.contentType"
        v-model:timeRange="filter.timeRange"
        v-model:startDate="filter.startDate"
        v-model:endDate="filter.endDate"
        @filter-change="handleFilterChange"
      /> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
// import HistoryFilter from './components/HistoryFilter.vue';
import HistoryCard from '@/components/HistoryCard/index.vue';
import HistoryCardSkeleton from '@/components/HistoryCard/HistoryCardSkeleton.vue';
import { HistoryFilterItem, History } from '@/types/history';
import { getHistoryList, deleteHistory, clearAllHistory } from '@/api/history'; 
import { useAuthStore } from '@/stores/modules/auth';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useLoginDialog } from '@/components/LoginRegisterDialog/useLoginDialog';
import TimeUtil from '@/utils/TimeUtil.ts';
import Loading from '@/components/Loading/index.vue';

const historyList = ref<History[]>([]);
const loading = ref(false);
const loadingMore = ref(false);
const hasMore = ref(true);
const loadMoreTrigger = ref<HTMLElement | null>(null);
const authStore = useAuthStore();
const { showLoginDialog } = useLoginDialog();

const filter = reactive<HistoryFilterItem>({
  contentType: 1,
  timeRange: 'all',
  keyword: '',
  startDate: undefined,
  endDate: undefined
});

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  pages: 1,
  total: 0
});

const requestLoginThen = (action: () => void | Promise<void>) => {
  showLoginDialog({
    initialTab: 'login',
    onLogin: async () => {
      await action();
    },
  });
};

/**
 * 获取历史记录列表
 */
async function fetchHistoryList(isLoadMore = false) {
  try {
    if (!authStore.isAuthenticated) {
      requestLoginThen(() => fetchHistoryList(isLoadMore));
      return;
    }
    
    // 如果是加载更多，检查是否还有数据
    if (isLoadMore) {
      if (!hasMore.value || loadingMore.value) return;
      loadingMore.value = true;
    } else {
      loading.value = true;
    }
    
    
    // 构建请求参数
    const params: any = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    };
    
    if (filter.timeRange !== 'all') {
      params.timeRange = filter.timeRange;
    }
    if (filter.startDate) {
      params.startDate = filter.startDate;
    }
    if (filter.endDate) {
      params.endDate = filter.endDate;
    }
    
    const res = await getHistoryList(params);
    if (res.code === 200) {
      const newRecords = res.data.records || [];
      
      if (isLoadMore) {
        // 加载更多时追加数据
        historyList.value = [...historyList.value, ...newRecords];
      } else {
        // 首次加载或筛选时替换数据
        historyList.value = newRecords;
      }
      
      pagination.total = res.data.total || 0;
      pagination.pageNum = res.data.current || 1;
      pagination.pageSize = res.data.size || 10;
      pagination.pages = res.data.pages || 1;
      
      // 检查是否还有更多数据
      hasMore.value = pagination.pageNum < pagination.pages;
    } else {
      console.error('Failed to fetch history list:', res.message);
      ElMessage.error(res.message || '获取历史记录失败');
    }
  } catch (error) {
    console.error('Error fetching history list:', error);
    ElMessage.error('获取历史记录失败');
  } finally {
    loading.value = false;
    loadingMore.value = false;
  }
}

/**
 * 删除历史记录
 */
async function removeHistory(contentId: number) {
  try {
    // 调用后端 API 删除
    const res = await deleteHistory(contentId);
    
    if (res.code === 200) {
      // 从列表中移除
      const index = historyList.value.findIndex(item => item.contentId === contentId);
      if (index !== -1) {
        historyList.value.splice(index, 1);
        pagination.total--;
      }
      ElMessage.success('删除成功');
    } else {
      ElMessage.error(res.message || '删除失败');
    }
  } catch (error) {
    console.error('删除历史记录失败:', error);
    ElMessage.error('删除失败');
  }
}

/**
 * 筛选条件变化
 */
function handleFilterChange() {
  pagination.pageNum = 1;
  hasMore.value = true;
  fetchHistoryList();
}

/**
 * 加载更多数据
 */
function loadMore() {
  if (!hasMore.value || loadingMore.value) return;
  pagination.pageNum++;
  fetchHistoryList(true);
}

/**
 * 清空所有历史记录
 */
async function handleClearAll() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有历史记录吗？此操作不可恢复！',
      '清空确认',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
      }
    );
    
    loading.value = true;
    const res = await clearAllHistory();
    
    if (res.code === 200) {
      historyList.value = [];
      pagination.total = 0;
      pagination.pageNum = 1;
      ElMessage.success('已清空所有历史记录');
    } else {
      ElMessage.error(res.message || '清空失败');
    }
  } catch (error: any) {
    // 用户取消操作
    if (error !== 'cancel') {
      console.error('清空历史记录失败:', error);
      ElMessage.error('清空失败');
    }
  } finally {
    loading.value = false;
  }
}



/**
 * 设置滚动监听
 */
function setupScrollObserver() {
  if (!loadMoreTrigger.value) return null;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore.value && !loadingMore.value) {
          loadMore();
        }
      });
    },
    {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    }
  );
  
  observer.observe(loadMoreTrigger.value);
  
  // 保存 observer 以便后续清理
  return observer;
}

let scrollObserver: IntersectionObserver | null = null;

onMounted(() => {
  fetchHistoryList();
  
  // 等待 DOM 渲染后设置监听
  setTimeout(() => {
    scrollObserver = setupScrollObserver();
  }, 100);
});

onUnmounted(() => {
  // 清理滚动监听
  if (scrollObserver && loadMoreTrigger.value) {
    scrollObserver.unobserve(loadMoreTrigger.value);
    scrollObserver.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.timeline-container {
  position: relative;
}

.timeline-item {
  display: grid;
  grid-template-columns: 140px auto 1fr;
  gap: 16px;
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.timeline-time {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-top: 12px;
  
  .time-text {
    font-size: 13px;
    color: #909399;
    white-space: nowrap;
    
    .dark & {
      color: #909399;
    }
  }
}

.timeline-line {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 12px;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #409eff;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #e4f3ff;
  flex-shrink: 0;
  z-index: 2;
  
  .dark & {
    border-color: #1d1e1f;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
  }
}

.timeline-connector {
  position: absolute;
  top: 24px;
  width: 0;
  border-left: 2px dashed #dcdfe6;
  height: calc(100% + 24px);
  background: transparent;
  
  .dark & {
    border-left-color: #4c4d4f;
  }
}

.timeline-content {
  padding-bottom: 8px;
}
</style>
