<template>
  <div class="size-full manuscript-page">

    <div class="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          @click="handleStatusFilter(tab.value)"
          class="px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap"
          :class="statusFilter === tab.value
            ? 'bg-white dark:bg-zinc-700 text-sky-500 shadow-sm'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'"
        >
          {{ tab.label }}
        </button>
      </div>

      

      <div class="flex items-center gap-4">
        <!-- 排序下拉框 -->
        <el-select
          v-model="sort"
          placeholder="排序方式"
          size="default"
          class="w-32"
          @change="handleSortChange"
        >
          <el-option
            v-for="option in sortOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索稿件标题..."
          prefix-icon="Search"
          clearable
          size="default"
          class="w-60"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div v-if="loading" class="flex justify-center py-24">
        <Loading color="#409eff"/>
      </div>

      <div v-else-if="list.length === 0" class="flex flex-col items-center justify-center py-24 text-zinc-400">
        <svg-icon name="manuscript-empty" :width="80" :height="80" class="mb-4"></svg-icon>
        <span class="text-sm">暂无稿件数据</span>

      </div>

      <template v-else v-for="row in list" :key="row.aid">
        <div class="flex items-center justify-start gap-4 px-6 py-4 border-b border-zinc-100 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
          <!-- 稿件封面 -->
          <div class="flex items-center gap-3 py-1">
              <div class="w-48 aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-700 flex-shrink-0 relative">
                <img
                  :src="row.picture"
                  :alt="row.title"
                  class="w-full h-full object-cover"
                  @error="onImgError"
                />
                <div v-if="row.duration" class="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded">
                  {{ TimeUtil.formatDuration(row.duration) }}
                </div>
              </div>
              
          </div>
          <!-- 稿件标题,发布时间与稿件状态 -->
          <div class="flex flex-col gap-3 py-1">
            <div class="text-base font-medium text-zinc-800 dark:text-zinc-100 truncate w-60">
              {{ row.title }}
            </div>
            <div class="text-xs text-zinc-500 dark:text-zinc-400">
              {{ TimeUtil.formatDateTime(row.publicTime) }}
            </div>
            <div class="flex items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
              <div class="flex items-center gap-1">
                <svg-icon name="play" :width="14" :height="14"></svg-icon>
                <span>{{ NumberUtil.formatCount(row.stat?.view || 0) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg-icon name="like" :width="14" :height="14"></svg-icon>
                <span>{{ NumberUtil.formatCount(row.stat?.like || 0) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg-icon name="coin" :width="14" :height="14"></svg-icon>
                <span>{{ NumberUtil.formatCount(row.stat?.coin || 0) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg-icon name="barrage" :width="14" :height="14"></svg-icon>
                <span>{{ NumberUtil.formatCount(row.stat?.barrage || 0) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg-icon name="comment" :width="14" :height="14"></svg-icon>
                <span>{{ NumberUtil.formatCount(row.stat?.reply || 0) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg-icon name="star" :width="14" :height="14"></svg-icon>
                <span>{{ NumberUtil.formatCount(row.stat?.favorite || 0) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg-icon name="share" :width="14" :height="14"></svg-icon>
                <span>{{ NumberUtil.formatCount(row.stat?.share || 0) }}</span>
              </div>
            </div>
            
          </div>
          <!-- 审核状态 -->
          <div class="flex items-center gap-2 mt-2">
            <el-tag :type="getStatusType(row.status)" effect="light" round size="small">
              {{ getStatusLabel(row.status) }}
            </el-tag>
            <div v-if="row.status === 2 && row.auditMessage" class="mt-1">
              <el-tooltip :content="row.auditMessage" placement="top">
                <span class="text-xs text-red-400 cursor-help">审核不通过</span>
              </el-tooltip>
            </div>
          </div>
          <!-- 编辑和下架 -->
          <div class="ml-auto flex items-center gap-2">
            <el-button text size="small" @click="editVideo(row)">
              <el-icon :size="16"><Edit /></el-icon>
              <span class="ml-1">编辑</span>
            </el-button>
            <el-button text size="small" type="danger" @click="confirmDelete(row)">
              <el-icon :size="16"><Delete /></el-icon>
              <span class="ml-1">删除</span>
            </el-button>
          </div>  
        </div>
      </template>
      

      <div v-if="total > 0" class="flex justify-end px-6 py-4 border-t border-zinc-100 dark:border-zinc-700">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          small
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </div>



    <!-- 删除确认 -->
    <el-dialog v-model="deleteDialogVisible" title="确认删除" width="400px" :close-on-click-modal="false">
      <div class="flex items-start gap-3">
        <el-icon :size="22" color="#f56c6c"><WarningFilled /></el-icon>
        <div>
          <p class="text-sm text-zinc-700 dark:text-zinc-300">
            确定要删除稿件 <strong>{{ deleteTarget?.title }}</strong> 吗？
          </p>
          <p class="text-xs text-zinc-400 mt-2">此操作不可撤销，删除后相关数据将无法恢复。</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="deleteDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="deleteSubmitting" @click="submitDelete">确认删除</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TimeUtil from '@/utils/TimeUtil'
import { useAuthStore } from '@/stores/modules/auth'
import NumberUtil from '@/utils/NumberUtil'
import { ElMessage } from 'element-plus'
import Loading  from '@/components/Loading/index.vue'
import { Search, WarningFilled, Edit, Delete } from '@element-plus/icons-vue'
import { deleteVideoInfo, listMyVideoInfo } from '@/api/video'
import { listVideoType } from '@/api/videoType'

const STATUS = { ALL: -1, PENDING: 0, APPROVED: 1, REJECTED: 2 } as const

const authStore = useAuthStore()

const sort = ref('publicTime')

const sortOptions = [
  { label: '按发布时间', value: 'publicTime' },
  { label: '按播放量', value: 'view' },
  { label: '按点赞数', value: 'like' },
  { label: '按评论数', value: 'reply' },
  { label: '按收藏数', value: 'favorite' },
  { label: '按弹幕数', value: 'barrage' },
]

const statusTabs = [
  { label: '全部', value: STATUS.ALL },
  { label: '审核中', value: STATUS.PENDING },
  { label: '已通过', value: STATUS.APPROVED },
  { label: '未通过', value: STATUS.REJECTED },
]

function getStatusLabel(status: number | undefined | null): string {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '未通过' }
  return status != null ? map[status] || '未知' : '未知'
}

function getStatusType(status: number | undefined | null): 'warning' | 'success' | 'danger' | 'info' {
  const map: Record<number, 'warning' | 'success' | 'danger' | 'info'> = { 0: 'warning', 1: 'success', 2: 'danger' }
  return status != null ? map[status] || 'info' : 'info'
}

const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const statusFilter = ref(STATUS.ALL)
const searchKeyword = ref('')

const videoTypeList = ref<any[]>([])



const deleteDialogVisible = ref(false)
const deleteSubmitting = ref(false)
const deleteTarget = ref<any>(null)


function onImgError(e: Event) {
  const target = e.target as HTMLImageElement
  target.src = '/vite.svg'
}

function timestampToDate(ts: string): string {
  if (!ts) return '-'
  return ts.replace('T', ' ').substring(0, 19)
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      pageNum: Math.max(0, pageNum.value - 1),
      pageSize: pageSize.value,
    }
    if (sort.value) {
      params.sort = sort.value
    }
    if (statusFilter.value !== STATUS.ALL) {
      params.status = statusFilter.value
    }
    if (searchKeyword.value.trim()) {
      params.title = searchKeyword.value.trim()
    }

    const res = await listMyVideoInfo(params)
    if (res.code === 200 || res.code === '200') {
      const data = res.data
      list.value = (data.records || []).map((item: any) => ({
        ...item,
        createTime: timestampToDate(item.createTime),
        updateTime: timestampToDate(item.updateTime),
      }))
      total.value = data.total || 0
      pageNum.value = (data.current || 0) + 1
    } else {
      ElMessage.error(res.msg || '获取稿件列表失败')
    }
  } catch (e: any) {
    ElMessage.error('获取稿件列表失败: ' + (e.message || ''))
  } finally {
    loading.value = false
  }
}

function handleStatusFilter(value: number) {
  statusFilter.value = value
  pageNum.value = 1
  fetchList()
}

function handleSearch() {
  pageNum.value = 1
  fetchList()
}

function handleSortChange() {
  fetchList()
}

function editVideo(row: any) {
  // editForm.aid = row.aid
  // editForm.title = row.title || ''
  // editForm.description = row.description || ''
  // editForm.tid = row.tid
  // editForm.tname = row.tname || ''
  // editForm.copyRight = row.copyRight || '1'
  // editForm.tags = row.tags || []
  // editDialogVisible.value = true
  window.open(`/platform/upload/video?type=edit&aid=${row.aid}`)
}


function confirmDelete(row: any) {
  deleteTarget.value = row
  deleteDialogVisible.value = true
}

async function submitDelete() {
  if (!deleteTarget.value) return
  deleteSubmitting.value = true
  try {
    const res = await deleteVideoInfo(deleteTarget.value.aid)
    if (res.code === 200 || res.code === '200') {
      ElMessage.success('稿件已删除')
      deleteDialogVisible.value = false
      deleteTarget.value = null
      fetchList()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (e: any) {
    ElMessage.error('删除失败: ' + (e.message || ''))
  } finally {
    deleteSubmitting.value = false
  }
}

onMounted(() => {
  fetchList()
  listVideoType().then((res: any) => {
    if (res.code === 200 || res.code === '200') {
      videoTypeList.value = res.data || []
    }
  })
})
</script>

<style scoped>
.manuscript-page :deep(.el-table) {
  --el-table-border-color: transparent;
}
.manuscript-page :deep(.el-table th.el-table__cell) {
  background-color: #f9fafb;
  color: #6b7280;
  font-weight: 600;
  font-size: 13px;
}
:deep(.dark) .manuscript-page :deep(.el-table th.el-table__cell) {
  background-color: #1f2937;
  color: #9ca3af;
}
.manuscript-page :deep(.el-table .el-table__row) {
  transition: background-color 0.2s;
}
.manuscript-page :deep(.el-table .el-table__row:hover) {
  background-color: #f3f4f6;
}
:deep(.dark) .manuscript-page :deep(.el-table .el-table__row:hover) {
  background-color: #374151;
}
.manuscript-page :deep(.el-table--striped .el-table__body tr.el-table__row--striped) {
  background-color: #fafafa;
}
:deep(.dark) .manuscript-page :deep(.el-table--striped .el-table__body tr.el-table__row--striped) {
  background-color: #1a1d29;
}
.manuscript-page :deep(.el-tag) {
  border: none;
  font-weight: 500;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
