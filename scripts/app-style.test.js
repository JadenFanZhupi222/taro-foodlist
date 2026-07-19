const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

test('global styles do not emit a reduced-motion media block for WeChat', () => {
  const source = fs.readFileSync(path.resolve(__dirname, '../src/app.scss'), 'utf8')
  assert.doesNotMatch(source, /prefers-reduced-motion/)
})
