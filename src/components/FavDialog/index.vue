<template>
  <el-dialog
    v-model="isVisible"
    title="添加到收藏夹"
    width="420px"
    destroy-on-close
    append-to-body
    class="fav-dialog"
    @open="handleOpen"
  >
    <div class="fav-dialog__body px-2 pb-4">
      <!-- 收藏夹列表 -->
      <div class="fav-list max-h-[320px] overflow-y-auto pr-1">
        <div
          v-for="folder in favList"
          :key="folder.id"
          class="fav-item flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-colors duration-150"
          :class="selectedIds.has(folder.id) ? 'bg-sky-50 dark:bg-sky-900/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'"
          @click="toggleFav(folder.id)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <!-- 文件夹图标 -->
            <div
              class="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              :class="selectedIds.has(folder.id) ? 'bg-sky-500 text-white' : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400'"
            >
              <svg-icon name="folder" :width="20" :height="20" />
            </div>
            <!-- 文件夹信息 -->
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {{ folder.title }}
              </div>
              <div class="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                {{ folder.itemCount || 0 }} 个内容
                <span v-if="folder.isDefault === 1" class="ml-1.5 text-sky-500">默认</span>
              </div>
            </div>
          </div>
          <!-- 选中状态 -->
          <div
            class="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
            :class="selectedIds.has(folder.id)
              ? 'bg-sky-500 border-sky-500 text-white'
              : 'border-zinc-300 dark:border-zinc-600'"
          >
            <svg-icon v-if="selectedIds.has(folder.id)" name="check-line" :width="12" :height="12" />
          </div>
        </div>
        <!-- 加载状态 -->
        <div
          v-if="loading && favList.length === 0"
          class="flex flex-col items-center justify-center py-12 text-zinc-400"
        >
          <svg-icon name="star" :width="40" :height="40" class="mb-3 opacity-50" />
          <Loading color="#409eff" scale="0.8" />
        </div>
        <!-- 空状态 -->
        <div
          v-if="!loading && favList.length === 0"
          class="flex flex-col items-center justify-center py-12 text-zinc-400"
        >
          <span class="text-sm">还没有收藏夹，创建一个吧</span>
        </div>
      </div>

      <!-- 新建收藏夹 -->
      <div class="mt-3 border-t border-zinc-100 dark:border-zinc-700 pt-3">
        <div v-if="!showCreateInput" class="flex items-center justify-center">
          <button
            class="flex items-center gap-1.5 text-sm text-sky-500 hover:text-sky-600 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
            @click="showCreateInput = true"
          >
            <svg-icon name="plus-line" :width="16" :height="16" />
            <span>新建收藏夹</span>
          </button>
        </div>
        <div v-else class="flex items-center gap-2">
          <el-input
            ref="newFolderInputRef"
            v-model="newFolderTitle"
            placeholder="请输入收藏夹名称"
            size="small"
            maxlength="20"
            show-word-limit
            class="flex-1"
            @keyup.enter="handleCreateFolder"
          />
          <el-button
            size="small"
            type="primary"
            :loading="creating"
            :disabled="!newFolderTitle.trim()"
            @click="handleCreateFolder"
          >
            创建
          </el-button>
          <el-button
            size="small"
            @click="cancelCreate"
          >
            取消
          </el-button>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="flex items-center justify-between">
        <span class="text-xs text-zinc-400 dark:text-zinc-500">
          {{ selectedIds.size > 0 ? `已选择 ${selectedIds.size} 个收藏夹` : '选择要收藏的收藏夹' }}
        </span>
        <div class="flex gap-2">
          <el-button @click="isVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="saving"
            @click="handleSave"
          >
            确定
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import Loading from '@/components/Loading/index.vue'
import { ListFav, createFavFolder } from '@/api/fav'
import { dealFavAction } from '@/api/action'
import type { FavInfo } from '@/types/fav'
import SvgIcon from '@/components/SvgIcon.vue'
import { useAuthStore } from '@/stores/modules/auth'

