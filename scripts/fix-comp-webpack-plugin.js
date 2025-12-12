/**
 * Webpack 插件：修复 comp.json 的循环引用问题，并确保 comp.wxss 存在
 */
class FixCompJsonPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('FixCompJsonPlugin', (compilation) => {
      const fs = require('fs')
      const path = require('path')
      const outputPath = compiler.options.output.path
      const compJsonPath = path.join(outputPath, 'comp.json')
      const compWxssPath = path.join(outputPath, 'comp.wxss')
      
      // 1. 修复 comp.json 的循环引用
      if (fs.existsSync(compJsonPath)) {
        try {
          const content = fs.readFileSync(compJsonPath, 'utf8')
          const json = JSON.parse(content)
          
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
      if (!fs.existsSync(compWxssPath)) {
        try {
          fs.writeFileSync(compWxssPath, '/* Taro 自动生成的 comp 组件样式文件 */\n', 'utf8')
          console.log('✅ Created missing comp.wxss file')
        } catch (error) {
          console.error('❌ Error creating comp.wxss:', error.message)
        }
      }
    })
  }
}

module.exports = FixCompJsonPlugin

