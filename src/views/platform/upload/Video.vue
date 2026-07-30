<template>
  <div class="size-full">
    <div v-show="!videoUploading && !videoUploaded" class="mb-8">
      <div class="bg-zinc-50 dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 sm:p-8">
        <div class="flex items-center gap-3 mb-6">
          <!-- <div class="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <svg-icon name="file" :width="20" :height="20" class="text-sky-500"></svg-icon>
          </div> -->
          <div>
            <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-200">上传视频文件</h2>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">支持 MP4、AVI、MOV 格式，单个文件最大 10GB</p>
          </div>
        </div>
        <div class="relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group"
          :class="[
            isDragOver
              ? 'border-sky-500 bg-sky-50/80 dark:bg-sky-900/20 scale-[1.01]'
              : 'border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/30 hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/30',
          ]"
          @dragenter.prevent="onDragEnter"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDrop"
          @click="triggerUpload"
        >
          <div class="absolute -inset-1 bg-gradient-to-r from-sky-400/10 via-purple-400/10 to-cyan-400/10 rounded-3xl blur-xl transition-opacity duration-500" :class="isDragOver ? 'opacity-100' : 'opacity-0'" />
          <div class="relative flex flex-col items-center justify-center py-24 px-8">
            <template v-if="selectedFile">
              <div class="w-full max-w-md">
                <div class="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200 dark:border-zinc-700">
                  <div class="w-14 h-14 rounded-xl bg-sky-600 dark:bg-zinc-900/30 flex items-center justify-center flex-shrink-0 shadow-md">
                    <svg-icon name="file-text" :width="28" :height="28" class="text-white"></svg-icon>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{{ selectedFile.name }}</p>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                  <button @click.stop="clearFile" class="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <svg-icon name="close" :width="16" :height="16"></svg-icon>
                  </button>
                </div>
                <div class="mt-4 flex justify-center">
                  <button class="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95" @click.stop="startUpload">
                    <span class="flex items-center gap-2">
                      <svg-icon name="upload-line" :width="16" :height="16"></svg-icon>
                      开始上传
                    </span>
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="relative mb-6 transition-transform duration-300" :class="isDragOver ? 'scale-110' : 'scale-100'">
                <div class="w-20 h-20 rounded-2xl bg-sky-400 dark:bg-zinc-900/30 flex items-center justify-center shadow-inner">
                  <svg-icon name="upload-line" :width="40" :height="40" class="text-white"></svg-icon>
                </div>
                <div class="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center shadow-lg transition-transform duration-300" :class="isDragOver ? 'rotate-45 scale-110' : ''">
                  <svg-icon name="plus-line" :width="14" :height="14" class="text-white"></svg-icon>
                </div>
              </div>
              <p class="text-base font-medium text-zinc-600 dark:text-zinc-300 transition-all duration-300" :class="isDragOver ? 'text-sky-500 dark:text-sky-400 scale-105' : ''">
                <template v-if="isDragOver">释放鼠标开始上传</template>
                <template v-else>点击或拖拽文件到此区上传</template>
              </p>
              <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-2">支持 MP4, AVI, MOV, MKV, WMV, FLV 格式，单个文件最大 10GB</p>
            </template>
          </div>
          <input ref="fileInputRef" type="file" :accept="acceptTypes.join(',')" class="hidden" @change="onFileChange" />
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-show="videoUploading || paused || videoUploaded" class="mb-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 transition-colors">
        <div class="flex items-center gap-4">
          <div class="w-24 aspect-video rounded-lg bg-sky-400 dark:bg-zinc-900/30 flex items-center justify-center flex-shrink-0 shadow-sm">
            <svg-icon name="file" :width="32" :height="32" class="text-white"></svg-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{{ videoFileName || '视频文件' }}</p>
            <div v-if="videoUploading" class="mt-2">
              <el-progress :percentage="videoUploadProgress" :stroke-width="6" :show-text="false" status="active" />
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{{ videoUploadProgress }}%</p>
            </div>
            <p v-else class="text-sm text-emerald-500 mt-1 flex items-center gap-1">
              <svg-icon name="check-circle" :width="16" :height="16"></svg-icon>
              上传完成
            </p>
          </div>
          <div class="flex-shrink-0 flex gap-2">
            <button v-if="videoUploading && !paused" class="p-2 rounded-lg text-zinc-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" @click="pauseUpload" title="暂停上传">
              <svg-icon name="pause" :width="20" :height="20"></svg-icon>
            </button>
            <button v-if="videoUploading" class="p-2 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" @click="cancelVideoUpload" title="取消上传">
              <svg-icon name="close" :width="20" :height="20"></svg-icon>
            </button>
            <button v-if="paused" class="p-2 rounded-lg text-zinc-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" @click="resumeUpload" title="继续上传">
              <svg-icon name="play" :width="20" :height="20"></svg-icon>
            </button>
            <button v-if="videoUploaded" class="p-2 rounded-lg text-zinc-400 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-colors" @click="replaceVideo" title="更换视频">
              <svg-icon name="upload-line" :width="20" :height="20"></svg-icon>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade-slide">
      <div v-if="videoUploading || videoUploaded || isEditMode" class="bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 sm:p-8">
        <div class="flex items-center gap-3 mb-8">
            <h2 class="text-lg font-semibold text-zinc-800 dark:text-zinc-200">填写视频信息</h2>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">完善视频信息能让更多人发现你的作品</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="max-w-2xl">
          <el-form-item label="封面" prop="picture" class="mb-6">
            <div class="relative w-72 aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all duration-300 group cursor-pointer"
                  :class="coverFile ? 'border-emerald-300 dark:border-emerald-700 hover:border-emerald-400' : 'border-zinc-300 dark:border-zinc-600 hover:border-sky-400 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50'"
                  @click="coverInputRef?.click()">
              <template v-if="imgUrl">
                <img :src="imgUrl" alt="封面预览" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <svg-icon name="upload-line" :width="40" :height="40" class="text-white"></svg-icon>
                </div>
              </template>
              <template v-else>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 group-hover:text-sky-500 transition-colors duration-300">
                  <svg-icon name="image" :width="40" :height="40" class="mb-2"></svg-icon>
                  <p class="text-sm">点击上传封面图片</p>
                  <p class="text-xs mt-1 text-zinc-400">支持 JPG, PNG, WebP 格式</p>
                </div>
              </template>
            </div>
            <input ref="coverInputRef" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handleCoverChange" />
          </el-form-item>

          <el-form-item label="视频标题" prop="title" class="mb-6">
            <el-input v-model="form.title" size="large" placeholder="请输入视频标题，建议 5-20 个字" maxlength="80" clearable />
          </el-form-item>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <el-form-item label="版权类型" prop="copyRight">
              <el-radio-group v-model="form.copyRight" :disabled="isEditMode">
                <el-radio-button value="1"><span class="flex items-center gap-1.5">原创</span></el-radio-button>
                <el-radio-button value="2"><span class="flex items-center gap-1.5">转载</span></el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="视频分区" prop="tid">
              <el-cascader v-model="form.tid" :options="videoTypeList" :props="videoTypeProps" placeholder="请选择视频分区" clearable class="w-full" />
            </el-form-item>
          </div>

          <el-form-item label="视频标签" prop="tags" class="mb-6">
            <el-input-tag v-model="form.tags" size="large" placeholder="按回车键创建标签" class="w-full" />
          </el-form-item>

          <el-form-item label="视频简介" prop="description" class="mb-6">
            <el-input type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" v-model="form.description" placeholder="介绍一下你的视频内容.." maxlength="200" show-word-limit />
          </el-form-item>
        </el-form>

        <div class="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-700">
          <button class="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="(!videoUploaded && !isEditMode) || isSubmitting" @click="onSubmit">
            <span class="flex items-center gap-2">
              <svg-icon v-if="!isSubmitting" name="check-circle" :width="16" :height="16"></svg-icon>
              <svg-icon v-else name="loading-circle" :width="16" :height="16" class="animate-spin"></svg-icon>
              {{ isSubmitting ? '投稿中..' : (isEditMode ? '保存修改' : '立即投稿') }}
            </span>
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElCascader } from 'element-plus'
import { useRoute } from 'vue-router'
import { listVideoType } from '@/api/videoType'
import { addVideoInfo, getVideoInfo, updateVideoInfo } from '@/api/video'
import { uploadSlice as uploadFileSlice, getUploadedChunks, cancelUpload } from '@/api/file'
import { VideoType } from '@/types/video'

