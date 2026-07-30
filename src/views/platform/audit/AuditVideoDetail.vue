<template>
  <div class="size-full">
    <!-- 顶部导航 -->
    <div class="flex items-center justify-between px-2 md:px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <div class="flex items-center gap-3">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span class="ml-1">返回列表</span>
        </el-button>
        <span class="text-base font-semibold text-zinc-800 dark:text-zinc-200">审核详情</span>
        <el-tag :type="getStatusType(videoInfo?.status)" effect="light" round size="small">
          {{ getStatusLabel(videoInfo?.status) }}
        </el-tag>
      </div>
      <div class="text-sm text-zinc-400">
        ID: {{ aid }}
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="flex justify-center items-center py-32">
      <Loading color="#409eff" scale="1.3" />
    </div>

    <template v-else>
      <div class="flex flex-row xl:flex-row gap-5 px-4 md:px-8 py-5">
        <!-- 左侧：播放器 + 操作区 -->
        <div class="xl:flex-[2] min-w-0">
          <!-- 视频播放器 -->
          <video-player
            :playUrl="playUrl"
            :enableBarrage="false"
            :enableHistory="false"
          />


          <!-- 审核操作卡片 -->
          <div class="mt-3">
            <div class="bg-white dark:bg-zinc-800 shadow rounded-lg p-4">
              <div class="flex flex-row items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-zinc-600 dark:text-zinc-400">审核操作</span>
                  <el-tag v-if="videoInfo?.status !== 0" :type="getStatusType(videoInfo?.status)" effect="dark" round size="small">
                    {{ getStatusLabel(videoInfo?.status) }}
                  </el-tag>
                </div>
                <div class="flex flex-row gap-2 flex-wrap">
                  <el-button
                    type="success"
                    :icon="Select"
                    :disabled="videoInfo?.status === 1"
                    :loading="auditing"
                    @click="approveVideo"
                  >
                    审核通过
                  </el-button>
                  <el-button
                    type="warning"
                    :icon="Close"
                    :disabled="videoInfo?.status === 2"
                    :loading="auditing"
                    @click="handleReject"
                  >
                    审核驳回
                  </el-button>
                  <el-button
                    type="danger"
                    :icon="Delete"
                    :disabled="false"
                    @click="handleDelete"
                  >
                    删除稿件
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 审核记录 -->
          <div v-if="videoInfo?.status !== 0" class="mt-3">
            <div class="bg-white dark:bg-zinc-800 shadow rounded-lg p-4">
              <h4 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-1">
                <el-icon><InfoFilled /></el-icon>
                审核信息
              </h4>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-3">
                  <span class="text-zinc-500 dark:text-zinc-400 w-16 shrink-0">审核结果</span>
                  <el-tag :type="getStatusType(videoInfo?.status)" effect="light" round size="small">
                    {{ getStatusLabel(videoInfo?.status) }}
                  </el-tag>
                </div>
                <div v-if="videoInfo?.auditMessage" class="flex items-start gap-3">
                  <span class="text-zinc-500 dark:text-zinc-400 w-16 shrink-0 pt-0.5">驳回原因</span>
                  <span class="text-zinc-700 dark:text-zinc-300">{{ videoInfo.auditMessage }}</span>
                </div>
                <!-- <div v-if="videoInfo?.auditId" class="flex items-center gap-3">
                  <span class="text-zinc-500 dark:text-zinc-400 w-16 shrink-0">审核人</span>
                  <span class="text-zinc-700 dark:text-zinc-300">管理员 #{{ videoInfo.auditId }}</span>
                </div> -->
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：信息面板 -->
        <div class="xl:flex-1 min-w-0 space-y-3">
          <!-- 视频基本信息 -->
          <div class="bg-white dark:bg-zinc-800 shadow rounded-lg p-4">
            <h4 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-1">
              <el-icon><Document /></el-icon>
              视频信息
            </h4>
            <div class="space-y-3.5">
              <!-- 标题 -->
              <div class="flex flex-row items-start gap-3">
                <label class="w-14 shrink-0 text-right text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">标题</label>
                <span class="text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-relaxed">{{ videoInfo?.title }}</span>
              </div>
              <!-- 分区 -->
              <div class="flex flex-row items-center gap-3">
                <label class="w-14 shrink-0 text-right text-xs text-zinc-500 dark:text-zinc-400">分区</label>
                <el-tag type="primary" effect="plain" size="small" round>
                  {{ videoInfo?.tname || '未分类' }}
                </el-tag>
              </div>
              <!-- 标签 -->
              <div v-if="videoInfo?.tags && videoInfo.tags.length > 0" class="flex flex-row items-start gap-3">
                <label class="w-14 shrink-0 text-right text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">标签</label>
                <div class="flex flex-wrap gap-1">
                  <el-tag
                    v-for="tag in videoInfo.tags"
                    :key="tag"
                    size="small"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
              <!-- 简介 -->
              <div class="flex flex-row items-start gap-3">
                <label class="w-14 shrink-0 text-right text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">简介</label>
                <p class="flex-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">{{ videoInfo?.description || '暂无简介' }}</p>
              </div>
              <!-- 时长 -->
              <div v-if="videoInfo?.duration" class="flex flex-row items-center gap-3">
                <label class="w-14 shrink-0 text-right text-xs text-zinc-500 dark:text-zinc-400">时长</label>
                <span class="text-sm text-zinc-700 dark:text-zinc-300">{{ TimeUtil.formatDuration(videoInfo.duration) }}</span>
              </div>
              <!-- 投稿时间 -->
              <div class="flex flex-row items-center gap-3">
                <label class="w-14 shrink-0 text-right text-xs text-zinc-500 dark:text-zinc-400">投稿时间</label>
                <span class="text-sm text-zinc-700 dark:text-zinc-300">{{ TimeUtil.formatDateTime(videoInfo?.createTime) }}</span>
              </div>
              <!-- 更新时间 -->
              <div v-if="videoInfo?.updateTime" class="flex flex-row items-center gap-3">
                <label class="w-14 shrink-0 text-right text-xs text-zinc-500 dark:text-zinc-400">更新时间</label>
                <span class="text-sm text-zinc-700 dark:text-zinc-300">{{ TimeUtil.formatDateTime(videoInfo.updateTime) }}</span>
              </div>
            </div>
          </div>

          <!-- 作者信息 -->
          <div v-if="owner" class="bg-white dark:bg-zinc-800 shadow rounded-lg p-4">
            <h4 class="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4 flex items-center gap-1">
              <el-icon><User /></el-icon>
              作者信息
            </h4>
            <div class="flex items-center gap-3">
              <el-avatar :size="48" :src="owner.avatar">
                <el-icon :size="24"><User /></el-icon>
              </el-avatar>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{{ owner.nickname || owner.username }}</span>
                  <span v-if="owner.level" class="text-xs text-zinc-400">Lv.{{ owner.level }}</span>
                </div>
                <div class="flex items-center gap-3 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>UID: {{ owner.uid }}</span>
                  <span v-if="owner.follower !== undefined">粉丝 {{ NumberUtil.formatCount(owner.follower) }}</span>
                  <span v-if="owner.following !== undefined">关注 {{ NumberUtil.formatCount(owner.following) }}</span>
                </div>
              </div>
            </div>
            <div v-if="owner.introduction" class="mt-2.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed truncate">
              {{ owner.introduction }}
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 驳回原因对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="审核驳回"
      width="420px"
      :close-on-click-modal="false"
      align-center
    >
      <div class="space-y-3">
        <p class="text-sm text-zinc-600 dark:text-zinc-400">
          确定驳回该视频稿件？请填写驳回原因以便作者了解问题。
        </p>
        <el-input
          v-model="rejectReason"
          type="textarea"
          :rows="4"
          placeholder="请输入驳回原因（选填）"
          maxlength="500"
          show-word-limit
        />
      </div>
      <template #footer>
        <el-button @click="rejectDialogVisible = false">取消</el-button>
        <el-button type="warning" :loading="auditing" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, View, ChatDotSquare, Top, Star, Share, Message,
  Select, Close, Delete, InfoFilled, Document, User
} from '@element-plus/icons-vue'
import { getVideoInfo, auditVideo, deleteVideoInfo } from '@/api/video'
import type { VideoInfo } from '@/types/video'
import type { UserInfo } from '@/types/user'
import type { VideoStat } from '@/types/video'
import Loading from '@/components/Loading/index.vue'
import TimeUtil from '@/utils/TimeUtil'
import NumberUtil from '@/utils/NumberUtil'

