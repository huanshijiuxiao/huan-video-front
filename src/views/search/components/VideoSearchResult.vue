<template>
  <div>
    <div class="bg-white rounded-lg shadow-sm border border-zinc-100 p-4 mb-4 space-y-3">
      <div class="flex items-center gap-2">
        <span class="text-sm text-zinc-500 w-12 flex-shrink-0">排序</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            :class="filterButtonClass(currentSort === opt.key)"
            @click="setSortOrder(opt.key)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-zinc-500 w-12 flex-shrink-0">时长</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in durationOptions"
            :key="opt.key"
            :class="filterButtonClass(currentDuration === opt.key)"
            @click="setDurationFilter(opt.key)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-sm text-zinc-500 w-12 flex-shrink-0">时间</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in dateOptions"
            :key="opt.key"
            :class="filterButtonClass(currentDate === opt.key)"
            @click="setDateFilter(opt.key)"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20">
      <Loading color="#409eff" />
    </div>

    <div v-else-if="videoResult.length === 0" class="flex flex-col items-center justify-center py-20 text-zinc-400">
      <svg-icon name="empty-search" :width="96" :height="96" class="mb-4"></svg-icon>
      <span class="text-lg">没有找到相关视频</span>
      <span class="text-sm mt-1">试试其他关键词或调整筛选条件</span>
    </div>

    <div v-else class="grid sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <VideoCard v-for="item in videoResult" :key="item.aid" :videoItem="item" />
    </div>

    <Pagination
      v-if="videoPage.pages > 1"
      :pageNum="videoPage.current"
      :pageSize="videoPage.size"
      :pages="videoPage.pages"
      :total="videoPage.total"
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import Loading from "@/components/Loading/index.vue";
import VideoCard from "@/components/VideoCard/index.vue";
import Pagination from "@/components/Pagination/index.vue";
import { searchVideo } from "@/api/search";
import type { VideoInfo } from "@/types/video";

const props = defineProps<{
  keyword: string;
}>();

const videoResult = ref<VideoInfo[]>([]);
const loading = ref(false);
const videoPage = reactive({
  current: 1,
  size: 20,
  total: 0,
  pages: 0,
});

const sortOptions = [
  { key: "", label: "综合" },
  { key: "publicTime", label: "最新发布" },
  { key: "view", label: "最多播放" },
  { key: "duration", label: "时长" },
];
const currentSort = ref("");

const durationOptions = [
  { key: "", label: "全部" },
  { key: "under10", label: "10分钟以下" },
  { key: "10to30", label: "10-30分钟" },
  { key: "30to60", label: "30-60分钟" },
  { key: "over60", label: "60分钟以上" },
];
const currentDuration = ref("");
const durationMap: Record<string, { min?: number; max?: number }> = {
  under10: { max: 600 },
  "10to30": { min: 600, max: 1800 },
  "30to60": { min: 1800, max: 3600 },
  over60: { min: 3600 },
};

const dateOptions = [
  { key: "", label: "全部时间" },
  { key: "day", label: "一天内" },
  { key: "week", label: "一周内" },
  { key: "month", label: "一个月内" },
];
const currentDate = ref("");

function filterButtonClass(active: boolean) {
  return [
    "px-4 py-1.5 text-sm rounded-full transition-colors border",
    active ? "bg-sky-50 text-sky-600 border-sky-200" : "text-zinc-600 hover:bg-zinc-50 border-transparent",
  ];
}

function getDateFrom(key: string): string | undefined {
  const now = new Date();

  switch (key) {
    case "day":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    default:
      return undefined;
  }
}

function setSortOrder(key: string) {
  currentSort.value = key;
  videoPage.current = 1;
  fetchVideos();
}

function setDurationFilter(key: string) {
  currentDuration.value = key;
  videoPage.current = 1;
  fetchVideos();
}

function setDateFilter(key: string) {
  currentDate.value = key;
  videoPage.current = 1;
  fetchVideos();
}

async function fetchVideos() {
  if (!props.keyword) {
    videoResult.value = [];
    return;
  }

  loading.value = true;

  try {
    const durationRange = durationMap[currentDuration.value] || {};
    const res = await searchVideo({
      keyword: props.keyword,
      page: videoPage.current,
      size: videoPage.size,
      orderBy: currentSort.value || undefined,
      orderDir: currentSort.value ? "desc" : undefined,
      durationMin: durationRange.min,
      durationMax: durationRange.max,
      dateFrom: getDateFrom(currentDate.value),
    });

    if (res.code === 200) {
      videoResult.value = res.data.records || [];
      videoPage.current = res.data.current;
      videoPage.total = res.data.total;
      videoPage.pages = res.data.pages;
      videoPage.size = res.data.size;
    }
  } catch (error) {
    console.error("搜索视频失败:", error);
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  videoPage.current = page;
  fetchVideos();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

watch(
  () => props.keyword,
  () => {
    videoPage.current = 1;
    fetchVideos();
  },
  { immediate: true }
);
</script>
