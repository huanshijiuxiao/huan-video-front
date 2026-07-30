<template>
    <div ref="playerContainer" class="artplayer-app aspect-video rounded-xl overflow-hidden relative">
      <!-- 加载中占位 -->
      <div v-show="!isPlayerReady" class="absolute inset-0 flex flex-col items-center justify-center bg-black text-white">
        <Loading color="#409eff" scale="1.1" />
      </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, ref, watch, computed, nextTick, toRaw } from 'vue';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import artplayerPluginHlsControl from 'artplayer-plugin-hls-control';
import artplayerPluginDanmuku from 'artplayer-plugin-danmuku';
import { useAuthStore } from '@/stores/modules/auth';
import artplayerPluginWatchHistory from './artplayerPluginWatchHistory';
import type { Barrage, BarrageDTO } from '@/types/barrage';
import { useLoginDialog } from '@/components/LoginRegisterDialog/useLoginDialog';
import Loading from '@/components/Loading/index.vue';
// HLS 质量级别类型
interface HlsLevel {
  height: number;
  width?: number;
  bitrate?: number;
  name?: string;
  [key: string]: any;
}
// HLS 音轨类型
interface HlsAudioTrack {
  name: string;
  lang?: string;
  [key: string]: any;
}
// 插件配置接口
interface HlsControlOptions {
  quality?: {
    control: boolean;
    setting: boolean;
    getName: (level: HlsLevel) => string;
    title: string;
    auto: string;
  };
  audio?: {
    control: boolean;
    setting: boolean;
    getName: (track: HlsAudioTrack) => string;
    title: string;
    auto: string;
  };
}

const props = defineProps({
    playUrl: {
        type: String,
        default: '',
    },
    contentId: {
        type: Number,
        default: null,
    },
    barrageList: {
        type: Array as () => BarrageDTO[],
        default: () => [],
    },
    // 是否启用弹幕功能，默认开启
    enableBarrage: {
        type: Boolean,
        default: true
    },
    // 是否启用历史记录上报功能，默认开启
    enableHistory: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits<{
  (e: 'send-barrage', barrage: Barrage): void
}>();

const authStore = useAuthStore();
const { showLoginDialog } = useLoginDialog();

const art = ref<Artplayer | null>(null);
const playerContainer = ref<HTMLDivElement | null>(null);
const isPlayerReady = ref(false);
const isPlayerInitialized = ref(false);

const barragePlugin = ref<any>(null);

const requestLoginThen = (action: () => void | Promise<void>) => {
  showLoginDialog({
    initialTab: 'login',
    onLogin: async () => {
      await action();
    },
  });
};

function convertToBarrage(dto: BarrageDTO): Barrage {
  const currentUid = authStore.getUserId;
  return {
    text: dto.text || '',
    time: dto.time,
    color: dto.color,
    mode: dto.mode || 0,
    border: dto.uid && currentUid ? dto.uid === currentUid : false,
  };
}

// 计算属性，判断是否有足够信息初始化播放器
const canInitPlayer = computed(() => {
  return props.playUrl && props.playUrl.trim() !== '';
});

// 初始化播放器函数
function initPlayer() {
  if (!canInitPlayer.value || !playerContainer.value) {
    return;
  }
  
  // 如果已经初始化，先销毁旧实例
  destroyPlayer(); 
  
  // 标记初始化中
  isPlayerInitialized.value = true;

  // 1. 组装基础插件
  const activePlugins: any[] = [
    artplayerPluginHlsControl({
      quality: {
        control: true,
        setting: true,
        getName: (level: HlsLevel) => `${level.height}P`,
        title: '画质',
        auto: '自动',
      },
      audio: {
        control: true,
        setting: true,
        getName: (track: HlsAudioTrack) => track.name || track.lang || '音轨',
        title: '音轨',
        auto: '自动',
      },
    } as HlsControlOptions)
  ];

  // 2. 根据 props 条件动态注入弹幕插件
  if (props.enableBarrage) {
    activePlugins.push(
      artplayerPluginDanmuku({
        danmuku: function () {
          return new Promise((resolve) => {
            if (props.barrageList && props.barrageList.length > 0) {
              return resolve(props.barrageList.map(convertToBarrage));
            }
            const unwatch = watch(
              () => props.barrageList,
              (newList) => {
                if (newList && newList.length > 0) {
                  resolve(newList.map(convertToBarrage));
                  unwatch();
                }
              },
              { deep: true, immediate: true }
            );
          });
        },
        speed: 5,
        opacity: 0.9,
        fontSize: 25,
        maxLength: 200,
        color: '#FFFFFF',
        margin: [10, '25%'],
        antiOverlap: true,
        synchronousPlayback: true,
        async beforeEmit(barrage: Barrage): Promise<boolean>{
            return await saveBarrage(barrage);
        },
      })
    );
  }

  // 3. 根据 props 条件动态注入历史记录插件
  if (props.enableHistory) {
    activePlugins.push(
      artplayerPluginWatchHistory({
        contentId: props.contentId,
        saveInterval: 2000,
        continuePlayback: true,
      })
    );
  }
  
  art.value = new Artplayer({
    container: playerContainer.value,
    url: props.playUrl,
    volume: 0.8,
    theme: '#409eff',
    fastForward: true,
    lock: true,
    autoplay: false,
    loop: false,
    setting: true,
    pip: true, 
    fullscreen: true,
    fullscreenWeb: true,
    autoSize: false,
    playbackRate: true,
    aspectRatio: true,
    mutex: true,   
    plugins: activePlugins, 
    // 自定义播放类型处理
    customType: {
      m3u8: function playM3u8(video: HTMLVideoElement, url: string, art: Artplayer): void {
        if (Hls.isSupported()) {
          if (art.hls) art.hls.destroy();          
          const hls = new Hls({
          enableWorker: true,
            maxBufferLength: 60,
            maxMaxBufferLength: 120,
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          art.hls = hls;
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
          isPlayerReady.value = true;
            console.log('HLS manifest parsed, available quality levels:', hls.levels);
            // 默认切换到最高画质
            if (hls.levels && hls.levels.length > 0) {
              hls.currentLevel = hls.levels.length - 1;
            }
        });
        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              switch(data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  destroyPlayer();
                  break;
              }
            }
          });
          art.on('destroy', () => hls.destroy());
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
          video.onloadedmetadata = () => {
            isPlayerReady.value = true;
          };
        } else {
          art.notice.show = '不支持的播放格式: m3u8';
        }
      }
    },
  });

  // 添加事件监听
  addPlayerEventListeners();

  // 只有在启用了弹幕的情况下，才去提取弹幕插件实例
  if (props.enableBarrage) {
    let plugins = toRaw(art.value.plugins);
    barragePlugin.value = plugins.artplayerPluginDanmuku;
  } else {
    barragePlugin.value = null;
  }
}

