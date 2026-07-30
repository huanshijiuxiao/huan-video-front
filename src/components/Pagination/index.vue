<template>
    <div class="flex justify-center mt-6">
      <div class="flex space-x-1">
        <!-- 上一页 -->
        <button 
          :disabled="pageNum === 1"
          @click="handlePageChange(pageNum - 1)"
          class="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SvgIcon name="left"></SvgIcon>
        </button>
        
        <!-- 页码 -->
        <button 
          v-for="page in pageNumbers" 
          :key="page"
          :class="[
            'w-8 h-8 flex items-center justify-center rounded transition-colors',
            pageNum === page
              ? 'bg-sky-500 text-white'
              : 'hover:bg-zinc-100'
          ]"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>
        
        <!-- 下一页 -->
        <button 
          :disabled="pageNum === pages"
          @click="handlePageChange(pageNum + 1)"
          class="w-8 h-8 flex items-center justify-center rounded hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          
          <SvgIcon name="right"></SvgIcon>
        </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  const props = defineProps<{
    pageNum: number;
    pageSize: number;
    pages: number;
    total: number;
  }>();
  
  const emit = defineEmits<{
    (e: 'page-change', page: number): void;
  }>();
  
  const pageNumbers = computed(() => {
    const numbers: number[] = [];
    
    // 根据总数计算总页数
    const totalPages = Math.ceil(props.total / props.pageSize);
    
    // 简单的分页逻辑，最多显示5个页码
    const maxVisiblePages = 5;
    let startPage = Math.max(1, props.pageNum - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // 调整开始页，确保我们总是显示 maxVisiblePages 个页码（如果总页数允许）
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
    
    for (let i = startPage; i <= endPage; i++) {
      numbers.push(i);
    }
    
    return numbers;
  });
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= props.pages && page !== props.pageNum) {
      emit('page-change', page);
    }
  };
  </script>
  
