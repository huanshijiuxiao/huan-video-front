<template>
  <div class="video-list-container">
    <div v-for="item in videoList" :key="item.aid">
      <VideoCard :videoItem="item" />
    </div>

    <div ref="loadMoreRef" class="loading-trigger flex justify-center py-4">
      <Loading v-if="loading" color="#09eff" scale="0.8" />
      <span v-else-if="!hasMore">没有更多视频了</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { listVideoInfo, recommendVideos } from '@/api/video';
import VideoCard from '@/components/VideoCard/index.vue';
import { onMounted, onUnmounted, ref } from 'vue';
import Loading from '@/components/Loading/index.vue';

const props = withDefaults(defineProps<{
  mode?: 'normal' | 'recommend';
}>(), {
  mode: 'normal'
});

const videoList = ref<any[]>([]);
const currentPage = ref(1);

const loading = ref(false); 
const hasMore = ref(true);  

const loadMoreRef = ref<HTMLElement | null>(null); 
let observer: IntersectionObserver | null = null;

function fetchVideos(page: number) {
  if (loading.value || !hasMore.value) return;
  loading.value = true;

  if (props.mode === 'recommend') {
    
    const excludeIds = videoList.value.map((v: any) => v.aid).filter((id: any) => id != null);
    recommendVideos({ ids: excludeIds, size: 20 }).then((res: any) => {
      if (res.code === 200) {
        const records = res.data || [];
        if (records.length === 0) {
          hasMore.value = false;
          return;
        }
        videoList.value = [...videoList.value, ...records];
      }
    }).finally(() => {
      loading.value = false;
    });
  } else {
    // 普通分页模式
    listVideoInfo({ pageNum: page }).then((res: any) => {
      if (res.code === 200) {
        const records = res.data.records || [];
        if (records.length === 0) {
          hasMore.value = false;
          return;
        }
        videoList.value = [...videoList.value, ...records];
        currentPage.value = res.data.current;
        if (res.data.current >= res.data.pages) {
          hasMore.value = false;
        }
      }
    }).finally(() => {
      loading.value = false;
    });
  }
}

onMounted(() => {
  fetchVideos(1);

  observer = new IntersectionObserver((entries) => {
    const target = entries[0];
    if (target.isIntersecting && !loading.value && hasMore.value) {
      fetchVideos(currentPage.value + 1);
    }
  }, {
    rootMargin: '150px',
  });

  if (loadMoreRef.value) {
    observer.observe(loadMoreRef.value);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style lang="scss" scoped>
.video-list-container {
  display: grid;
  padding: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-gap: 1.2rem;
  width: 100%;
}

.loading-trigger {
  grid-column: 1 / -1; 
  text-align: center;
  padding: 1.5rem;
  color: #8a8a8a;
  font-size: 0.9rem;
}
</style>
