<template>
  <div class="size-full">

    <div class="mb-5 flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 w-fit">
      <button
        v-for="tab in statusTabs"
        :key="tab.value"
        @click="handleStatusFilter(tab.value)"
        class="px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap"
        :class="statusFilter === tab.value
          ? 'bg-white dark:bg-zinc-700 text-sky-500 shadow-sm'
          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div v-if="loading" class="flex justify-center py-24">
        <Loading color="#409eff" />
      </div>

      <template v-else>
        <el-table ref="tableRef" :data="list" stripe style="width: 100%" empty-text="暂无数据" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="50" />
          <el-table-column prop="aid" label="ID" width="80" align="center" />
          <el-table-column label="封面" width="140" align="center">
            <template #default="{ row }">
              <div class="w-28 aspect-video rounded overflow-hidden bg-zinc-100 dark:bg-zinc-700">
                <img
                  :src="row.picture"
                  :alt="row.title"
                  class="w-full h-full object-cover"
                  @error="e => (e.target as HTMLImageElement).src = '/vite.svg'"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="标题" min-width="200">
            <template #default="{ row }">
              <div class="flex flex-col gap-0.5">
                <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-64" :title="row.title">{{ row.title }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="uid" label="投稿用户" width="100" align="center" />
          <el-table-column prop="tname" label="分区" width="120" align="center" />
          <el-table-column label="投稿时间" width="170" align="center">
            <template #default="{ row }">
              <span class="text-sm text-zinc-600 dark:text-zinc-400">{{ TimeUtil.formatDateTime(row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" effect="light" round size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <div v-if="row.status === 0" class="flex items-center justify-center gap-2">
                <!-- 详情按钮 -->
                <el-button text size="small" @click="goAuditDetail(row.aid)">
                  <span class="ml-1">详情</span>
                </el-button>
              </div>
              <span v-else class="text-xs text-zinc-400">已处理</span>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="total > 0" class="flex items-center justify-between px-4 py-3 border-t border-zinc-100 dark:border-zinc-700">
          <span class="text-sm text-zinc-500">共 {{ total }} 条</span>
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50]"
            layout="sizes, prev, pager, next, jumper"
            background
            small
            @size-change="fetchList"
            @current-change="fetchList"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { TableInstance } from 'element-plus'
import Loading from '@/components/Loading/index.vue'
import { listAuditVideo } from '@/api/video'
import TimeUtil from '@/utils/TimeUtil'

const STATUS = { PENDING: 0, APPROVED: 1, REJECTED: 2 }

const statusTabs = [
  { label: '待审核', value: STATUS.PENDING },
  { label: '已通过', value: STATUS.APPROVED },
  { label: '未通过', value: STATUS.REJECTED }
]

const loading = ref(false)
const tableRef = ref<TableInstance>()
const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const statusFilter = ref(STATUS.PENDING)

const selection = ref<any[]>([])

async function refreshTableLayout() {
  await nextTick()
  tableRef.value?.doLayout()
}

function handleSelectionChange(val: any[]) {
  selection.value = val
}

function getStatusLabel(status: number | null | undefined): string {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '未通过' }
  return status != null ? map[status] || '未知' : '未知'
}

function getStatusType(status: number | null | undefined): 'warning' | 'success' | 'danger' | 'info' {
  const map: Record<number, 'warning' | 'success' | 'danger' | 'info'> = { 0: 'warning', 1: 'success', 2: 'danger' }
  return status != null ? map[status] || 'info' : 'info'
}

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, any> = {
      pageNum:pageNum.value,
      pageSize: pageSize.value,
    }
    params.status = statusFilter.value
    
    const res = await listAuditVideo(params)
    if (res.code === 200) {
      const data = res.data
      list.value = (data.records || []).map((item: any) => ({
        ...item,
        createTime: TimeUtil.formatDateTime(item.createTime),
      }))
      total.value = data.total || 0
      pageNum.value = Number(data.current || pageNum.value)
    } else {
      ElMessage.error(res.msg)
    }
  } catch (e: any) {
    ElMessage.error('获取列表失败: ' + (e.message || ''))
  } finally {
    loading.value = false
    await refreshTableLayout()
  }
}

function handleStatusFilter(value: number) {
  statusFilter.value = value
  pageNum.value = 1
  fetchList()
}

function goAuditDetail(aid: number) {
  window.location.href = `/platform/audit/video/detail/${aid}`

}

onMounted(() => {
  fetchList()
})
</script>
