/**
 * Vite 插件：修复 react-redux v9 在小程序运行时 `React(undefined).useSyncExternalStore` 崩溃。
 *
 * 根因：Taro vite 的默认 manualChunks 把 react/react-reconciler/scheduler 归入 `taro` chunk，
 * 其余 node_modules（含 react-redux）归入 `vendors` chunk。二者循环 require，
 * 而 taro.js 在末尾才 `exports.reactExports=React`，vendors.js 顶层就读它 → undefined → 崩。
 * （webpack 用 live binding 能扛循环，vite/rollup 顶层快照属性值故崩。）
 *
 * 修法：**忠实复刻 Taro 的 manualChunks 逻辑**（见 @tarojs/vite-runner/dist/mini/config.js
 * 的 getManualChunks），仅把 redux 生态额外并入 `taro` chunk，使其与 React 同 chunk，
 * 消除跨 chunk 循环。其余归类与 Taro 完全一致，故产物结构（taro.js/vendors.js/common.js）保持不变。
 *
 * 注意：vite 插件 config() 返回的 manualChunks 会整体替换 Taro 的，所以这里必须完整复刻、
 * 不能只处理 redux，否则 taro/common 分块逻辑丢失、产物碎裂。
 */
const { REG_TARO_SCOPED_PACKAGE, REG_NODE_MODULES_DIR } = require('@tarojs/helper')

// 本插件的 manualChunks 逐条复刻自该版本 vite-runner 的 getManualChunks。
// Taro 升级若改了分块逻辑，这份复刻会静默漂移——版本不符时给出告警，把"哑雷"变"明示"。
const VERIFIED_VITE_RUNNER_VERSION = '4.1.1'
try {
  const actual = require('@tarojs/vite-runner/package.json').version
  if (actual !== VERIFIED_VITE_RUNNER_VERSION) {
    console.warn(
      `[redux-chunk-vite-plugin] 本插件的 manualChunks 复刻自 @tarojs/vite-runner@${VERIFIED_VITE_RUNNER_VERSION}，` +
      `当前为 ${actual}。若升级后产物分块异常或 react-redux 运行时再现 useSyncExternalStore 崩溃，` +
      `请核对 @tarojs/vite-runner/dist/mini/config.js 的 getManualChunks 是否变更并同步本插件。`
    )
  }
} catch (e) {
  // 取不到版本不影响功能，忽略
}

function reduxChunkVitePlugin() {
  return {
    name: 'fix-redux-react-chunk-cycle',
    config() {
      return {
        build: {
          rollupOptions: {
            output: {
              manualChunks(id, { getModuleInfo }) {
                // REG_NODE_MODULES_DIR 带 g 标志、有状态，复刻 Taro 的重置
                REG_NODE_MODULES_DIR.lastIndex = 0

                const reactRelatedDeps = [
                  /node_modules[\\/]react-reconciler[\\/]/,
                  /node_modules[\\/]react[\\/]/,
                  /node_modules[\\/]scheduler[\\/]/,
                  // ↓ 相对 Taro 默认的扩展：所有【会消费 React】的依赖都并入 taro chunk，
                  //   与 React 同 chunk，使 vendors 完全不再跨 chunk 引用 React → 彻底断开
                  //   taro↔vendors 因 React 产生的循环（含 react-redux 顶层 useSyncExternalStore、
                  //   nutui 顶层 forwardRef 等"模块顶层即时访问 React"的崩溃点）。
                  //   清单覆盖项目里所有会 import React 的库——宁可宽，漏一个就会静默复发崩溃。
                  /node_modules[\\/]react-redux[\\/]/,
                  /node_modules[\\/]@reduxjs[\\/]toolkit[\\/]/,
                  /node_modules[\\/]redux[\\/]/,
                  /node_modules[\\/]redux-thunk[\\/]/,
                  /node_modules[\\/]reselect[\\/]/,
                  /node_modules[\\/]use-sync-external-store[\\/]/,
                  /node_modules[\\/]react-transition-group[\\/]/,
                  /node_modules[\\/]taro-ui[\\/]/,
                  // 整个 @nutui scope（nutui-react-taro 及其传递的 React 消费依赖
                  // @nutui/icons-react-taro 等，目前虽被 tree-shaking 摇掉、但一旦用到图标即入包）
                  /node_modules[\\/]@nutui[\\/]/,
                  // nutui 传递依赖中会 import React 的库（动画/手势）
                  /node_modules[\\/]lottie-react[\\/]/,
                  /node_modules[\\/]@react-spring[\\/]/,
                  /node_modules[\\/]@use-gesture[\\/]/,
                  /node_modules[\\/]react-fast-compare[\\/]/
                ]
                const taroViteRunnerDeps = /node_modules[\\/]@tarojs[\\/]vite-runner/
                const tslibDeps = /node_modules[\\/]tslib[\\/]/
                const commonjsHelpersDeps = /commonjsHelpers\.js$/

                // 复刻 Taro getManualChunks 的 react 分支顺序：
                if (taroViteRunnerDeps.test(id)) return null
                if (
                  REG_TARO_SCOPED_PACKAGE.test(id) ||
                  reactRelatedDeps.some(r => r.test(id)) ||
                  tslibDeps.test(id) ||
                  commonjsHelpersDeps.test(id)
                ) {
                  return 'taro'
                }
                if (REG_NODE_MODULES_DIR.test(id)) return 'vendors'
                const moduleInfo = getModuleInfo(id)
                if (moduleInfo && moduleInfo.importers && moduleInfo.importers.length > 1) {
                  return 'common'
                }
              }
            }
          }
        }
      }
    }
  }
}

module.exports = reduxChunkVitePlugin
