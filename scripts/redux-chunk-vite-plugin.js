/**
 * Vite 插件：根治 Taro vite 小程序的"跨 chunk 循环依赖致运行时崩溃"。
 *
 * 症状：开发者工具运行时报
 *   - `Cannot read property 'useSyncExternalStore' of undefined`（react-redux）
 *   - `taro.getDefaultExportFromCjs is not a function`（rollup commonjs helper）
 *   全 app 起不来（页面未注册）。
 *
 * 根因：Taro vite 的默认 manualChunks 把 react/react-reconciler/scheduler/commonjsHelpers
 * 归入 `taro` chunk，其余 node_modules 归入 `vendors` chunk。两 chunk **互相 require（循环）**：
 * app.js 先 require taro.js → taro.js 第一行就 require vendors.js → vendors.js 在模块顶层
 * 读取 taro 的导出（reactExports / getDefaultExportFromCjs 等），而此时 taro.js 才执行到第一行、
 * 这些导出（在 taro.js 末尾才赋值）尚为 undefined → 崩。
 * （webpack 用 live binding 能扛循环，vite/rollup 顶层把属性值快照了故崩。）
 *
 * 修法：放弃 Taro 的 taro/vendors 双分块，**把所有第三方依赖合并进单一 `taro` chunk**，
 * 从根上消灭 vendors chunk → taro↔vendors 循环不复存在，任何"vendors 顶层读 taro 未就绪导出"
 * 的崩点一次性全消（不再需要逐个枚举"会消费 React 的库"那种易漏的 allowlist）。
 * app 源码仍按 Taro 的"多页共享→common"逻辑分块，结构不乱。
 *
 * 代价：taro chunk 体积增加（吸收原 vendors，约 +30K），远低于小程序主包 2MB 限制；
 * 仅损失"vendors 单独缓存"的次要收益，换取正确性，值得。
 *
 * 注：vite 插件 config() 返回的 manualChunks 会整体替换 Taro 的，故必须完整覆盖 app 源码分块
 * （null / taro / common 三类），否则页面代码会退回 Rollup 默认乱拆。
 */
const { REG_NODE_MODULES_DIR } = require('@tarojs/helper')

// 本插件整体替换 Taro vite 的 manualChunks（基于其 4.1.1 的分块契约：taro/common 命名、
// app.js 按实际产物 chunk 生成 require）。Taro 升级若改了分块约定，这里可能需同步——
// 版本不符时给出告警，把潜在的"哑雷"变"明示"。
const VERIFIED_VITE_RUNNER_VERSION = '4.1.1'
try {
  const actual = require('@tarojs/vite-runner/package.json').version
  if (actual !== VERIFIED_VITE_RUNNER_VERSION) {
    console.warn(
      `[redux-chunk-vite-plugin] 本插件的 manualChunks 基于 @tarojs/vite-runner@${VERIFIED_VITE_RUNNER_VERSION} 的分块契约，` +
      `当前为 ${actual}。若升级后产物分块异常或运行时再现跨 chunk 崩溃（useSyncExternalStore / ` +
      `getDefaultExportFromCjs is not a function），请核对本插件是否需同步。`
    )
  }
} catch (e) {
  // 取不到版本不影响功能，忽略
}

function reduxChunkVitePlugin() {
  return {
    name: 'fix-react-chunk-cycle',
    config() {
      return {
        build: {
          rollupOptions: {
            output: {
              manualChunks(id, { getModuleInfo }) {
                // REG_NODE_MODULES_DIR 带 g 标志、有状态，每次调用先复位（与 Taro 原版一致）
                REG_NODE_MODULES_DIR.lastIndex = 0

                // vite-runner 注入的辅助文件（如 comp.js）不并入任何 vendor chunk
                if (/node_modules[\\/]@tarojs[\\/]vite-runner/.test(id)) return null

                // 所有第三方依赖 + rollup commonjs helper 全部合并进单一 taro chunk，
                // 彻底消除 taro↔vendors 跨 chunk 循环
                if (REG_NODE_MODULES_DIR.test(id) || /commonjsHelpers\.js$/.test(id)) {
                  return 'taro'
                }

                // app 源码：被多页共享的进 common（复刻 Taro 默认逻辑，避免页面代码乱拆）
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
