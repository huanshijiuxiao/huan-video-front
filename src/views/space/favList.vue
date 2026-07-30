<template>
  <section class="text-zinc-800 dark:text-zinc-100">
    <div class="mb-5 flex items-center justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3">
      <h2 class="m-0 text-2xl font-bold">{{ isOwner ? '我的收藏' : '他的收藏' }}</h2>
      <button 
        class="inline-flex items-center gap-1.5 rounded-md border-0 bg-sky-500 px-3.5 py-2 text-xs text-white transition-colors hover:bg-sky-600" 
        type="button"
        v-show="isOwner"
        @click="showCreate = true">
        <svg-icon name="plus-line" :width="16" :height="16" />
        新建收藏夹
      </button>
    </div>

    <div class="grid grid-cols-[220px_minmax(0,1fr)] gap-5 max-sm:grid-cols-1 max-sm:gap-3">
      <aside class="rounded-lg bg-white p-4 dark:bg-zinc-800 max-sm:flex max-sm:gap-1.5 max-sm:overflow-x-auto max-sm:p-2">
        <div class="mb-2.5 px-2 text-xs text-zinc-400 max-sm:hidden">收藏夹</div>
        <button
          v-for="folder in folders"
          :key="folder.id"
          type="button"
          class="flex w-full items-center gap-2 rounded-md border-0 bg-transparent px-2 py-2.5 text-left text-zinc-600 transition-colors hover:bg-sky-50 hover:text-sky-600 dark:text-zinc-300 dark:hover:bg-sky-950/30 max-sm:w-auto max-sm:flex-none max-sm:whitespace-nowrap"
          :class="selectedId === folder.id ? 'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400' : ''"
          @click="selectedId = folder.id"
        >
          <span class="inline-flex flex-none"><svg-icon name="folder" :width="18" :height="18" /></span>
          <span class="flex-1 truncate text-[13px]">{{ folder.title }}</span>
          <span class="text-xs text-zinc-400">{{ folder.itemCount || 0 }}</span>
        </button>
        <div v-if="!loading && folders.length === 0" class="p-6 text-center text-xs text-zinc-400">还没有收藏夹</div>
      </aside>

      <div class="rounded-lg bg-white p-4 dark:bg-zinc-800">
        <div class="flex items-center justify-between gap-3 border-b border-zinc-100 pb-3 dark:border-zinc-700 max-sm:flex-col max-sm:items-start">

          <!-- 排序 -->
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
        <div v-if="loading" class="flex justify-center py-20">
          <Loading color="#409eff"/>
        </div>        
        <div v-else-if="videos.length === 0" class="flex min-h-[300px] flex-col items-center justify-center text-[13px] text-zinc-400">
          <svg-icon name="empty-video" :width="72" :height="72" />
          <p class="my-2 mb-1">{{ keyword ? '没有找到匹配的视频' : '这个收藏夹还没有内容' }}</p>
          <router-link v-if="!keyword && !selectedFolder?.itemCount" to="/" class="text-xs text-sky-500">去发现视频</router-link>
        </div>
        <div v-else class="grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 max-sm:grid-cols-1">
          <VideoCard v-for="video in videos" :key="video.aid" :video-item="video" />
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

    <el-dialog v-model="showCreate" title="新建收藏夹" width="380px" destroy-on-close>
      <!-- 图片上传 -->
      <el-input v-model="newTitle" maxlength="20" show-word-limit placeholder="请输入收藏夹名称" @keyup.enter="createFolder" />
      <template #footer>
        <el-button @click="showCreate = false">取消</el-button>
        <el-button type="primary" :loading="creating" :disabled="!newTitle.trim()" @click="createFolder">创建</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ListFav, createFavFolder, listFavItems } from '@/api/fav'
import Loading from '@/components/Loading/index.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import type { FavInfo } from '@/types/fav'
import type { VideoInfo } from '@/types/video'
import VideoCard from '@/components/VideoCard/index.vue'
import Pagination from '@/components/Pagination/index.vue'

const route = useRoute()
const authStore = useAuthStore()

const uid = route.params.uid ? Number(route.params.uid) : null;
const folders = ref<FavInfo[]>([])
const videos = ref<VideoInfo[]>([])
const selectedId = ref<number | null>(null)
const loading = ref(false)
const keyword = ref('')
const sortBy = ref('latest')
const showCreate = ref(false)
const newTitle = ref('')
const creating = ref(false)
const page = reactive({ current: 1, size: 20, total: 0, pages: 0 })


const selectedFolder = computed(() => folders.value.find(folder => folder.id === selectedId.value))
const isOwner = computed(() => {
  if (!authStore.isAuthenticated) return false;
  return authStore.getUserId === uid;
});

const selectedSortOptions = ref([
  { name: 'latest', label: '最新发布' },
  { name: 'most_viewed', label: '最多播放' },
  { name: 'most_favorited', label: '最多收藏' },
])

function isActiveSort(sortName: string) {
  return sortBy.value === sortName
}

function handleSortChange(sortName: string) {
  sortBy.value = sortName
}

async function fetchVideos() {
  if (!uid || !selectedId.value) {
    videos.value = []
    page.current = 1
    page.total = 0
    page.pages = 0
    return
  }
  loading.value = true
  try {
    const res: any = await listFavItems({
      uid: uid,
      favoriteId: selectedId.value,
      keyword: keyword.value.trim() || undefined,
      sort: sortBy.value,
      pageNum: page.current,
      pageSize: page.size,
    })
    if (res.code === 200) {
      videos.value = res.data?.records || []
      page.current = res.data?.current || page.current
      page.size = res.data?.size || page.size
      page.total = res.data?.total || 0
      page.pages = res.data?.pages || 0
    }
  } catch { ElMessage.error('获取收藏内容失败') } finally { loading.value = false }
}

async function fetchFolders() {
  const uid = Number(route.params.uid) || authStore.getUserId
  if (!uid) return
  loading.value = true
  try {
    const res: any = await ListFav({ uid, contentId: 0, contentType: 1 })
    if (res.code === 200) {
      folders.value = res.data || []
      const requestedFolder = Number(route.query.folder)
      selectedId.value = folders.value.some(folder => folder.id === requestedFolder)
        ? requestedFolder
        : (folders.value[0]?.id ?? null)
      await fetchVideos()
    }
  } catch { ElMessage.error('获取收藏夹失败') } finally { loading.value = false }
}

async function createFolder() {
  const title = newTitle.value.trim()
  if (!title) return
  creating.value = true
  try {
    const res: any = await createFavFolder(title)
    if (res.code === 200) { ElMessage.success('收藏夹创建成功'); showCreate.value = false; newTitle.value = ''; await fetchFolders() }
    else ElMessage.error(res.msg || '创建失败')
  } finally { creating.value = false }
}

onMounted(fetchFolders)
watch([selectedId, keyword, sortBy], () => {
  page.current = 1
  fetchVideos()
})

function handlePageChange(newPage: number) {
  page.current = newPage
  fetchVideos()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