const route = useRoute()
const router = useRouter()
const aid = Number(route.params.id)

// 数据
const loading = ref(true)
const playUrl = ref<string>('')
const videoInfo = ref<VideoInfo>({})
const owner = ref<UserInfo | null>(null)
const stats = ref<VideoStat | null>(null)

// 审核状态
const auditing = ref(false)
const rejectDialogVisible = ref(false)
const rejectReason = ref('')



// 获取视频详情（含作者和统计数据）
async function fetchVideoDetail() {
  try {
    const res = await getVideoInfo({ aid })
    if (res.code === 200) {
      const data = res.data
      videoInfo.value = data.video || {}
      owner.value = data.owner || null
      stats.value = data.stats || null
      playUrl.value = data.playUrl || {}
    } else {
      ElMessage.error(res.msg || '获取视频详情失败')
    }
  } catch (e: any) {
    ElMessage.error('获取视频详情失败: ' + (e.message || ''))
  }
}

// 审核通过
async function approveVideo() {
  auditing.value = true
  try {
    const res = await auditVideo(aid, 1)
    if (res.code === 200) {
      ElMessage.success('审核通过成功')
      await fetchVideoDetail()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error('操作失败: ' + (e.message || ''))
  } finally {
    auditing.value = false
  }
}

// 点击驳回 → 弹出对话框
function handleReject() {
  rejectReason.value = ''
  rejectDialogVisible.value = true
}

// 确认驳回
async function confirmReject() {
  if (auditing.value) return
  auditing.value = true
  try {
    const res = await auditVideo(aid, 2, rejectReason.value || undefined)
    if (res.code === 200) {
      ElMessage.success('审核驳回成功')
      rejectDialogVisible.value = false
      await fetchVideoDetail()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e: any) {
    ElMessage.error('操作失败: ' + (e.message || ''))
  } finally {
    auditing.value = false
  }
}

// 删除稿件
function handleDelete() {
  ElMessageBox.confirm(
    '确定要删除该视频稿件吗？此操作不可恢复。',
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger',
    }
  ).then(async () => {
    auditing.value = true
    try {
      const res = await deleteVideoInfo(aid)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        router.push('/platform/audit/video')
      } else {
        ElMessage.error(res.msg || '删除失败')
      }
    } catch (e: any) {
      ElMessage.error('删除失败: ' + (e.message || ''))
    } finally {
      auditing.value = false
    }
  }).catch(() => {
    // 取消删除
  })
}

// 返回列表
function goBack() {
  router.push('/platform/audit/video')
}

// 状态工具函数
function getStatusLabel(status: number | null | undefined): string {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '未通过' }
  return status != null ? map[status] || '未知' : '未知'
}

function getStatusType(status: number | null | undefined): 'warning' | 'success' | 'danger' | 'info' {
  const map: Record<number, 'warning' | 'success' | 'danger' | 'info'> = { 0: 'warning', 1: 'success', 2: 'danger' }
  return status != null ? map[status] || 'info' : 'info'
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchVideoDetail()])
  loading.value = false
})
</script>

<style scoped>

</style>
