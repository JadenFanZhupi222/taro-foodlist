import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import devConfig from './dev'
import prodConfig from './prod'
import path from 'path'
// comp.json 循环引用修复：Vite 版插件（替代原 webpack 的 fix-comp-webpack-plugin）
const fixCompJsonVitePlugin = require('../scripts/fix-comp-vite-plugin')
// 修复 react-redux 与 React 跨 chunk 循环依赖（运行时 useSyncExternalStore of undefined）
const reduxChunkVitePlugin = require('../scripts/redux-chunk-vite-plugin')

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(async (merge) => {
  // 产物目录：单一来源，同时供 Taro 的 outputRoot 与 fix-comp 插件使用，避免两处写死不同步
  const OUTPUT_ROOT = 'dist'
  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'ymscp-recipe',
    date: '2025-5-29',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: OUTPUT_ROOT,
    plugins: [],
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: {
      type: 'vite',
      // 注：原 webpack 配置里的 prebundle/cache 是 webpack 专属，vite-runner 不消费，已移除
      // comp.json 循环引用 / comp.wxss 缺失修复（产物后处理，原 webpackChain 里挂的插件迁移到此）
      // + chunk 合并修复（把所有第三方依赖并入单一 taro chunk，消除 taro↔vendors 跨 chunk
      //   循环导致的运行时崩溃：useSyncExternalStore / getDefaultExportFromCjs is not a function）
      vitePlugins: [fixCompJsonVitePlugin(OUTPUT_ROOT), reduxChunkVitePlugin()]
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
      // 路径别名 @/ 由下方顶层 alias 处理，Vite 直接读取，无需 tsconfig-paths 插件
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    },
    alias: {
      '@': path.resolve(__dirname, '..', 'src')
    }
  }

  process.env.BROWSERSLIST_ENV = process.env.NODE_ENV

  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