const authStore = useAuthStore()

const props = defineProps<{
  visible: boolean
  contentId: number
  contentType?: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'saved', favorited: boolean): void
}>()

const isVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

// 收藏夹列表
const favList = ref<FavInfo[]>([])
const loading = ref(false)
const selectedIds = ref<Set<number>>(new Set())
// 打开弹窗时的初始选中状态，用于计算差异
const initialSelectedIds = ref<Set<number>>(new Set())


// 新建收藏夹
const showCreateInput = ref(false)
const newFolderTitle = ref('')
const creating = ref(false)
const newFolderInputRef = ref<any>(null)

// 保存状态
const saving = ref(false)

// 打开弹窗时加载数据
async function handleOpen() {
  selectedIds.value = new Set()
  showCreateInput.value = false
  newFolderTitle.value = ''
  loading.value = true
  try {
    const res: any = await ListFav({
      uid: authStore.getUserId,
      contentId: props.contentId,
      contentType: props.contentType
    })
    if (res.code === 200) {
      favList.value = res.data || []
      selectedIds.value = new Set(favList.value.filter(f => f.favStatus).map(f => f.id))
      // 保存初始状态，后续计算增删差异
      initialSelectedIds.value = new Set(selectedIds.value)
      console.log('收藏夹列表:', selectedIds)
    }

  } catch (err) {
    console.error('获取收藏夹列表失败:', err)
    favList.value = []
  } finally {
    loading.value = false
  }
}

// 切换收藏夹选中状态
function toggleFav(id: number) {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
    const folder = favList.value.find(f => f.id === id)
    if (folder) {
      folder.itemCount = Math.max(0, folder.itemCount - 1)
    }
  } else {
    newSet.add(id)
    const folder = favList.value.find(f => f.id === id)
    if (folder) {
      folder.itemCount++
    }
  }
  selectedIds.value = newSet
}

// 创建新收藏夹
async function handleCreateFolder() {
  const title = newFolderTitle.value.trim()
  if (!title) return
  creating.value = true
  try {
    const res: any = await createFavFolder(title)
    if (res.code === 200) {
      ElMessage.success('收藏夹创建成功')
      // 重新加载列表
      const listRes: any = await ListFav()
      if (listRes.code === 200) {
        favList.value = listRes.data || []
        // 自动选中新创建的收藏夹
        const newFolder = favList.value.find(f => f.title === title)
        if (newFolder) {
          const newSet = new Set(selectedIds.value)
          newSet.add(newFolder.id)
          selectedIds.value = newSet
        }
      }
      showCreateInput.value = false
      newFolderTitle.value = ''
    } else {
      ElMessage.error(res.msg || '创建失败')
    }
  } catch (err) {
    ElMessage.error('创建收藏夹失败')
  } finally {
    creating.value = false
  }
}

// 取消创建
function cancelCreate() {
  showCreateInput.value = false
  newFolderTitle.value = ''
}

// 保存收藏
async function handleSave() {
  
  saving.value = true
  try {
    const currentIds = selectedIds.value
    // 计算差异：新选的 = 选中了但初始没选，取消的 = 初始选了但现在没选
    const addFavIds = Array.from(currentIds).filter(id => !initialSelectedIds.value.has(id))
    const delFavIds = Array.from(initialSelectedIds.value).filter(id => !currentIds.has(id))

    const res: any = await dealFavAction({
      contentId: props.contentId,
      contentType: props.contentType ?? 1,
      addFavIds,
      delFavIds
    })
    if (res.code === 200) {
      isVisible.value = false
      emit('saved', selectedIds.value.size > 0)
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (err) {
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 监听创建输入框的焦点
watch(showCreateInput, (val) => {
  if (val) {
    nextTick(() => {
      newFolderInputRef.value?.focus?.()
    })
  }
})
</script>

<style lang="scss">
.fav-dialog {
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 0;
  }
}
.fav-item {
  user-select: none;
  -webkit-user-select: none;
}
</style>
