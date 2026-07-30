<template>
  <div class="bg-white dark:bg-zinc-800 rounded-xl p-5 shadow-sm">
    <!-- 作者信息 -->
    <div class="flex items-center gap-4 mb-4">
        <el-avatar 
            :src="owner?.avatar" 
            :size="60" 
            class="flex-shrink-0 cursor-pointer"
        />
        <div class="flex-1 min-w-0">
            <h3 class="text-lg font-bold text-zinc-900 dark:text-white truncate cursor-pointer hover:text-sky-500 transition-colors mb-1">
                {{ owner?.nickname }}
            </h3>
            <div class="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                <span>{{ NumberUtil.formatCount(owner?.follower || 0) }} 粉丝</span>
                <span>{{ NumberUtil.formatCount(owner?.following || 0) }} 关注</span>
            </div>
        </div>
    </div>
    
    <!-- 简介 -->
    <p v-if="owner?.introduction" class="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
        {{ owner.introduction }}
    </p>
    
    <!-- 操作按钮 -->
    <div class="flex gap-3 text-sm">
      <div v-if="relation?.attribute === 1" class="relative group flex-1">
        <button 
            class="w-full px-4 py-2.5  bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors flex items-center justify-center gap-1"
        >
            <span>已关注</span>
        </button>
        
        <div class="absolute top-full left-0 w-full z-10 pt-1 hidden group-hover:block">
            <div class="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg shadow-lg py-1 overflow-hidden">
                <button 
                    @click="handleModifyRelation(2)"
                    class="w-full px-4 py-2 text-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-medium"
                >
                    取消关注
                </button>
            </div>
        </div>
      </div>
      <button 
          v-else 
          @click="handleModifyRelation(1)"
          class="flex-1 px-4 py-2.5 bg-sky-500 text-white rounded-lg font-medium hover:bg-sky-600 transition-colors"
      >
          关注
      </button>                        
      <button 
          @click="handleWhisper"
          class="px-4 py-2.5 bg-sky-500 dark:text-zinc-300 rounded-lg hover:bg-sky-600 text-white dark:hover:bg-sky-500 transition-colors flex items-center gap-1"
          title="发送消息"
      >
          <svg-icon name="mail" class="w-4 h-4"></svg-icon>
          <span>发消息</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/modules/auth"
import { getRelation, modifyRelation } from "@/api/relation"
import NumberUtil from "@/utils/NumberUtil"
import SvgIcon from "@/components/SvgIcon.vue"
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Relation } from "@/types/relation";
import { UserInfo } from "@/types/user";
import { ElMessage } from "element-plus";
import { useLoginDialog } from "@/components/LoginRegisterDialog/useLoginDialog";

const authStore = useAuthStore();
const { showLoginDialog } = useLoginDialog();

const relation = ref<Relation | null>(null);

const router = useRouter();

const props = defineProps<{
    owner: UserInfo | undefined;
}>()

async function isFollow() {
    if (authStore.isAuthenticated && props.owner?.uid) {
        const res = await getRelation(props.owner.uid);
        if (res.code === 200) {
            relation.value = res.data;
        }
    }
}

const requestLoginThen = (action: () => void | Promise<void>) => {
    showLoginDialog({
        initialTab: "login",
        onLogin: async () => {
            await action();
        },
    });
};

async function handleModifyRelation(act: number) {
    if (!authStore.isAuthenticated) {
        requestLoginThen(() => handleModifyRelation(act));
        return;
    }

    try {
        const res = await modifyRelation({fid: props.owner?.uid, act: act});
        if (res.code === 200) {
            relation.value = res.data;
        } else {
            ElMessage.error(res.msg);
        }
    } catch (error) {
        console.error("关注操作失败:", error);
        ElMessage.error("操作失败");
    }
}

function handleWhisper() {
    if (authStore.isAuthenticated) {
        router.push({ path: '/message/whisper/' + props.owner?.uid })
    } else {
        requestLoginThen(handleWhisper);
    }
}

// onMounted(() => {
//     isFollow();
// })

watch(() => props.owner, () => {
    isFollow();
})
</script>

<style scoped>

</style>
