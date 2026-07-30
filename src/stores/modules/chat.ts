import { defineStore } from 'pinia';
import { ref, computed, shallowRef } from 'vue';
import { getRecentChatList } from '@/api/message';

// 类型定义
interface ChatMessage {
  id: number;
  content: string;
  userId: number;
  timestamp: number;
  withdraw: number;
  type?: string;
  file?: {
    name: string;
    url: string;
    size: number;
    type: string;
  };
}

interface ChatDetail {
  list: ChatMessage[];
  hasMore: boolean;
}

interface ChatUser {
  uid: number;
  nickname: string;
  avatarUrl: string;
  auth: number;
}

interface ChatInfo {
  id: number;
  userId: number;
  unread: number;
  lastMessageTime: number;
}

interface ChatItem {
  user: ChatUser;
  chat: ChatInfo;
  detail: ChatDetail;
}

export const useChatStore = defineStore('chat', () => {
  // 状态
  const chatList = ref<ChatItem[]>([]);
  const chatId = ref<number>(-1);
  const isChatPage = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const chatError = ref<string | null>(null);
  const latestPrivateMessage = shallowRef<any | null>(null);

  // Getter
  const currentChat = computed(() => {
    return chatList.value.find(chat => chat.user.uid === chatId.value) || null;
  });

  const totalUnreadCount = computed(() => {
    return chatList.value.reduce((total, chat) => total + chat.chat.unread, 0);
  });
  
  const sortedChatList = computed(() => {
    // 按最后一条消息时间排序
    return [...chatList.value].sort((a, b) => 
      b.chat.lastMessageTime - a.chat.lastMessageTime
    );
  });

  async function refreshChatList() {
    try {
      const response: any = await getRecentChatList();
      if (response.code === 200) {
        chatList.value = response.data?.list || [];
      }
    } catch (error: any) {
      chatError.value = error.message;
    }
  }

  function receivePrivateMessage(message: any) {
    latestPrivateMessage.value = message;

    const senderId = Number(message.senderId);
    const chatIndex = chatList.value.findIndex(chat => chat.user.uid === senderId);
    if (chatIndex === -1) {
      void refreshChatList();
      return;
    }

    const chat = chatList.value[chatIndex];
    const messages = chat.detail.list as any[];
    if (!messages.some(item => item.id === message.id)) {
      messages.push(message);
    }

    const sentAt = new Date(message.sendTime).getTime();
    chat.chat.lastMessageTime = Number.isNaN(sentAt) ? Date.now() : sentAt;
    if (!isChatPage.value || chatId.value !== senderId) {
      chat.chat.unread++;
    }

    if (chatIndex !== 0) {
      chatList.value.splice(chatIndex, 1);
      chatList.value.unshift(chat);
    }
  }

  // Actions
  async function fetchChatList(offset = 0) {
    if (loading.value) return;
    
    loading.value = true;
    chatError.value = null;
    
    try {
      const token = localStorage.getItem("teri_token");
      const response = await fetch(`/msg/chat/recent-list?offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch chat list');
      }
      
      const data = await response.json();
      
      if (data.code === 200) {
        if (offset === 0) {
          // 重置列表
          chatList.value = data.data.list;
        } else {
          // 追加列表
          chatList.value = [...chatList.value, ...data.data.list];
        }
        return {
          more: data.data.more,
          list: data.data.list
        };
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error: any) {
      chatError.value = error.message;
      return {
        more: false,
        list: []
      };
    } finally {
      loading.value = false;
    }
  }
  
  async function createChat(userId: number) {
    loading.value = true;
    chatError.value = null;
    
    try {
      const token = localStorage.getItem("teri_token");
      const response = await fetch(`/msg/chat/create/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      
      const data = await response.json();
      
      if (data.code === 200) {
        if (data.data) {
          // 避免重复添加
          const exists = chatList.value.some(chat => chat.user.uid === data.data.user.uid);
          if (!exists) {
            chatList.value.unshift(data.data);
          }
        }
        chatId.value = userId;
        return true;
      } else {
        throw new Error(data.message || 'Failed to create chat');
      }
    } catch (error: any) {
      chatError.value = error.message;
      chatId.value = -1;
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  async function deleteChat(userId: number) {
    loading.value = true;
    chatError.value = null;
    
    try {
      const token = localStorage.getItem("teri_token");
      const response = await fetch(`/msg/chat/delete/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }
      
      const data = await response.json();
      
      if (data.code === 200) {
        const index = chatList.value.findIndex(chat => chat.user.uid === userId);
        if (index !== -1) {
          chatList.value.splice(index, 1);
        }
        
        // 如果删除的是当前聊天，则切换到其他聊天或清除当前聊天
        if (chatId.value === userId) {
          chatId.value = chatList.value.length > 0 ? chatList.value[0].user.uid : -1;
        }
        return true;
      } else {
        throw new Error(data.message || 'Failed to delete chat');
      }
    } catch (error: any) {
      chatError.value = error.message;
      return false;
    } finally {
      loading.value = false;
    }
  }
  
  async function fetchChatMessages(userId: number, offset = 0) {
    loading.value = true;
    chatError.value = null;
    
    try {
      const token = localStorage.getItem("teri_token");
      const response = await fetch(`/msg/chat/detail/${userId}?offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      const data = await response.json();
      
      if (data.code === 200) {
        const chatIndex = chatList.value.findIndex(chat => chat.user.uid === userId);
        
        if (chatIndex !== -1) {
          if (offset === 0) {
            // 重置消息列表
            chatList.value[chatIndex].detail.list = data.data.list;
          } else {
            // 添加更多历史消息（前置）
            chatList.value[chatIndex].detail.list = [
              ...data.data.list,
              ...chatList.value[chatIndex].detail.list
            ];
          }
          chatList.value[chatIndex].detail.hasMore = data.data.more;
          
          // 已读此聊天
          if (chatList.value[chatIndex].chat.unread > 0) {
            chatList.value[chatIndex].chat.unread = 0;
          }
        }
        
        return {
          more: data.data.more,
          list: data.data.list
        };
      } else {
        throw new Error(data.message || 'Unknown error');
      }
    } catch (error: any) {
      chatError.value = error.message;
      return {
        more: false,
        list: []
      };
    } finally {
      loading.value = false;
    }
  }
  
  function addMessage(userId: number, message: ChatMessage) {
    const chatIndex = chatList.value.findIndex(chat => chat.user.uid === userId);
    
    if (chatIndex !== -1) {
      // 添加新消息
      chatList.value[chatIndex].detail.list.push(message);
      
      // 更新最后消息时间
      chatList.value[chatIndex].chat.lastMessageTime = message.timestamp;
      
      // 如果是接收到的消息且当前不是这个聊天，增加未读计数
      if (message.userId !== userId && chatId.value !== userId) {
        chatList.value[chatIndex].chat.unread++;
      }
      
      // 将这个聊天移到列表最前面
      if (chatIndex !== 0) {
        const chat = chatList.value.splice(chatIndex, 1)[0];
        chatList.value.unshift(chat);
      }
    }
  }
  
  function withdrawMessage(messageId: number, userId: number) {
    const chatIndex = chatList.value.findIndex(chat => chat.user.uid === userId);
    
    if (chatIndex !== -1) {
      const messageIndex = chatList.value[chatIndex].detail.list.findIndex(
        msg => msg.id === messageId
      );
      
      if (messageIndex !== -1) {
        chatList.value[chatIndex].detail.list[messageIndex].withdraw = 1;
      }
    }
  }
  
  // 处理收到的实时消息（例如通过WebSocket接收）
  function handleRealtimeMessage(message: any) {
    if (message.type === 'chat_message') {
      addMessage(message.fromUserId, {
        id: message.id,
        content: message.content,
        userId: message.fromUserId,
        timestamp: message.timestamp,
        withdraw: 0,
        type: message.messageType || 'text'
      });
    } else if (message.type === 'withdraw_message') {
      withdrawMessage(message.messageId, message.userId);
    }
  }
  
  // 重置所有状态
  function resetState() {
    chatList.value = [];
    chatId.value = -1;
    isChatPage.value = false;
    loading.value = false;
    chatError.value = null;
    latestPrivateMessage.value = null;
  }
  
  return {
    // 状态
    chatList,
    chatId,
    isChatPage,
    loading,
    chatError,
    latestPrivateMessage,
    
    // Getter
    currentChat,
    totalUnreadCount,
    sortedChatList,
    
    // Actions
    fetchChatList,
    refreshChatList,
    createChat,
    deleteChat,
    fetchChatMessages,
    addMessage,
    withdrawMessage,
    handleRealtimeMessage,
    receivePrivateMessage,
    resetState
  };
});
