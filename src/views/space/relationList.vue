<template>
  <section class="text-zinc-800 dark:text-zinc-100">
    <h2 class="mb-5 text-2xl font-bold">{{ relationType === 'following' ? '关注' : '粉丝' }}</h2>
    <div v-if="loading" class="flex justify-center rounded-lg bg-white py-20 dark:bg-zinc-800">
      <Loading color="#409eff" />
    </div>
    <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center rounded-lg bg-white py-20 text-zinc-400 dark:bg-zinc-800">
      <svg-icon name="empty-user" :width="80" :height="80" class="mb-3" />
      <span class="text-sm">{{ relationType === 'following' ? '还没有关注用户' : '还没有粉丝' }}</span>
    </div>
    <template v-else>
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <router-link
          v-for="user in users"
          :key="user.uid"
          :to="`/space/${user.uid}`"
          class="flex min-w-0 items-center gap-4 rounded-lg bg-white p-4 transition-shadow hover:shadow-md dark:bg-zinc-800"
        >
          <el-avatar :src="user.avatar" :size="56" />
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-base font-medium">{{ user.nickname || user.username }}</h3>
            <p class="mt-1 truncate text-sm text-zinc-400">{{ user.introduction || '这个用户很懒，什么都没留下～' }}</p>
            <div class="mt-2 flex gap-4 text-xs text-zinc-500">
              <span>粉丝 {{ user.follower || 0 }}</span>
              <span>关注 {{ user.following || 0 }}</span>
            </div>
          </div>
        </router-link>
      </div>
      <Pagination
        v-if="page.pages > 1"
        :pageNum="page.current"
        :pageSize="page.size"
        :pages="page.pages"
        :total="page.total"
        @page-change="handlePageChange"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import Loading from '@/components/Loading/index.vue'
import { listRelationUsers } from '@/api/relation'
import type { UserInfo } from '@/types/user'
import Pagination from '@/components/Pagination/index.vue'

const props = defineProps<{ relationType: 'following' | 'followers' }>()
const route = useRoute()
const uid = Number(route.params.uid)
const users = ref<UserInfo[]>([])
const loading = ref(true)
const page = reactive({ current: 1, size: 20, total: 0, pages: 0 })

async function fetchUsers() {
  loading.value = true
  try {
    const res: any = await listRelationUsers({ uid, type: props.relationType, pageNum: page.current, pageSize: page.size })
    if (res.code === 200) {
      users.value = res.data?.records || []
      page.current = res.data?.current || page.current
      page.size = res.data?.size || page.size
      page.total = res.data?.total || 0
      page.pages = res.data?.pages || 0
    }
  } finally { loading.value = false }
}

function handlePageChange(nextPage: number) {
  page.current = nextPage
  fetchUsers()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(fetchUsers)
</script>
