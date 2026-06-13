/**
 * Vite 插件：补齐微信小程序所需的产物文件
 *
 * 是 scripts/fix-comp-webpack-plugin.js 的 Vite 版（webpack 版用 afterEmit 钩子）。
 * 用 closeBundle 钩子（产物全部写盘后触发），全部操作幂等：缺啥补啥，不缺不动。
 *
 * 做三件事：
 *  1. 修复 comp.json 的循环引用（usingComponents.comp === './comp'）
 *  2. 确保 comp.wxss 存在
 *  3. 给每个页面（dist 下每个 .wxml）补齐同名空 .wxss
 *     —— webpack-runner 会为每页生成空 wxss 兜底；Vite 对“空样式页”不生成，
 *        补上以与 webpack 产物对齐，避免微信端缺文件困惑。
 */
const fs = require('fs')
const path = require('path')

function walkWxml(dir, acc) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkWxml(full, acc)
    else if (entry.isFile() && entry.name.endsWith('.wxml')) acc.push(full)
  }
  return acc
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

      // 3. 给每个页面补齐同名空 .wxss（空样式页在 Vite 下不会生成 wxss）
      //    只扫 dist/pages/ 下的真实页面，不碰根目录的 base.wxml 等模板（与 webpack 产物对齐）
      const pagesDir = path.join(outputPath, 'pages')
      if (fs.existsSync(pagesDir)) {
        try {
          let created = 0
          for (const wxml of walkWxml(pagesDir, [])) {
            const wxss = wxml.replace(/\.wxml$/, '.wxss')
            if (!fs.existsSync(wxss)) {
              fs.writeFileSync(wxss, '/* Taro 自动生成的空样式文件 */\n', 'utf8')
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
}

module.exports = fixCompJsonVitePlugin