const form = reactive({
  title: "",
  tags: [] as string[],
  description: "",
  copyRight: "1",
  tid: undefined as number | undefined,
  tname: "",
  fileInfo: {} as any,
})

const formRef = ref()
const isSubmitting = ref(false)
const imgUrl = ref("")

const videoTypeProps = {
  value: 'tid',
  label: 'typeName',
  children: 'children',
}

const rules = {
  title: [
    { required: true, message: "请输入视频标题", trigger: "blur" },
    { min: 5, max: 80, message: "长度在5到80个字符之间", trigger: "blur" },
  ],
  description: [
    { required: true, message: "请输入视频简介", trigger: "blur" },
    { min: 1, max: 200, message: "长度在1到200个字符之间", trigger: "blur" },
  ],
  copyRight: [{ required: true, message: "请选择版权类型", trigger: "change" }],
  tid: [{ required: true, message: "请选择视频分区", trigger: "change" }],
}

const videoUploading = ref(false)
const videoUploaded = ref(false)
const videoUploadProgress = ref(0)
const videoFileName = ref('')
const uploadGuid = ref('')
const paused = ref(false)
const uploadedChunks = ref<Set<number>>(new Set())


const route = useRoute()
const isEditMode = computed(() => route.query.type === 'edit')
const editAid = computed(() => route.query.aid as string)

