const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')

const source = fs.readFileSync(path.join(__dirname, '..', 'config', 'index.ts'), 'utf8')

test('Vite-backed H5 config does not use webpack output filename keys', () => {
  const h5Block = source.match(/h5:\s*\{[\s\S]*?miniCssExtractPluginOption:/)
  assert.ok(h5Block, 'H5 configuration block is missing')
  assert.doesNotMatch(h5Block[0], /\boutput:\s*\{/)
})
