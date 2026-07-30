<template>
  <div class="interaction-page">
    <div class="toolbar">
      <div class="toolbar-actions">
        <el-input
          v-model="keyword"
          placeholder="搜索弹幕内容或稿件标题"
          clearable
          class="search-input"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <div class="table-panel">
      <el-table ref="tableRef" v-loading="loading" :data="list" row-key="id" class="w-full">
        <el-table-column label="弹幕内容" min-width="300">
          <template #default="{ row }">
            <div class="content-main">
              <span class="color-dot" :style="{ backgroundColor: row.color || '#ffffff' }"></span>
              {{ row.text }}
            </div>
            <div class="content-sub">{{ row.senderName || `UID ${row.uid}` }}</div>
          </template>
        </el-table-column>
        <el-table-column label="所属稿件" min-width="220">
          <template #default="{ row }">
            <button class="video-link" @click="openVideo(row.aid)">
              {{ row.videoTitle || `稿件 ${row.aid}` }}
            </button>
          </template>
        </el-table-column>
        <el-table-column label="出现时间" width="120">
          <template #default="{ row }">{{ TimeUtil.formatDuration(row.time || 0) }}</template>
        </el-table-column>
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">{{ TimeUtil.formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button text type="danger" :icon="Delete" @click="confirmDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > 0" class="pagination">
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
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TableInstance } from 'element-plus'
import { Delete, Search } from '@element-plus/icons-vue'
import { deleteCreatorBarrage, listCreatorBarrages } from '@/api/barrage'
import TimeUtil from '@/utils/TimeUtil'

const loading = ref(false)
const tableRef = ref<TableInstance>()
const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const keyword = ref('')

async function refreshTableLayout() {
  await nextTick()
  tableRef.value?.doLayout()
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await listCreatorBarrages({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim(),
    })
    if (res.code === 200 || res.code === '200') {
      list.value = res.data?.records || []
      total.value = res.data?.total || 0
      pageNum.value = Number(res.data?.current || pageNum.value)
      return
    }
    ElMessage.error(res.msg || '获取弹幕列表失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '获取弹幕列表失败')
  } finally {
    loading.value = false
    await refreshTableLayout()
  }
}

function handleSearch() {
  pageNum.value = 1
  fetchList()
}

function openVideo(aid: number) {
  window.open(`/video/${aid}`, '_blank')
}

async function confirmDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定要删除这条弹幕吗？', '删除弹幕', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const res: any = await deleteCreatorBarrage(row.id)
    if (res.code === 200 || res.code === '200') {
      ElMessage.success('弹幕已删除')
      fetchList()
      return
    }
    ElMessage.error(res.msg || '删除失败')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error?.response?.data?.msg || '删除失败')
    }
  }
}

onMounted(fetchList)
</script>

<style scoped>
.interaction-page {
}
.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.toolbar h1 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 700;
}
.toolbar p {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.search-input {
  width: 280px;
}
.table-panel {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}
.content-main {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #18181b;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
}
.content-sub {
  margin-top: 4px;
  color: #71717a;
  font-size: 12px;
}
.color-dot {
  width: 10px;
  height: 10px;
  flex: 0 0 auto;
  border: 1px solid #d4d4d8;
  border-radius: 999px;
}
.video-link {
  text-align: left;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 14px 18px;
  border-top: 1px solid #f3f4f6;
}
</style>
