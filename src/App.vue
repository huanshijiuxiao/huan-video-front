<script setup lang="ts">
import BackTop from "@/components/BackTop.vue";
import { useAuthStore } from "@/stores/modules/auth";
import { useChatStore } from "@/stores/modules/chat";
import { useTheme } from "@/stores/modules/useTheme";
import websocketService from "@/utils/websocket";
import { storeToRefs } from "pinia";
import { watch } from "vue";

const { initTheme } = useTheme();
initTheme();

const authStore = useAuthStore();
const chatStore = useChatStore();
const { token } = storeToRefs(authStore);

function handlePrivateMessage(message: any) {
  chatStore.receivePrivateMessage(message);
}

watch(
  token,
  (currentToken) => {
    if (!currentToken) {
      websocketService.offNewMessage(handlePrivateMessage);
      websocketService.disconnect();
      chatStore.resetState();
      return;
    }

    void websocketService.connect(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:7000",
      currentToken,
    );
    websocketService.offNewMessage(handlePrivateMessage);
    websocketService.onNewMessage(handlePrivateMessage);
    void chatStore.refreshChatList();
  },
  { immediate: true },
);
</script>
<template>
  <router-view></router-view>
  <BackTop />
</template>

<style lang="scss" scoped>
</style>
