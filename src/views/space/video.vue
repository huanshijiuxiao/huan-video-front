<template>
  <section class="text-zinc-800 dark:text-zinc-100">
    <div class="mb-5">
      <h2 class="m-0 text-2xl font-bold">
        {{ isOwner ? '我的视频' : '他的视频' }}
      </h2>
    </div>
    <div class="rounded-lg bg-white p-4 dark:bg-zinc-800">
        <!-- 排序 -->
      <div class="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-700 max-sm:flex-col max-sm:items-start ">
  
        <div class="flex gap-3 flex-wrap mb-4">
          <div 
            v-for="row in selectedSortOptions"
            :key="row.name"
            :class="[ isActiveSort(row.name) ? 'bg-sky-600/80 text-white dark:bg-sky-400 dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-600 text-zinc-500 dark:text-zinc-300 hover:text-sky-500 dark:hover:text-sky-400', 'px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer  transition-colors']"
            @click="handleSortChange(row.name)">
            {{ row.label }}
          </div>
        </div>
        <div class="flex items-center gap-2 max-sm:w-full">
          <label class="flex min-w-0 flex-1 items-center gap-1.5 rounded-md border border-zinc-200 px-2 py-1.5 text-zinc-400 dark:border-zinc-600">
            <svg-icon name="search" :width="16" :height="16" />
            <input v-model="keyword" class="w-full border-0 bg-transparent text-xs outline-none placeholder:text-zinc-400" type="search" placeholder="请输入关键词" />
          </label>
        </div>
      </div>
      <!-- 视频列表 -->
      <div v-if="loading" class="flex justify-center py-20 min-h-2/3">
        <Loading color="#409eff" />
      </div>

      <div v-else-if="videos.length === 0" class="flex flex-col items-center justify-center py-20 text-zinc-400">
        <svg-icon name="empty-video" :width="80" :height="80" class="mb-3"></svg-icon>
        <span class="text-sm">还没有发布视频</span>
      </div>

      <div v-else class="min-h-2/3 flex flex-col gap-4 pt-4">
        <div class="grid max-sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <VideoCard v-for="item in videos" :key="item.aid" :videoItem="item" :hideAuthor="true" />
        </div>
        <Pagination
          v-if="page.pages > 1"
          :pageNum="page.current"
          :pageSize="page.size"
          :pages="page.pages"
          :total="page.total"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { listVideoInfo } from '@/api/video';
import { useRoute } from 'vue-router';
import { VideoInfo } from '@/types/video';
import { useAuthStore } from '@/stores/modules/auth';
import Loading from '@/components/Loading/index.vue';

const route = useRoute()
const authStore = useAuthStore();

const uid = route.params.uid ? Number(route.params.uid) : null;

const isOwner = computed(() => {
  if (!authStore.isAuthenticated) return false;
  return authStore.getUserId === uid;
});


// Videos
const videos = ref<VideoInfo[]>([]);
const loading = ref(false);
const videoCount = ref(0);
const keyword = ref('');
const page = reactive({ current: 1, size: 20, total: 0, pages: 0 });

const selectedSortOptions = ref([
  { name: 'latest', label: '最新发布' },
  { name: 'most_played', label: '最多播放' },
  { name: 'most_liked', label: '最多点赞' },
  { name: 'most_favorited', label: '最多收藏' },
]);

const sortBy = ref('latest');




function isActiveSort(sort: string) {
  
  console.log('', sortBy.value === sort);
  return sortBy.value === sort;
}

function handleSortChange(sort: string) {
  sortBy.value = sort;
  page.current = 1; 
  fetchVideos();
}

async function fetchVideos() {
  if (!uid) return;
  loading.value = true;
  try {
    const res = await listVideoInfo({
      uid,
      keyword: keyword.value.trim() || undefined,
      sort: sortBy.value,
      pageNum: page.current,
      pageSize: page.size,
    });
    if (res.code === 200) {
      videos.value = res.data.records || [];
      page.current = res.data.current || 1;
      page.pages = res.data.pages || 0;
      page.total = res.data.total || 0;
      videoCount.value = res.data.total || 0;
    }
  } catch {
    
  }
  finally { loading.value = false; }
}

function handlePageChange(newPage: number) {
  page.current = newPage;
  fetchVideos();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

onMounted(() => {
  fetchVideos();
});

watch([keyword, sortBy], () => {
  page.current = 1;
  fetchVideos();
});
</script>

<style scoped>

</style>
