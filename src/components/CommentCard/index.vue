<template>
    <div class="comment-section bg-white dark:bg-zinc-900 rounded-lg my-4 p-6 shadow-md">
      <!-- 评论区标题 -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <h3 class="text-lg font-bold mr-2">评论</h3>
          <span class="text-zinc-500 text-sm">({{ totalComments }})</span>
        </div>
        
        <el-radio-group v-model="currentSort" size="small" @change="handleSortChange">
          <el-radio-button :label="0">最热</el-radio-button>
          <el-radio-button :label="1">最新</el-radio-button>
        </el-radio-group>
      </div>
  
      <!-- 评论输入区域 -->
      <div class="comment-input-area flex mb-6">
        <div class="mr-3">
          <el-avatar :src="userInfo?.avatar" :size="50" />
        </div>
        <div class="flex-1">
          <el-input
            v-model="commentMessage"
            type="textarea"
            :rows="3"
            maxlength="1000"
            show-word-limit
            resize="none"
            placeholder="发一条友善的评论"
            class="mb-2"
            @keydown.alt.enter.prevent="submitComment"
          />
          <div class="flex justify-between items-center">
            <div class="emoji-panel">
              <el-popover
                placement="top"
                :width="320"
                trigger="click"
              >
                <template #reference>
                  <el-button text>
                    表情
                  </el-button>
                </template>
                <div class="emoji-grid grid grid-cols-8 gap-2 p-2">
                  <div 
                    v-for="emoji in emojiList" 
                    :key="emoji"
                    class="emoji-item cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 p-1 rounded text-center text-lg"
                    @click="insertEmoji(emoji)"
                  >
                    {{ emoji }}
                  </div>
                </div>
              </el-popover>
            </div>
            <el-button 
              type="primary" 
              :disabled="!commentMessage.trim()" 
              @click="submitComment"
            >
              发布
            </el-button>
          </div>
        </div>
      </div>
  
      <!-- 评论列表 -->
      <div class="comment-list">
        <template v-if="comments.length > 0">
          <div 
            v-for="comment in comments" 
            :key="comment.id"
            :data-comment-id="comment.id"
            class="comment-item py-4 border-b border-zinc-100 dark:border-zinc-800"
            :class="{ 'comment-target': highlightedCommentId === comment.id }"
          >
            <!-- 评论主体 -->
            <div class="flex">
              <div class="mr-3">
                <router-link :to="`/space/${comment.user.uid}`" target="_blank">
                  <img :src="comment.user?.avatar" class="w-12 h-12 rounded-full" />
                </router-link>
                <div 
                  v-show="comment.uid === ownerId" 
                  class="author-tag text-xs text-center bg-sky-500 text-white rounded mt-1 px-1"
                >
                  UP
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center">
                  <span class="username font-medium mr-2 text-zinc-500 text-sm">
                    <router-link :to="`/space/${comment.user.uid}`" target="_blank">
                      {{ comment.user?.nickname }}
                    </router-link>
                  </span>
                  <span 
                    v-show="comment.user?.level" 
                    class="user-level text-xs border rounded px-1"
                  >
                    LV{{ comment.user?.level }}
                  </span>
                </div>
                
                <!-- 评论内容 -->
                <div class="comment-content mt-2 text-base leading-relaxed break-words text-zinc-800 dark:text-zinc-200">                  
                  {{ comment.message }}
                </div>
                
                <!-- 评论元数据 -->    
                <div class="comment-meta text-xs mt-2 text-zinc-500 flex items-center gap-4">
                  <span>{{ TimeUtil.formatDateTime(comment.createTime) }}</span>
                  
                  <div class="actions flex items-center">
                    <!-- 点赞按钮 -->
                    <div 
                      class="like-btn flex items-center gap-1 cursor-pointer hover:text-sky-500 mr-4 "
                      :class="{ 'text-sky-500': comment.hasLiked }"
                      @click="toggleLike(comment)"
                    >
                      <SvgIcon name="like" :width="16" :height="16"/>
                      <span>{{ NumberUtil.formatCount(comment.likeCount) }}</span>
                    </div>
                    
                    <!-- 踩按钮 -->
                    <!-- <div 
                      class="dislike-btn flex items-center cursor-pointer hover:text-zinc-700 mr-4"
                      @click="toggleDislike(comment)"
                    >
                      <el-icon :height="14" :width="14" class="mr-1"><Bell /></el-icon>
                    </div> -->
                    
                    <!-- 回复按钮 -->
                    <div 
                      class="reply-btn cursor-pointer hover:text-primary"
                      @click="startReply(comment)"
                    >
                      回复
                    </div>
                  </div>
                </div>
                
                <!-- 回复输入框 -->
                <div 
                  v-show="currentReplyTo === comment.id"
                  class="reply-input-area mt-3"
                >
                  <el-input
                    v-model="replyContent"
                    type="textarea"
                    :rows="2"
                    maxlength="1000"
                    show-word-limit
                    resize="none"
                    :placeholder="`回复 @${currentReplyToComment?.user?.nickname || comment.user?.nickname}：`"
                    class="mb-2"
                    @keydown.alt.enter.prevent="submitReply(comment)"
                  />
                  <div class="flex justify-end">
                    <el-button text @click="cancelReply">取消</el-button>
                    <el-button 
                      type="primary" 
                      :disabled="!replyContent.trim()" 
                      @click="submitReply(comment)"
                    >
                      回复
                    </el-button>
                  </div>
                </div>
                
                <!-- 回复列表 -->
                <div class="replies-list mt-3" v-show="comment.replies && comment.replies.length > 0">
                  <div 
                    v-for="reply in comment.replies" 
                    :key="reply?.id"
                    :data-comment-id="reply?.id"
                    class="reply-item py-2 text-sm"
                    :class="{ 'comment-target': highlightedCommentId === reply?.id }"
                  >
                    <div class="flex">
                      <div class="mr-2">
                        <router-link :to="`/space/${reply.user.uid}`" target="_blank">
                          <img :src="reply.user?.avatar" class="w-8 h-8 rounded-full" />
                        </router-link>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center">
                          <span class="username font-medium text-primary mr-1 text-zinc-500">
                            <router-link :to="`/space/${reply.user.uid}`" target="_blank">
                              {{ reply.user?.nickname }}
                            </router-link>
                          </span>
                          <span 
                            v-show="reply.user.uid"
                            class="author-tag text-xs bg-sky-500 text-white rounded px-1 mr-1"
                          >
                            UP
                          </span>
                        </div>
                        <div class="reply-content mt-2">
                          <span v-show="reply.replyTo" class="text-zinc-500">
                            回复 <router-link :to="`/space/${reply.replyTo}`" class="!text-sky-600 hover:!text-sky-400" target="_blank">@{{ reply.replyToUsername }}</router-link>：
                          </span>
                          {{ reply.message }}
                        </div>
                        
                        <!-- 回复的操作 -->
                        <div class="reply-actions mt-2">
                          <div class="flex items-center text-xs text-zinc-500 gap-4">
                            {{ TimeUtil.formatDateTime(reply.createTime) }}
                            <!-- 点赞按钮 -->
                            <div 
                              class="like-btn flex items-center group-1 hover:text-sky-500 cursor-pointer mr-3"
                              :class="{ 'text-sky-500': reply.hasLiked }"
                              @click="toggleLike(reply)"
                            >
                              <SvgIcon name="like" :width="16" :height="16"/>
                              <span>{{ NumberUtil.formatCount(reply.likeCount) }}</span>
                            </div>
                            
                            <!-- 回复按钮 -->
                            <div 
                              class="reply-btn cursor-pointer hover:text-primary"
                              @click="startReply(comment, reply)"
                            >
                              回复
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    <!-- 查看更多回复 -->
                  <div 
                    v-show="comment.replyCount && comment.replies && comment.replyCount > comment.replies.length"
                    class="mt-2 text-xs  cursor-pointer text-zinc-500 "
                    @click="loadMoreReplies(comment)"
                  >
                    共{{ comment.replyCount }}条回复，点击查看更多
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 空状态 -->
        <el-empty
          v-else
          description="暂无评论，快来抢沙发吧～"
        >
        </el-empty>
        
        <!-- 加载更多 -->
        <div class="load-more flex justify-center mt-4" v-if="hasMoreComments">
          <el-button 
            :loading="isLoadingMore" 
            @click="loadMoreComments"
            text
          >
            显示更多评论
          </el-button>
        </div>
      </div>
    </div>
