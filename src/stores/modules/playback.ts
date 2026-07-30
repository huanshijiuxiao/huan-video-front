import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface PlaybackRecord {
  contentId: string | null;          // 视频唯一标识符
  playCount: number;                 // 播放次数
  lastPlayPosition: number;          // 上次播放位置(秒)
  watchTime: number;                 // 上次播放时间戳
  duration: number;                  // 视频总时长(秒)
}

/**
 * 播放历史记录 Store
 */
export const usePlaybackStore = defineStore('playback', () => {
  // 存储所有视频的播放记录 Map<contentId, PlaybackRecord>
  const records = ref<Map<string, PlaybackRecord>>(new Map());

  // 初始化时从 localStorage 加载数据（迁移旧数据）
  const initFromLocalStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('playtime_')) {
          const contentId = key.replace('playtime_', '');
          const data = localStorage.getItem(key);
          if (data) {
            const record = JSON.parse(data) as PlaybackRecord;
            records.value.set(contentId, record);
            // 可选：清除旧的 localStorage 数据
            // localStorage.removeItem(key);
          }
        }
      });
      console.log('从 localStorage 迁移了', records.value.size, '条播放记录');
    } catch (error) {
      console.error('从 localStorage 迁移数据失败:', error);
    }
  };

  /**
   * 获取指定视频的播放记录
   */
  const getRecord = (contentId: string): PlaybackRecord | null => {
    return records.value.get(contentId) || null;
  };

  /**
   * 保存或更新播放记录
   */
  const saveRecord = (contentId: string, record: PlaybackRecord) => {
    records.value.set(contentId, { ...record });
    console.log('保存播放记录:', contentId, record);
  };

  /**
   * 更新播放记录的某些字段
   */
  const updateRecord = (contentId: string, updates: Partial<PlaybackRecord>) => {
    const existing = records.value.get(contentId);
    if (existing) {
      records.value.set(contentId, { ...existing, ...updates });
    } else {
      console.warn('记录不存在，无法更新:', contentId);
    }
  };

  /**
   * 删除指定视频的播放记录
   */
  const deleteRecord = (contentId: string) => {
    records.value.delete(contentId);
    console.log('删除播放记录:', contentId);
  };

  /**
   * 清空所有播放记录
   */
  const clearAllRecords = () => {
    records.value.clear();
    console.log('已清空所有播放记录');
  };

  /**
   * 获取所有播放记录（用于导出或统计）
   */
  const getAllRecords = (): PlaybackRecord[] => {
    return Array.from(records.value.values());
  };

  /**
   * 获取最近观看的视频列表
   */
  const getRecentVideos = (limit: number = 10): PlaybackRecord[] => {
    return Array.from(records.value.values())
      .sort((a, b) => b.watchTime - a.watchTime)
      .slice(0, limit);
  };

  /**
   * 获取观看记录数量
   */
  const getRecordCount = (): number => {
    return records.value.size;
  };
  return {
    records,
    initFromLocalStorage,
    getRecord,
    saveRecord,
    updateRecord,
    deleteRecord,
    clearAllRecords,
    getAllRecords,
    getRecentVideos,
    getRecordCount,
  };
}, {
  // 使用 pinia-plugin-persistedstate 持久化到 localStorage
  persist: {
    key: 'playback-records',
    storage: localStorage,
    serializer: {
      deserialize: (value: string) => {
        const parsed = JSON.parse(value);
        // 将普通对象转换为 Map
        if (parsed.records && typeof parsed.records === 'object') {
          return {
            records: new Map(Object.entries(parsed.records))
          };
        }
        return parsed;
      },
      serialize: (value: any) => {
        // 将 Map 转换为普通对象用于序列化
        const serialized = {
          records: Object.fromEntries(value.records)
        };
        return JSON.stringify(serialized);
      }
    }
  }
});
