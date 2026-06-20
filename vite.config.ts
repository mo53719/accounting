import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // 仅在打包给客户时把所有 JS/CSS/图片内联到单个 HTML（避免 file:// 协议 ES Module 加载失败）
    // 开发模式不启用，保持 HMR
    ...(mode === 'demo' ? [viteSingleFile()] : []),
  ],
  // 关键修复 ①：相对路径，确保本地文件和 WebView 都能加载资源
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    // 关键修复 ②：强制 ES2015 语法兼容老旧 WebView（华为低版本不支持 ?. ?? 等 ES2020+）
    // es2015 保证不出现箭头函数/let/const/解构等可能不兼容的语法
    // chrome60 是最低 Chrome 安卓内核，覆盖面最广
    target: ['es2015', 'chrome60'],

    // 关键修复 ③：关闭 sourcemap，减少构建复杂度
    sourcemap: false,

    // 关键修复 ④：插画图（>4KB）走独立文件，不内联为 base64，减小单文件体积
    assetsInlineLimit: 4096,

    // 资源分类：插画图都进 images 目录，便于缓存命中
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (/\.(png|jpe?g|webp|gif|svg)$/i.test(assetInfo.name || '')) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|ttf|otf)$/i.test(assetInfo.name || '')) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },

    // 关键修复 ⑤：生产构建移除所有 console 调用（含 log/debug/warn/error）
    // Vite 6 默认 minify 用 esbuild，esbuild.drop 直接支持
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
}))