</template>
<script setup lang="ts">  import { ref, nextTick, onMounted } from 'vue';
  import { ElMessage } from 'element-plus';
  import TimeUtil from '@/utils/TimeUtil';
  import NumberUtil from '@/utils/NumberUtil';
  import { useAuthStore } from '@/stores/modules/auth';
  import type { CommentDTO } from '@/types/comment';
  import SvgIcon from '../SvgIcon.vue';
  import { listComment, repliesComment, likeComment, sendComment } from '@/api/comment';
  import { useLoginDialog } from '@/components/LoginRegisterDialog/useLoginDialog';

  
  const authStore = useAuthStore();
  const { showLoginDialog } = useLoginDialog();
  // 当前用户信息
  const userInfo = authStore.userInfo;  
  const props = defineProps({
    contentId: {
      type: Number,
      required: true,
    },
    contentType: {
      type: Number,
      required: true,
    },
    ownerId: {
      type: Number,
      required: true,
      default: null,
    },
    initialCommentId: {
      type: Number,
      default: null,
    },
  });

  // 评论相关数据（使用 HTTP 获取）
  const comments = ref<CommentDTO[]>([]);
  
  // 表情列表
  const emojiList = ref([
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥'
  ]);
    // 评论状态
  const commentMessage = ref('');
  const replyContent = ref('');
  const currentReplyTo = ref<number | null>(null);
  const currentReplyToComment = ref<CommentDTO | null>(null);
  const isLoadingMore = ref(false);
  const totalComments = ref(0); // 总评论数
  const hasMoreComments = ref(false);
  const highlightedCommentId = ref<number | null>(null);
  const currentSort = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);

  const requestLoginThen = (action: () => void | Promise<void>) => {
    showLoginDialog({
      initialTab: 'login',
      onLogin: async () => {
        await action();
      },
    });
  };

  // 通过 HTTP 获取评论列表
  async function getCommentList(append = false) {
    try {
      const params = {
        contentId: props.contentId,
        contentType: props.contentType,
        sortType: currentSort.value,
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        ...(props.initialCommentId ? { commentId: props.initialCommentId } : {}),
      };
      
      const res: any = await listComment(params);
      
      if (res.code === 200) {
        if (append) {
          // 加载更多时追加
          comments.value.push(...(res.data.records || []));
        } else {
          // 初始加载或排序切换时替换
          comments.value = res.data.records || [];
        }
        
        totalComments.value = res.data.total || 0;
        hasMoreComments.value = comments.value.length < totalComments.value;
      } else {
        ElMessage.error(res.msg || '获取评论失败');
      }
    } catch {
      ElMessage.error('获取评论失败，请稍后再试');
    }
  }
  
  // 提交评论
  const submitComment = async () => {
    if (!commentMessage.value.trim()) return;
    
    // 检查是否登录
    if (!authStore.isAuthenticated) {
      requestLoginThen(submitComment);
      return;
    }

    try {
      const params = {
        message: commentMessage.value,
        contentId: props.contentId,
        contentType: props.contentType,
      };
      

      await sendComment(params).then((res: any) => {
        if (res.code === 200) {
          commentMessage.value = '';
          ElMessage.success('评论发布成功');
        } else {
          ElMessage.error(res.msg || '评论发布失败');
        }
      });
      commentMessage.value = '';
    } catch (error: any) {
      ElMessage.error(error.message || '评论发布失败，请稍后再试');
    }
  };
  
  // 开始回复
  const startReply = (comment: CommentDTO, reply?: CommentDTO) => {
    if (!authStore.isAuthenticated) {
      requestLoginThen(() => startReply(comment, reply));
      return;
    }

    const replyTarget = reply || comment;
    currentReplyToComment.value = replyTarget;
    console.log('Replying to comment:', replyTarget);
    currentReplyTo.value = comment.id;
    replyContent.value = '';
    
    nextTick(() => {
      const textarea = document.querySelector('.reply-input-area textarea');
      if (textarea) {
        (textarea as HTMLTextAreaElement).focus();
      }
    });
  };
  
  // 取消回复
  const cancelReply = () => {
    currentReplyTo.value = null;
    currentReplyToComment.value = null;
    replyContent.value = '';
  };

  // 提交回复
  async function submitReply(comment: CommentDTO) {
    if (!replyContent.value.trim()) return;
    
    // 检查是否登录
    if (!authStore.isAuthenticated) {
      requestLoginThen(() => submitReply(comment));
      return;
    }
    
    try {
      const replyTarget = currentReplyToComment.value || comment;
      const params = {
        message: replyContent.value,
        contentId: props.contentId,
        contentType: props.contentType,
        rootId: comment.id,
        parentId: replyTarget.id,
        replyTo: replyTarget.uid,
      };
      
      await sendComment(params).then((res: any) => {
        if (res.code === 200) {
          if (!comment.replies) {
            comment.replies = [];
          }

          ElMessage.success('回复成功');
        } else {
          ElMessage.error(res.msg || '回复失败');
        }
      });

      cancelReply();
    } catch (error: any) {
      ElMessage.error(error.message || '回复失败，请稍后再试');
    }
  };
  // 点赞/取消点赞
  const toggleLike = (_item: CommentDTO) => {
    if (!authStore.isAuthenticated) {
      requestLoginThen(() => toggleLike(_item));
      return;
    }

    likeComment(_item.id)
      .then((res: any) => {
        if (res.code === 200 || res.code === '200') {
          const nextLiked = Boolean(res.data);
          const wasLiked = Boolean(_item.hasLiked);
          _item.hasLiked = nextLiked;
          if (nextLiked !== wasLiked) {
            const delta = nextLiked ? 1 : -1;
            _item.likeCount = Math.max(0, (_item.likeCount || 0) + delta);
          }
        } else {
          ElMessage.error(res.msg || '操作失败');
        }
      })
      .catch((error) => {
        ElMessage.error('操作失败，请稍后再试');
      });
  };
  
  // 踩操作
  // const toggleDislike = (_comment: CommentDTO) => {
  // };
  
  // 插入表情
  const insertEmoji = (emoji: string) => {
    if (currentReplyTo.value) {
      replyContent.value += emoji;
    } else {
      commentMessage.value += emoji;
    }
  };
    // 加载更多评论
  const loadMoreComments = async () => {
    if (isLoadingMore.value || !hasMoreComments.value) return;
    
    isLoadingMore.value = true;
    currentPage.value++;
    
    try {
      await getCommentList(true);
    } catch {
      currentPage.value--; // 回滚页码
    } finally {
      isLoadingMore.value = false;
    }
  };
  
  // 加载更多回复（通过 HTTP）
  const loadMoreReplies = async (comment: CommentDTO) => {
    try {
      const params = {
        rootId: comment.id,
        contentId: props.contentId,
        contentType: props.contentType,
        sortType: 2,
        pageNum: 1,
        pageSize: 10,
      };
        const res: any = await repliesComment(params);
      
      if (res.code === 200) {
        const replies = res.data.records || [];
        comment.replies = replies;
        comment.replyCount = res.data.total || 0;
      } else {
        ElMessage.error(res.msg || '加载回复失败');
      }
    } catch {
      ElMessage.error('加载更多回复失败，请稍后再试');
    }
  };

  const focusComment = async (commentId: number) => {
    highlightedCommentId.value = commentId;
    await nextTick();
    const target = document.querySelector(`[data-comment-id="${commentId}"]`)
      || document.querySelector('.comment-item');
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
    // 排序变更
  const handleSortChange = (sort: any) => {
    currentSort.value = sort;
    currentPage.value = 1; // 重置页码
    getCommentList(false); // 重新加载
  };
  
  // 聚焦评论输入框
  const focusCommentInput = () => {
    nextTick(() => {
      const textarea = document.querySelector('.comment-input-area textarea');
      if (textarea) {
        (textarea as HTMLTextAreaElement).focus();
      }
    });
  };
  
  // 接收实时评论（由父组件调用）
  function receiveComment(comment: CommentDTO) {
    
    if (!comment.rootId) {
      // 顶层评论，添加到列表顶部
      comments.value.unshift(comment);
      totalComments.value++;
    } else {
      // 回复评论，找到对应的根评论
      const rootComment = comments.value.find(c => c.id === comment.rootId);
      if (rootComment) {
        if (!rootComment.replies) {
          rootComment.replies = [];
        }
        rootComment.replies.push(comment);
        rootComment.replyCount = (rootComment.replyCount || 0) + 1;
      }
    }
  }
  
  // 暴露方法给父组件调用
  defineExpose({
    receiveComment,
    refreshComments: () => {
      currentPage.value = 1;
      getCommentList(false);
    },
    focusComment,
  });

  onMounted(async () => {
    await getCommentList();
    if (props.initialCommentId) {
      await focusComment(props.initialCommentId);
    }
  });
  </script>
  
  <style  scoped>
  /* 点赞按钮动画 */
  .like-btn:active i {
    transform: scale(1.2);
  }
  
  /* 用户等级样式 */
  .user-level {
    font-size: 0.65rem;
  }
  
  /* 评论区域过渡效果 */
  .comment-item {
    transition: background-color 0.2s ease;
  }

  .comment-target {
    background-color: rgba(14, 165, 233, 0.1);
    border-radius: 0.25rem;
    transition: background-color 0.3s ease;
  }

  .comment-content,
  .reply-content {
    max-width: 100%;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
/*   
  .comment-item:hover {
    @apply bg-zinc-50 dark:bg-zinc-800;
  } */
  
  /* 表情网格 */
  .emoji-grid {
    max-height: 200px;
    overflow-y: auto;
  }
  
  /* 确保表情在黑暗模式下可见 */
  .emoji-item {
    background-color: rgba(255, 255, 255, 0.05);
  }
  </style>
  
