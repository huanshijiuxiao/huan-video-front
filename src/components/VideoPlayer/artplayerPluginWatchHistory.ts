import { getHistory, reportPlaybackHistory } from '@/api/history';
import { useAuthStore } from '../../stores/modules/auth';
import { usePlaybackStore, type PlaybackRecord } from '../../stores/modules/playback';

interface WatchHistoryOptions {
  contentId?: number | null;                    // 视频ID
  saveInterval?: number;                        // 定时保存间隔(毫秒)，默认 5000ms (5秒)
  continuePlayback?: boolean;                   // 是否自动从上一次位置继续播放
  minPlayTimeToSave?: number;                   // 最小实际播放时间才记录(秒)
  onRecord?: (record: PlaybackRecord) => void;  // 记录更新时的回调
}

class ArtplayerWatchHistory {
  private art: any;
  private options: WatchHistoryOptions;
  private currentRecord: PlaybackRecord | null = null;
  private saveTimer: number | null = null;       // 轮询定时器
  private playStartTime: number = 0;
  private actualPlayTime: number = 0;           // 实际观看时长（秒）
  private isPlaying: boolean = false;
  private playbackStore: ReturnType<typeof usePlaybackStore>;

  constructor(art: any, options: WatchHistoryOptions = {}) {
    this.art = art;
    this.options = { 
      saveInterval: 5000,                       // 默认 5 秒轮询一次，兼顾性能与数据安全
      continuePlayback: true, 
      minPlayTimeToSave: 5, 
      ...options 
    };
    this.playbackStore = usePlaybackStore();
    this.init();
  }

  private init(): void {
    // 事件监听
    this.art.on('play', () => this.onPlay());
    this.art.on('pause', () => this.onPause());
    this.art.on('video:seeked', () => this.onSeeked());
    this.art.on('video:ended', () => this.onEnded());
    this.art.on('destroy', () => this.onDestroy());
    // 初始化记录
    this.art.on('ready', () => {
      void this.initializeRecord().then(() => {
        if (this.options.continuePlayback && this.currentRecord && this.currentRecord.lastPlayPosition > 0) {
          console.log(`继续播放上次位置: ${this.currentRecord.lastPlayPosition}s`);
          this.art.seek = this.currentRecord.lastPlayPosition;
        }
      });
    });
  }


  // 初始化播放记录
  private async initializeRecord(): Promise<void> {
    const contentId = String(this.options.contentId);
    if (!contentId) return;

    const duration = this.art.duration;
    const authStore = useAuthStore();

    let record = authStore.isAuthenticated ? await this.loadRemoteRecord(contentId, duration) : null;
    if (!record) record = this.playbackStore.getRecord(contentId);
    

    if (!record) {
      record = { contentId, lastPlayPosition: 0, watchTime: Date.now(), duration } as PlaybackRecord;
    } else {
      record.duration = duration;
    }
    
    this.currentRecord = record;
    // this.playbackStore.saveRecord(contentId, record);
  }

  private async loadRemoteRecord(contentId: string, duration: number): Promise<PlaybackRecord | null> {
    try {
      const res: any = await getHistory({ contentId });
      console.log('获取同步记录:', res);
      if (res?.code !== 200) return null;
      
      const remoteRecord = this.normalizeRemoteRecord(res?.data, contentId, duration);
      if (remoteRecord) this.playbackStore.saveRecord(contentId, remoteRecord);
      return remoteRecord;
    } catch (e) {
      console.error('获取同步记录失败:', e);
      return null;
    }
  }

  private normalizeRemoteRecord(data: any, contentId: string, duration: number): PlaybackRecord | null {
    const matched = data?.record ?? data?.data ?? data;
    if (!matched) return null;
    return {
      contentId,
      lastPlayPosition: Number(matched.progress ?? matched.lastPlayPosition ?? 0) || 0,
      watchTime: matched.watchTime ? new Date(matched.watchTime).getTime() : Date.now(),
      duration: Number(matched.duration ?? duration) || duration,
    } as PlaybackRecord;
  }

  private onPlay(): void {
    this.isPlaying = true;
    this.playStartTime = Date.now();
    this.startSaveTimer(); // 播放时启动轮询
  }

  private onPause(): void {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    this.stopSaveTimer();  // 暂停时立刻停止轮询
    this.updatePositionAndSync();
  }

  private onSeeked(): void {
    // 拖动进度条释放后，立刻同步一次最新位置
    this.updatePositionAndSync();
  }

  private onEnded(): void {
    if (!this.currentRecord) return;
    this.isPlaying = false;
    this.stopSaveTimer();
    this.updateActualPlayTime();
    
    this.currentRecord.lastPlayPosition = 0; // 播放结束，进度归零
    this.currentRecord.watchTime = Date.now();
    this.saveAndUpload();
  }

  private onDestroy(): void {
    this.stopSaveTimer();
    this.updatePositionAndSync();
  }

  // --- 轮询定时器控制 ---
  private startSaveTimer(): void {
    this.stopSaveTimer();
    this.saveTimer = window.setInterval(() => {
      this.updatePositionAndSync();
    }, this.options.saveInterval);
  }

  private stopSaveTimer(): void {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }

  // --- 核心更新与同步逻辑 ---
  private updatePositionAndSync(): void {
    if (!this.currentRecord) return;
    this.updateActualPlayTime();
    this.currentRecord.lastPlayPosition = this.art.currentTime;
    this.currentRecord.watchTime = Date.now();
    this.saveAndUpload();
    this.options.onRecord?.(this.currentRecord);
  }

  private updateActualPlayTime(): void {
    if (!this.isPlaying) return;
    const now = Date.now();
    // 累加实际观看时长并重置起点，防止重复计算
    this.actualPlayTime += (now - this.playStartTime) / 1000;
    this.playStartTime = now;
  }

  private saveAndUpload(): void {
    if (!this.currentRecord?.contentId) return;
    try {
      this.playbackStore.saveRecord(this.currentRecord.contentId, this.currentRecord);
      if (useAuthStore().isAuthenticated) {
        void reportPlaybackHistory({
          contentId: this.currentRecord.contentId,
          contentType: 1,
          progress: this.currentRecord.lastPlayPosition,
          duration: this.currentRecord.duration,
        });
      }
    } catch (e) {
      console.error('保存/上报播放记录失败:', e);
    }
  }
}

export default function artplayerPluginWatchHistory(options: WatchHistoryOptions = {}) {
  return (art: any) => new ArtplayerWatchHistory(art, options);
}