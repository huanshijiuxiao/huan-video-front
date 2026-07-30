import { io, Socket } from 'socket.io-client';
import type { Barrage } from '@/types/barrage';
import { getToken } from '@/utils/auth';
import type { NotificationPush } from '@/types/notification';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connectPromise: Promise<void> | null = null;
  private connectResolve: (() => void) | null = null;
  private videoRooms = new Set<number>();

  /**
   * 连接WebSocket 服务
   */
  connect(url: string, token?: string): Promise<void> {
    // 如果已经有连接或正在连接，返回现有的 Promise
    if (this.socket?.connected) {
      return Promise.resolve();
    }
    
    if (this.connectPromise) {
      return this.connectPromise;
    }
    
    // 创建连接 Promise
    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.connectResolve = resolve;

      const authToken = token || getToken() || '';

      const options: any = {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        query: {
          token: authToken,
        }
      };

      this.socket = io(url, options);

      // 连接成功
      this.socket.on('connect', () => {
        console.log('WebSocket 连接成功', this.socket?.id);
        this.reconnectAttempts = 0;
        this.videoRooms.forEach((aid) => {
          this.socket?.emit('join_video', { aid });
        });
        if (this.connectResolve) {
          this.connectResolve();
          this.connectResolve = null;
        }
      });      // 连接错误
      this.socket.on('connect_error', (error) => {
        console.error('WebSocket 连接错误:', error);
        this.reconnectAttempts++;

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('WebSocket 重连次数超过限制');
          if (this.connectResolve) {
            this.connectResolve(); // 即使失败，也要 resolve Promise，以便调用者知道连接尝试已完成
            this.connectResolve = null;
          }
        }
      });

      // 断开连接
      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket 断开连接:', reason);
        this.connectPromise = null; // 重置 Promise，允许重新连接
      });

      // 重连
      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`WebSocket 重连尝试 ${attemptNumber}...`);
      });

      // 重连失败
      this.socket.on('reconnect_failed', () => {
        console.error('WebSocket 重连失败');
        this.connectPromise = null;
      });
    });

    return this.connectPromise;
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectPromise = null;
    this.connectResolve = null;
    this.reconnectAttempts = 0;
  }

  /**
   * 加入视频房间（用于接收该视频的弹幕）
   */
  joinVideoRoom(aid: number): void {
    this.videoRooms.add(aid);

    if (this.socket?.connected) {
      this.socket.emit('join_video', { aid });
      console.log(`加入视频房间: ${aid}`);
    } else {
      console.log(`WebSocket 连接后将自动加入视频房间: ${aid}`);
    }
  }

  /**
   * 离开视频房间
   */
  leaveVideoRoom(aid: number): void {
    this.videoRooms.delete(aid);

    if (this.socket?.connected) {
      this.socket.emit('leave_video', { aid });
      console.log(`离开视频房间: ${aid}`);
    }
  }

  onNewNotification(callback: (data: NotificationPush) => void): void {
    this.socket?.on('new_notification', callback);
  }

  offNewNotification(callback?: (data: NotificationPush) => void): void {
    if (callback) {
      this.socket?.off('new_notification', callback);
    } else {
      this.socket?.off('new_notification');
    }
  }

  /**
   * 监听接收弹幕
   */
  onReceiveBarrage(callback: (barrage: Barrage) => void): void {
    if (this.socket) {
      this.socket.on('receive_barrage', callback);
    }
  }

  /**
   * 取消监听接收弹幕
   */
  offReceiveBarrage(callback?: (barrage: Barrage) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off('receive_barrage', callback);
      } else {
        this.socket.off('receive_barrage');
      }
    }
  }
  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * 监听接收新评论（需要登录）
   */
  onReceiveComment(callback: (comment: any) => void): void {
    if (this.socket) {
      
      this.socket.on('receive_comment', callback);
    }
  }

  /**
   * 取消监听接收新评论
   */
  offReceiveComment(callback?: (comment: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off('receive_comment', callback);
      } else {
        this.socket.off('receive_comment');
      }
    }
  }

  /**
   * 获取 Socket 实例（用于自定义事件监听）
   */

  /**
   * 监听新私信消息
   */
  onNewMessage(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  /**
   * 取消监听新私信消息
   */
  offNewMessage(callback?: (message: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off('new_message', callback);
      } else {
        this.socket.off('new_message');
      }
    }
  }

  /**
   * 获取 Socket 实例
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// 导出单例
export const websocketService = new WebSocketService();
export default websocketService;
