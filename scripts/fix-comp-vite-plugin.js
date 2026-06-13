/**
 * Vite 插件：补齐微信小程序所需的产物文件
 *
 * 是 scripts/fix-comp-webpack-plugin.js 的 Vite 版（webpack 版用 afterEmit 钩子）。
 * 用 closeBundle 钩子（产物全部写盘后触发），全部操作幂等：缺啥补啥，不缺不动。
 *
 * 做三件事：
 *  1. 修复 comp.json 的循环引用（usingComponents.comp === './comp'）
 *  2. 确保 comp.wxss 存在
 *  3. 给每个注册页面补齐同名空 .wxss（按 app.json 的权威页面清单，不靠目录约定）
 *     —— webpack-runner 会为每页生成空 wxss 兜底；Vite 对“空样式页”不生成，
 *        补上以与 webpack 产物对齐，避免微信端缺文件困惑。
 */
const fs = require('fs')
const path = require('path')

/** 从 app.json 解析出所有注册页面路径（主包 pages + 分包 root/pages，不依赖目录约定） */
function readRegisteredPages(outputPath) {
  const appJsonPath = path.join(outputPath, 'app.json')
  if (!fs.existsSync(appJsonPath)) return []
  const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
  const pages = [...(app.pages || [])]
  for (const sub of (app.subPackages || app.subpackages || [])) {
    const root = String(sub.root || '').replace(/\/$/, '')
    for (const p of (sub.pages || [])) pages.push(root ? `${root}/${p}` : p)
  }
  return pages
}

function fixCompJsonVitePlugin(outputRoot = 'dist') {
  return {
    name: 'fix-comp-json',
    closeBundle() {
      const outputPath = path.resolve(process.cwd(), outputRoot)
      if (!fs.existsSync(outputPath)) return
      const compJsonPath = path.join(outputPath, 'comp.json')
      const compWxssPath = path.join(outputPath, 'comp.wxss')

      // 1. 修复 comp.json 的循环引用（usingComponents.comp === './comp'）
      if (fs.existsSync(compJsonPath)) {
        try {
          const json = JSON.parse(fs.readFileSync(compJsonPath, 'utf8'))
          if (json.usingComponents && json.usingComponents.comp === './comp') {
            delete json.usingComponents.comp
            if (Object.keys(json.usingComponents).length === 0) {
              delete json.usingComponents
            }
            fs.writeFileSync(compJsonPath, JSON.stringify(json))
            console.log('✅ Fixed comp.json circular reference')
          }
        } catch (error) {
          console.error('❌ Error fixing comp.json:', error.message)
        }
      }

      // 2. 确保 comp.wxss 存在（微信小程序组件必须包含 .wxss 文件）
      if (fs.existsSync(compJsonPath) && !fs.existsSync(compWxssPath)) {
        try {
          fs.writeFileSync(compWxssPath, '/* Taro 自动生成的 comp 组件样式文件 */\n', 'utf8')
          console.log('✅ Created missing comp.wxss file')
        } catch (error) {
          console.error('❌ Error creating comp.wxss:', error.message)
        }
      }

      // 3. 给每个注册页面补齐同名空 .wxss（空样式页在 Vite 下不会生成 wxss）
      //    按 app.json 的页面清单定位，覆盖任意分包 root（不再假设页面都在 pages/ 下）
      try {
        let created = 0
        for (const page of readRegisteredPages(outputPath)) {
          const wxmlPath = path.join(outputPath, `${page}.wxml`)
          const wxssPath = path.join(outputPath, `${page}.wxss`)
          // 仅当该页确有 wxml 产物却缺 wxss 时补，避免给不存在的页凭空造文件
          if (fs.existsSync(wxmlPath) && !fs.existsSync(wxssPath)) {
            fs.writeFileSync(wxssPath, '/* Taro 自动生成的空样式文件 */\n', 'utf8')
            created++
          }
        }
        if (created > 0) console.log(`✅ Backfilled ${created} missing page .wxss file(s)`)
      } catch (error) {
        console.error('❌ Error backfilling page .wxss:', error.message)
      }
    }
  }
}

module.exports = fixCompJsonVitePlugin
