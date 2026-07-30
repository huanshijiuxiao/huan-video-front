<template>
  <div class="container mx-auto px-4 py-6">
    <div class="border-b border-zinc-200 mb-4">
      <div class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          :class="[
            'pb-3 text-base font-medium transition-colors duration-200 relative',
            activeTab === tab.key ? 'text-sky-500' : 'text-zinc-500 hover:text-zinc-700'
          ]"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <div
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
          />
        </button>
      </div>
    </div>

    <VideoSearchResult v-if="activeTab === 'video'" :keyword="keyword" />
    <UserSearchResult v-else :keyword="keyword" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import VideoSearchResult from "./components/VideoSearchResult.vue";
import UserSearchResult from "./components/UserSearchResult.vue";

type SearchTab = "video" | "user";

const route = useRoute();
const keyword = ref("");
const activeTab = ref<SearchTab>("video");

const tabs: Array<{ key: SearchTab; label: string }> = [
  { key: "video", label: "视频" },
  { key: "user", label: "用户" },
];

watch(
  () => route.query.keyword,
  (newKeyword) => {
    keyword.value = typeof newKeyword === "string" ? newKeyword : "";
    activeTab.value = "video";
  },
  { immediate: true }
);
</script>