const selectedFile = ref<File | null>(null)
const isDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const chunkStatuses = ref<string[]>([])
const cancelFlag = ref(false)
const uploadSpeed = ref("")
const progressDetail = ref("")
let speedStartTime = 0
let speedLoaded = 0

const acceptTypes = ["video/mp4", "video/avi", "video/mov", "video/x-msvideo", "video/quicktime", "video/x-matroska", "video/x-flv"]

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function createGuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function onDragEnter(e: DragEvent) { isDragOver.value = true }
function onDragOver(e: DragEvent) { isDragOver.value = true }
function onDragLeave(e: DragEvent) { isDragOver.value = false }

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) handleVideoFile(files[0])
}


function triggerUpload() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) handleVideoFile(target.files[0])
  target.value = ""
}

function handleVideoFile(file: File) {
  const isValidType = acceptTypes.some(t => file.type === t || file.name.toLowerCase().endsWith(t.replace("video/", ".")))
  const isValidExt = /\.(mp4|avi|mov|mkv|wmv|flv)$/i.test(file.name)
  if (!isValidType && !isValidExt) {
    ElMessage.error("不支持的文件格式，请选择 MP4、AVI、FLV 或 MOV 格式")
    return
  }
  selectedFile.value = file
}

function clearFile() {
  selectedFile.value = null
  videoUploadProgress.value = 0
}

async function uploadSlice(filePart: Blob, guid: string, chunk: number): Promise<boolean> {
  const formData = new FormData()
  formData.append("file", filePart); formData.append("guid", guid); formData.append("chunk", chunk.toString())
  try {
    const res: any = await uploadFileSlice(formData)
    return res.code === 200
  } catch { return false }
}



async function startUpload() {
  if (!selectedFile.value) return
  const file = selectedFile.value
  const fileName = file.name
  const fileSize = file.size
  const chunkSize = 5 * 1024 * 1024
  const chunkCount = Math.ceil(fileSize / chunkSize)
  const guid = uploadGuid.value || createGuid()
  uploadGuid.value = guid
  cancelFlag.value = false
  videoUploading.value = true
  videoUploaded.value = false
  videoUploadProgress.value = 0
  videoFileName.value = fileName
  uploadSpeed.value = ""
  chunkStatuses.value = new Array(chunkCount).fill("pending")
  speedStartTime = Date.now()
  speedLoaded = 0
  // 跳过已上传的分片
  const skipSet = new Set(uploadedChunks.value)
  let successCount = skipSet.size
  for (let i = 0; i < chunkCount; i++) {
    if (cancelFlag.value) { resetVideoUpload(); return }
    chunkStatuses.value[i] = "uploading"
    const start = i * chunkSize
    const end = Math.min(fileSize, start + chunkSize)
    const filePart = file.slice(start, end)
    const success = await uploadSlice(filePart, guid, i)
    if (success) {
      successCount++
      chunkStatuses.value[i] = "done"
      videoUploadProgress.value = Math.round((successCount / chunkCount) * 100)
      speedLoaded += filePart.size
      const elapsed = (Date.now() - speedStartTime) / 1000
      if (elapsed > 0) uploadSpeed.value = formatFileSize(speedLoaded / elapsed) + "/s"
      progressDetail.value = "分片 " + successCount + " / " + chunkCount
    } else {
      chunkStatuses.value[i] = "error"
      ElMessage.error("第" + (i + 1) + " 个分片上传失败")
      return
    }
  }
    videoUploading.value = false
    videoUploadProgress.value = 100
    // 所有分片上传完毕，触发后端合并转码
    videoUploading.value = false
    videoUploaded.value = true
    videoUploadProgress.value = 100
    ElMessage.success("视频上传成功")
}


