<template>
  <div class="interaction-page">
    <div class="toolbar">
      <div class="toolbar-actions">
        <el-select
          v-model="selectedAid"
          placeholder="全部稿件"
          clearable
          filterable
          class="video-select"
          @change="handleSearch"
          @clear="handleSearch"
        >
          <el-option
            v-for="video in videoOptions"
            :key="video.aid"
            :label="video.title"
            :value="video.aid"
          />
        </el-select>
        <el-input
          v-model="keyword"
          placeholder="搜索评论内容或稿件标题"
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
        <el-table-column label="评论内容" min-width="320">
          <template #default="{ row }">
            <div class="content-main" :title="row.message">{{ row.message }}</div>
            <div class="content-sub">
              <span>{{ row.user?.nickname || row.user?.username || `UID ${row.uid}` }}</span>
              <span v-if="row.replyToUsername">回复 @{{ row.replyToUsername }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="所属稿件" min-width="220">
          <template #default="{ row }">
            <button class="video-link" @click="openVideo(row.contentId)">
              {{ row.videoTitle || `稿件 ${row.contentId}` }}
            </button>
          </template>
        </el-table-column>
        <el-table-column label="互动" width="130">
          <template #default="{ row }">
            <div class="metric-line">赞 {{ row.likeCount || 0 }}</div>
            <div class="metric-line">回复 {{ row.replyCount || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">{{ TimeUtil.formatDateTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button text type="primary" :icon="ChatLineRound" @click="openReplyDialog(row)">回复</el-button>
              <el-button text type="danger" :icon="Delete" @click="confirmDelete(row)">删除</el-button>
            </div>
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

    <el-dialog v-model="replyDialogVisible" title="回复评论" width="520px" :close-on-click-modal="false">
      <div v-if="replyTarget" class="reply-context">
        <div class="reply-user">
          回复 {{ replyTarget.user?.nickname || replyTarget.user?.username || `UID ${replyTarget.uid}` }}
        </div>
        <div class="reply-message">{{ replyTarget.message }}</div>
      </div>
      <el-input
        v-model="replyMessage"
        type="textarea"
        :rows="4"
        maxlength="300"
        show-word-limit
        placeholder="写下你的回复"
      />
      <template #footer>
        <el-button @click="replyDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="replySubmitting" :disabled="!replyMessage.trim()" @click="submitReply">
          发送回复
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TableInstance } from 'element-plus'
import { ChatLineRound, Delete, Search } from '@element-plus/icons-vue'
import { deleteCreatorComment, listCreatorComments, sendComment } from '@/api/comment'
import { listMyVideoInfo } from '@/api/video'
import TimeUtil from '@/utils/TimeUtil'

const loading = ref(false)
const tableRef = ref<TableInstance>()
const list = ref<any[]>([])
const videoOptions = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const selectedAid = ref<number | undefined>()
const replyDialogVisible = ref(false)
const replySubmitting = ref(false)
const replyTarget = ref<any>(null)
const replyMessage = ref('')

async function refreshTableLayout() {
  await nextTick()
  tableRef.value?.doLayout()
}

async function fetchList() {
  loading.value = true
  try {
    const res: any = await listCreatorComments({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim(),
      aid: selectedAid.value,
    })
    if (res.code === 200) {
      list.value = res.data?.records || []
      total.value = res.data?.total || 0
      pageNum.value = Number(res.data?.current || pageNum.value)
      return
    }
    ElMessage.error(res.msg || '获取评论列表失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '获取评论列表失败')
  } finally {
    loading.value = false
    await refreshTableLayout()
  }
}

async function fetchVideoOptions() {
  try {
    const res: any = await listMyVideoInfo({
      pageNum: 1,
      pageSize: 1000,
    })
    if (res.code === 200) {
      videoOptions.value = res.data?.records || []
    }
  } catch {
    videoOptions.value = []
  }
}

function handleSearch() {
  pageNum.value = 1
  fetchList()
}

function openVideo(aid: number) {
  window.open(`/video/${aid}`, '_blank')
}

function openReplyDialog(row: any) {
  replyTarget.value = row
  replyMessage.value = ''
  replyDialogVisible.value = true
}

async function submitReply() {
  if (!replyTarget.value || !replyMessage.value.trim()) return
  replySubmitting.value = true
  try {
    const target = replyTarget.value
    const rootId = target.rootId || target.id
    const res: any = await sendComment({
      contentType: 1,
      contentId: target.contentId,
      message: replyMessage.value.trim(),
      rootId,
      parentId: target.id,
      replyTo: target.uid,
    })
    if (res.code === 200 || res.code === '200') {
      ElMessage.success('回复已发送')
      replyDialogVisible.value = false
      fetchList()
      return
    }
    ElMessage.error(res.msg || '回复失败')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.msg || '回复失败')
  } finally {
    replySubmitting.value = false
  }
}

async function confirmDelete(row: any) {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？如果是楼层评论，它的回复也会一起删除。', '删除评论', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const res: any = await deleteCreatorComment(row.id)
    if (res.code === 200 || res.code === '200') {
      ElMessage.success('评论已删除')
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

onMounted(() => {
  fetchVideoOptions()
  fetchList()
})
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
.video-select {
  width: 240px;
}
.table-panel {
  overflow: hidden;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
}
.content-main {
  color: #18181b;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.content-sub,
.metric-line {
  margin-top: 4px;
  color: #71717a;
  font-size: 12px;
}
.content-sub {
  display: flex;
  gap: 12px;
}
.video-link {
  text-align: left;
}
.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.reply-context {
  margin-bottom: 14px;
  border-radius: 8px;
  background: #f4f4f5;
  padding: 12px;
}
.reply-user {
  color: #3f3f46;
  font-size: 13px;
  font-weight: 600;
}
.reply-message {
  margin-top: 6px;
  color: #71717a;
  font-size: 13px;
  line-height: 1.6;
  word-break: break-word;
}
.pagination {
  display: flex;
  justify-content: flex-end;
  padding: 14px 18px;
  border-top: 1px solid #f3f4f6;
}
</style>
