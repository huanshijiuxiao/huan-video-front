<template>
  <aside class="sm:w-full md:w-64 flex-shrink-0">
    <div class="bg-white dark:bg-zinc-800 rounded-lg shadow p-5 sticky top-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-lg text-zinc-800 dark:text-white">筛选</h3>
        <el-button 
          text 
          size="small" 
          @click="resetFilter"
          class="text-zinc-500 hover:text-pink-500"
        >
          重置
        </el-button>
      </div>
      
      <div class="space-y-6">        <!-- 内容类型 -->
        <div>
          <div class="text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
            内容类型
          </div>
          <div class="flex flex-row space-y-2.5">
            <el-checkbox v-model="isVideoChecked" size="large">
              <span class="text-sm">视频</span>
            </el-checkbox>
            <el-checkbox v-model="isLiveChecked" size="large">
              <span class="text-sm">直播</span>
            </el-checkbox>
            <el-checkbox v-model="isArticleChecked" size="large">
              <span class="text-sm">专栏</span>
            </el-checkbox>
          </div>
        </div>
        
        <el-divider class="my-4" />
          <!-- 时间段 -->
        <div>
          <div class="text-sm font-semibold mb-3 text-zinc-700 dark:text-zinc-300">
            时间段
          </div>
          <el-radio-group 
            v-model="localTimeRange" 
            class="flex flex-row space-y-2.5"
          >
            <el-radio value="all" size="large">
              <span class="text-sm">全部时间</span>
            </el-radio>
            <el-radio value="today" size="large">
              <span class="text-sm">今天</span>
            </el-radio>
            <el-radio value="week" size="large">
              <span class="text-sm">本周</span>
            </el-radio>
            <el-radio value="month" size="large">
              <span class="text-sm">本月</span>
            </el-radio>
            <el-radio value="custom" size="large">
              <span class="text-sm">自定义时间</span>
            </el-radio>
          </el-radio-group>
          
          <!-- 自定义日期范围 -->
          <transition name="el-fade-in">
            <div v-if="localTimeRange === 'custom'" class="mt-3">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                size="default"
                class="w-full"
              />
            </div>
          </transition>
        </div>
        
        <el-button 
          type="primary" 
          class="w-full mt-4" 
          @click="applyFilter"
          :icon="Search"
        >
          应用筛选
        </el-button>
      </div>
    </div>
  </aside>
</template>
  
<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { Search } from '@element-plus/icons-vue';
  import { ContentType } from '@/types/history';
  
  const props = defineProps<{
    contentTypes: ContentType[];
    timeRange: 'all' | 'today' | 'week' | 'month' | 'custom';
    startDate?: string;
    endDate?: string;
  }>();
  
  const emit = defineEmits<{
    'update:contentTypes': [value: ContentType[]];
    'update:timeRange': [value: 'all' | 'today' | 'week' | 'month' | 'custom'];
    'update:startDate': [value: string | undefined];
    'update:endDate': [value: string | undefined];
    'filter-change': [];
  }>();
  
  // 内容类型的计算属性
  const isVideoChecked = computed({
    get: () => props.contentTypes.includes(ContentType.VIDEO),
    set: (checked) => {
      const newTypes = [...props.contentTypes];
      if (checked && !newTypes.includes(ContentType.VIDEO)) {
        newTypes.push(ContentType.VIDEO);
      } else if (!checked) {
        const index = newTypes.indexOf(ContentType.VIDEO);
        if (index !== -1) newTypes.splice(index, 1);
      }
      emit('update:contentTypes', newTypes);
    }
  });
  
  const isLiveChecked = computed({
    get: () => props.contentTypes.includes(ContentType.LIVE),
    set: (checked) => {
      const newTypes = [...props.contentTypes];
      if (checked && !newTypes.includes(ContentType.LIVE)) {
        newTypes.push(ContentType.LIVE);
      } else if (!checked) {
        const index = newTypes.indexOf(ContentType.LIVE);
        if (index !== -1) newTypes.splice(index, 1);
      }
      emit('update:contentTypes', newTypes);
    }
  });
  
  const isArticleChecked = computed({
    get: () => props.contentTypes.includes(ContentType.ARTICLE),
    set: (checked) => {
      const newTypes = [...props.contentTypes];
      if (checked && !newTypes.includes(ContentType.ARTICLE)) {
        newTypes.push(ContentType.ARTICLE);
      } else if (!checked) {
        const index = newTypes.indexOf(ContentType.ARTICLE);
        if (index !== -1) newTypes.splice(index, 1);
      }
      emit('update:contentTypes', newTypes);
    }
  });
  
  // 时间范围
  const localTimeRange = ref(props.timeRange);
  
  watch(localTimeRange, (value) => {
    emit('update:timeRange', value);
  });
  
  // 日期范围
  const dateRange = computed({
    get: () => {
      if (props.startDate && props.endDate) {
        return [props.startDate, props.endDate];
      }
      return null;
    },
    set: (value) => {
      if (value && Array.isArray(value)) {
        emit('update:startDate', value[0]);
        emit('update:endDate', value[1]);
      } else {
        emit('update:startDate', undefined);
        emit('update:endDate', undefined);
      }
    }
  });
    // 应用筛选
  const applyFilter = () => {
    emit('filter-change');
  };
  
  // 重置筛选
  const resetFilter = () => {
    emit('update:contentTypes', [ContentType.VIDEO, ContentType.LIVE, ContentType.ARTICLE]);
    localTimeRange.value = 'all';
    emit('update:timeRange', 'all');
    emit('update:startDate', undefined);
    emit('update:endDate', undefined);
    emit('filter-change');
  };
</script>
  