function pauseUpload() {
  paused.value = true
}

async function resumeUpload() {
  if (!selectedFile.value || !uploadGuid.value) return
  // 查询已上传的分片
  try {
    const res: any = await getUploadedChunks(uploadGuid.value)
    if (res.code === 200 && Array.isArray(res.data)) {
      uploadedChunks.value = new Set(res.data as number[])
    }
  } catch {}
  paused.value = false
  startUpload()
}
function cancelVideoUpload() {
  cancelFlag.value = true
  paused.value = false
  if (uploadGuid.value) {
    cancelUpload(uploadGuid.value).catch(() => {})
  }
  videoUploading.value = false
  videoUploaded.value = false
  videoUploadProgress.value = 0
  videoFileName.value = ""
  selectedFile.value = null
  form.fileInfo = {}
  uploadGuid.value = ''
  chunkStatuses.value = []
  ElMessage.info("已取消上传")
}

function resetVideoUpload() {
  videoUploading.value = false
  videoUploaded.value = false
  videoUploadProgress.value = 0
  videoFileName.value = ""
  selectedFile.value = null
  form.fileInfo = {}
  uploadGuid.value = ''
  paused.value = false
  uploadedChunks.value = new Set()
  chunkStatuses.value = []
}

const coverInputRef = ref<HTMLInputElement | null>(null)
const coverFile = ref<File | null>(null)

function handleCoverChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const isValidType = ["image/jpeg", "image/png", "image/webp"].includes(file.type)
    const isLessThan5M = file.size / 1024 / 1024 < 5
    if (!isValidType) { ElMessage.error("图片只能是 JPG、PNG 或 WebP 格式!"); return }
    if (!isLessThan5M) { ElMessage.error("图片大小不能超过 5MB!"); return }
    imgUrl.value = URL.createObjectURL(file)
    coverFile.value = file
  }
}

const videoTypeList = ref<VideoType[]>([])

function findInTree(list: VideoType[], tid: number): VideoType | undefined {
  for (const item of list) {
    if (item.tid === tid) return item
    if (item.children) {
      const found = findInTree(item.children, tid)
      if (found) return found
    }
  }
  return undefined
}

function handleTypeChange(selectedTid: number) {
  const selectedItem = findInTree(videoTypeList.value, selectedTid)
  form.tname = selectedItem?.typeName || ""
}

onMounted(() => {
  if (isEditMode.value) {
    videoUploaded.value = true
    videoFileName.value = '加载中...'
    loadVideoInfo()
  }
  listVideoType().then((res: any) => {
    if (res.code == "200") { videoTypeList.value = res.data }
    else { ElMessage.error("获取视频类型失败") }
  })
})

async function onSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) {
    ElMessage.warning('请完善表单信息')
    return
  }

  isSubmitting.value = true

  try {
  if (isEditMode.value) {
      const submitData: Record<string, any> = {
        aid: editAid.value,
        title: form.title,
        tags: form.tags,
        description: form.description,
        copyRight: form.copyRight,
        tid: form.tid,
        tname: form.tname,
      }
      if (uploadGuid.value && videoFileName.value) {
        submitData.guid = uploadGuid.value
        submitData.fileName = videoFileName.value
      }
      const formData = new FormData()
      formData.append('videoInfo', JSON.stringify(submitData))
      if (coverFile.value) {
        formData.append('pictureFile', coverFile.value)
      }
      const res = await updateVideoInfo(formData)
      if (res.code === 200) {
        ElMessage.success('提交成功，等待审核')
        resetAll()
      } else {
        ElMessage.error(res.msg || '提交失败')
      }

      return
    }
    const formData = new FormData()
    const submitData = {
      title: form.title,
      tags: form.tags,
      description: form.description,
      copyRight: form.copyRight,
      tid: form.tid,
      tname: form.tname,
      guid: uploadGuid.value,
      fileName: videoFileName.value,
  }
    formData.append('videoInfo', JSON.stringify(submitData))
    if (coverFile.value) {
      formData.append('pictureFile', coverFile.value)
    }
    const res = await addVideoInfo(formData)
    if (res.code === 200) {
      ElMessage.success('提交成功，等待审核')
      resetAll()
    } else {
      ElMessage.error(res.msg || "提交失败")
    }
  } catch {
    ElMessage.error("提交失败，请稍后重试")
  } finally {
    isSubmitting.value = false
  }
}

