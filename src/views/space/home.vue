<template>
  <section class="space-home text-zinc-800 dark:text-zinc-100">
    <SpaceSection v-if="loadingVideos || videos.length" title="投稿视频" :to="{ name: 'SpaceVideo', params: { uid } }">
      <div v-if="loadingVideos" class="section-state"><Loading scale="0.8" /></div>
      <div v-else-if="videos.length" class="video-grid">
        <VideoCard v-for="video in videos" :key="video.aid" :video-item="video" :hide-author="true" />
      </div>
    </SpaceSection>

    <SpaceSection v-if="loadingFolders || folders.length" title="收藏夹" :to="{ name: 'SpaceFavList', params: { uid } }">
      <div v-if="loadingFolders" class="section-state"><Loading scale="0.8" /></div>
      <div v-else-if="folders.length" class="folder-grid">
        <router-link
          v-for="folder in folders"
          :key="folder.id"
          :to="{ name: 'SpaceFavList', params: { uid }, query: { folder: folder.id } }"
          class="folder-card"
        >
          <div class="folder-cover">
            <img v-if="folder.cover" :src="folder.cover" :alt="folder.title" loading="lazy" />
            <svg-icon v-else name="folder" :width="42" :height="42" />
          </div>
          <div class="min-w-0">
            <h3 class="truncate text-sm font-medium">{{ folder.title }}</h3>
            <p class="mt-1 text-xs text-zinc-400">{{ folder.itemCount || 0 }} 个视频</p>
          </div>
        </router-link>
      </div>
    </SpaceSection>

    <SpaceSection v-if="loadingLiked || likedVideos.length" title="最近点赞" :to="{ name: 'SpaceVideo', params: { uid }, query: { sort: 'liked' } }">
      <div v-if="loadingLiked" class="section-state"><Loading color="#409eff"/></div>
      <div v-else-if="likedVideos.length" class="video-grid">
        <VideoCard v-for="video in likedVideos" :key="video.aid" :video-item="video" />
      </div>
    </SpaceSection>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { listLikedVideos, listUserVideos } from '@/api/space'
import { ListFav, listFavItems } from '@/api/fav'
import type { VideoInfo } from '@/types/video'
import type { FavInfo } from '@/types/fav'
import VideoCard from '@/components/VideoCard/index.vue'
import SpaceSection from '@/views/space/components/SpaceSection.vue'
import Loading from '@/components/Loading/index.vue'

type HomeFolder = FavInfo & { cover?: string }
const route = useRoute()
const uid = Number(route.params.uid)
const videos = ref<VideoInfo[]>([])
const likedVideos = ref<VideoInfo[]>([])
const folders = ref<HomeFolder[]>([])
const loadingVideos = ref(true)
const loadingLiked = ref(true)
const loadingFolders = ref(true)

function records(data: any): any[] {
  return data?.records || data?.list || []
}

async function fetchVideos() {
  try {
    const res: any = await listUserVideos({ uid, pageNum: 1, pageSize: 10, sort: 'latest' })
    if (res.code === 200) videos.value = records(res.data).slice(0, 10)
  } finally { loadingVideos.value = false }
}

async function fetchLiked() {
  try {
    const res: any = await listLikedVideos({ uid, pageNum: 1, pageSize: 10 })
    if (res.code === 200) likedVideos.value = records(res.data).slice(0, 10)
  } catch {
    // Ignore errors
  }
  finally { loadingLiked.value = false }
}

async function fetchFolders() {
  try {
    const res: any = await ListFav({ uid, contentId: 0, contentType: 1 })
    const list = res.code === 200 && Array.isArray(res.data)
      ? res.data.filter((folder: HomeFolder) => Number(folder.itemCount) > 0).slice(0, 10)
      : []
    folders.value = await Promise.all(list.map(async (folder: HomeFolder) => {
      if (folder.cover || !folder.id || !folder.itemCount) return folder
      try {
        const items: any = await listFavItems({ uid, favoriteId: folder.id, pageNum: 1, pageSize: 1 })
        const first = records(items.data)[0]
        return { ...folder, cover: first?.picture }
      } catch { return folder }
    }))
  } finally { loadingFolders.value = false }
}

onMounted(() => { fetchVideos(); fetchLiked(); fetchFolders() })
</script>

<style scoped>
.space-home { display: flex; flex-direction: column; gap: 1.25rem; }
.video-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 1rem; }
.folder-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 1rem; }
.folder-card { display: flex; min-width: 0; flex-direction: column; gap: .7rem; color: inherit; }
.folder-cover { display: flex; aspect-ratio: 16 / 9; align-items: center; justify-content: center; overflow: hidden; border-radius: .5rem; background: #e4e4e7; color: #a1a1aa; }
.folder-cover img { width: 100%; height: 100%; object-fit: cover; }
.section-state { min-height: 9rem; display: flex; align-items: center; justify-content: center; color: #a1a1aa; font-size: .8125rem; }
@media (max-width: 1024px) { .video-grid, .folder-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
@media (max-width: 768px) { .video-grid, .folder-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
</style>
