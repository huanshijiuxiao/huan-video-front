import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { loadEnv } from 'vite'
import path from "path";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseApi = env.VITE_BASE_API || '/api/v1'
  const apiUrl = new URL(env.VITE_BASE_API_URL || 'http://localhost:8091')
  const apiTarget = `${apiUrl.protocol}//${apiUrl.host}`

  return {
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/svgs")],
      // 指定symbolId格式
      symbolId: "[name]",
      customDomId: "turing-planet-svgs", // 避免多项目互相影响
    }),
    Components({
      resolvers: [
          // 自动注册图标
          IconsResolver({
          // icon的前缀 组件使用{prefix}-{collection}-{icon} eg:i-ep-search
              prefix: 'i' 
          // enabledCollections:['ep'] 这是可选的，默认启用Iconify支持的所有集合，ep指的是element_ui的图标库
          // alias: { park: 'icon-park' } 集合的别名
          })
      ]
  }),
    Icons({
        scale: 1, // 缩放比 相对1em
        autoInstall: true, // 自动安装
        compiler: 'vue3' // 编译方式
    }),

    vue()
  ],
  server: {
    host: '0.0.0.0',
    cors: true,
    open:true,
    // 跨域配置
    proxy: {
      [baseApi]: {
        target: apiTarget,  // 后台接口地址
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000,
      },
    }
  },
  resolve: {
    alias: {
        '@': path.join(__dirname, 'src'),
    }
  }
  }
})