function resetAll() {
  form.title = ""; form.tags = []; form.description = ""
  form.copyRight = "1"; form.tid = undefined; form.tname = ""; form.fileInfo = {}
  uploadGuid.value = ''
  paused.value = false
  uploadedChunks.value = new Set()
  coverFile.value = null
  imgUrl.value = ""
  videoUploading.value = false
  videoUploaded.value = false
  videoUploadProgress.value = 0
  videoFileName.value = ''
  selectedFile.value = null
  chunkStatuses.value = []
}


async function loadVideoInfo() {
  if (!editAid.value) return
  try {
    const res = await getVideoInfo({ aid: editAid.value })
    if (res.code === 200) {
      
      const data = res.data.video
      form.title = data.title || ''
      form.description = data.description || ''
      form.copyRight = data.copyRight || '1'
      form.tid = data.tid
      form.tname = data.tname || ''
      form.tags = data.tags
        ? (typeof data.tags === 'string' ? data.tags.split(',') : Array.isArray(data.tags) ? data.tags : [])
        : []
      if (data.picture) {
        console.log('Setting imgUrl to:', data.picture)
        imgUrl.value = data.picture
      }
      videoUploaded.value = true
      videoFileName.value = data.title || ''
    } else {
      ElMessage.error('获取视频信息失败')
    }
  } catch {
    ElMessage.error('获取视频信息失败')
  }
}
function replaceVideo() {
  videoUploaded.value = false
  videoUploading.value = false
  videoUploadProgress.value = 0
  selectedFile.value = null
  form.fileInfo = {}
  uploadGuid.value = ''
  paused.value = false
  uploadedChunks.value = new Set()
  chunkStatuses.value = []
  fileInputRef.value?.click()
}


</script>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-slide-enter-from { opacity: 0; transform: translateX(24px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-24px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.animate-spin { animation: spin 1s linear infinite; }
:deep(.el-input__wrapper), :deep(.el-textarea__inner) { border-radius: 10px !important; box-shadow: 0 1px 2px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.06) !important; transition: all 0.2s !important; }
:deep(.el-input__wrapper:hover), :deep(.el-textarea__inner:hover) { box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(59,130,246,0.4) !important; }
:deep(.el-input__wrapper.is-focus), :deep(.el-textarea__inner.is-focus) { box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 2px rgba(59,130,246,0.3) !important; }
:deep(.el-select .el-input__wrapper) { border-radius: 10px !important; }
:deep(.el-radio-button__inner) { border-radius: 10px !important; padding: 8px 18px !important; border-color: #e5e7eb !important; }
:deep(.el-radio-button:first-child .el-radio-button__inner) { border-radius: 10px 0 0 10px !important; }
:deep(.el-radio-button:last-child .el-radio-button__inner) { border-radius: 0 10px 10px 0 !important; }
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) { background: linear-gradient(135deg, #3b82f6, #6366f1) !important; border-color: transparent !important; box-shadow: 0 2px 8px rgba(59,130,246,0.3) !important; }
:deep(.el-input-tag__wrapper) { border-radius: 10px !important; box-shadow: 0 1px 2px rgba(0,0,0,0.02), 0 0 0 1px rgba(0,0,0,0.06) !important; min-height: 42px !important; padding: 4px 12px !important; }
:deep(.el-input-tag__wrapper:hover) { box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(59,130,246,0.4) !important; }
:deep(.el-input-tag__wrapper.is-focus) { box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 0 0 2px rgba(59,130,246,0.3) !important; }
:deep(.el-input-tag__tag) { border-radius: 6px !important; }
:deep(.el-form-item__label) { font-weight: 600 !important; font-size: 13px !important; color: #374151 !important; padding-bottom: 6px !important; }
:deep(.el-progress-bar__outer) { border-radius: 99px !important; overflow: hidden; }
:deep(.el-progress-bar__inner) { border-radius: 99px !important; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important; }
</style>

