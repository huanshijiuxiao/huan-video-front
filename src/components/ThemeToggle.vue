<template>
  <el-tooltip :content="tooltipText" placement="bottom">
    <button
      type="button"
      class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-sky-800 dark:hover:bg-sky-950/40 dark:hover:text-sky-300"
      :aria-label="tooltipText"
      @click="toggleTheme"
    >
      <el-icon :size="18">
        <Sunny v-if="isDark" />
        <Moon v-else />
      </el-icon>
    </button>
  </el-tooltip>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Moon, Sunny } from "@element-plus/icons-vue";
import { useTheme } from "@/stores/modules/useTheme";

const { isDark, toggleTheme } = useTheme();
const tooltipText = computed(() => (isDark.value ? "切换到日间模式" : "切换到夜间模式"));
</script>