// 销毁播放器函数
function destroyPlayer() {
  if (art.value) {
    art.value.destroy();
    art.value = null;
  }
  isPlayerReady.value = false;
}

// 保存弹幕（通过父组件发送）
async function saveBarrage(barrage: Barrage): Promise<boolean> {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated) {
    requestLoginThen(async () => {
      try {
        emit('send-barrage', barrage);
        lastBarrageLength+= 1; // 增加长度计数，避免重复发送
      } catch (error) {
        console.error('保存弹幕失败:', error);
      }
    });
    return false;
  }
  
  try {
    emit('send-barrage', barrage);
    return true;
  } catch (error) {
    console.error('保存弹幕失败:', error);
    return false;
  }
}

// 添加播放器事件监听
function addPlayerEventListeners() {
  if (!art.value) return;
  
  art.value.on('ready', () => {
    isPlayerReady.value = true;
    console.log('播放器就绪');
  });
  
  art.value.on('error', (e) => {
    console.error('播放器加载失败', e);
  });
}

// 上一次的弹幕列表长度
let lastBarrageLength = 0;

// // 监听 barrageList 变化，更新弹幕
// watch(
//   () => props.barrageList.length, 
//   (newLength) => {
//     if (!props.enableBarrage || !barragePlugin.value || newLength === 0) {
//       lastBarrageLength = newLength;
//       return;
//     }
    
//     if (lastBarrageLength === 0 && newLength > 0) {
//       const barrages = props.barrageList.map(convertToBarrage);

//       barragePlugin.value.load(barrages);
//       lastBarrageLength = newLength;
//       return;
//     }
//     console.log(`Barrage list changed. Previous length: ${lastBarrageLength}, New length: ${newLength}`);
//     if (newLength > lastBarrageLength) {
//       const newBarrageDTOs = props.barrageList.slice(lastBarrageLength);
//       newBarrageDTOs.forEach(dto => {
//         const barrage = convertToBarrage(dto);
//         if (barragePlugin.value && barragePlugin.value.emit) {
//           barragePlugin.value.emit(barrage);
//         }
//       });
//       lastBarrageLength = newLength;
//     }
//   },
//   { immediate: true }
// );

// 处理接收到的弹幕
function receiveBarrage(barrage: BarrageDTO) {
  convertToBarrage(barrage);
  barragePlugin.value.emit(barrage);
}


// 监听playUrl变化
watch(
  () => props.playUrl,
  (newVal: string) => {
    if (newVal) {
      if (art.value) {
        art.value.switchUrl(newVal);
      } else {
        nextTick(() => {
          initPlayer();
        });
      }
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => props.contentId,
  (newContentId) => {
    if (art.value && props.enableHistory) {
      const historyPlugin = art.value.plugins.artplayerPluginWatchHistory;
      if (historyPlugin) {
        historyPlugin.setContentId(newContentId);
      }
    }
  },
  { immediate: true }
);

watch(
  () => [props.enableBarrage, props.enableHistory],
  () => {
    if (art.value) {
      nextTick(() => {
        initPlayer();
      });
    }
  }
);

onMounted(async () => {
  if (canInitPlayer.value) {
    initPlayer();
  }
});

onBeforeUnmount(() => {
  destroyPlayer();
});


defineExpose({
  art,
  playerContainer,
  isPlayerReady,
  initPlayer,
  destroyPlayer,
  receiveBarrage
});

</script>

<style lang="scss" scoped>
.artplayer-app {
  min-height: 200px;
  
  :deep(.art-video) {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
