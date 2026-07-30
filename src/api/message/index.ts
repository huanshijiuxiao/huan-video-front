 import request from '@/utils/http';

 // 获取最近聊天列表
 export function getRecentChatList(offset = 0) {
   return request.get('/msg/chat/recent-list', { params: { offset } });
 }

 // 创建/获取会话
 export function createChat(userId: number) {
   return request.get(`/msg/chat/create/${userId}`);
 }

 // 删除会话
 export function deleteChat(userId: number) {
   return request.get(`/msg/chat/delete/${userId}`);
 }

 // 获取聊天消息历史
 export function getChatMessages(userId: number, offset = 0) {
   return request.get(`/msg/chat/detail/${userId}`, { params: { offset } });
 }

 // 发送消息
 export function sendMessage(data: { receiverId: number; content: string; contentType?: number }) {
   return request.post('/msg/chat/send', data);
 }

 // 撤回消息
 export function recallMessage(messageId: number) {
   return request.post('/msg/chat/recall', null, { params: { messageId } });
 }

 // 标记会话已读
 export function markChatRead(userId: number) {
   return request.post(`/msg/chat/read/${userId}`);
 }
