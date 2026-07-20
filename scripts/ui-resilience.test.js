const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const assert = require('node:assert/strict')

const root = path.resolve(__dirname, '..')
const read = file => fs.readFileSync(path.join(root, file), 'utf8')

test('recipe detail renders compact empty ingredient and step states', () => {
  const source = read('src/pages/recipe/detail/index.tsx')
  const styles = read('src/pages/recipe/detail/index.scss')

  assert.match(source, /暂未填写食材/)
  assert.match(source, /暂未填写步骤/)
  assert.match(source, /recipe-detail__empty/)
  assert.match(styles, /\.recipe-detail__empty\s*\{/)
  assert.match(styles, /padding-bottom:\s*calc\(6rem \+ env\(safe-area-inset-bottom\)\)/)
})

test('recipe editor seeds blank rows when persisted arrays are empty', () => {
  const source = read('src/pages/recipe/edit/index.tsx')

  assert.match(source, /editingRecipe\?\.ingredients\?\.length/)
  assert.match(source, /editingRecipe\?\.steps\?\.length/)
})

test('textareas use border-box sizing globally', () => {
  const styles = read('src/app.scss')

  assert.match(styles, /input,\s*\ntextarea,\s*\nimage\s*\{\s*\n\s*box-sizing:\s*border-box;/)
})

test('long recipe detail text wraps without crowding adjacent content', () => {
  const styles = read('src/pages/recipe/detail/index.scss')

  assert.match(styles, /\.recipe-detail__name\s*\{[^}]*min-width:\s*0[^}]*overflow-wrap:\s*anywhere/s)
  assert.match(styles, /\.recipe-detail__ingredient-name\s*\{[^}]*min-width:\s*0[^}]*overflow-wrap:\s*anywhere/s)
  assert.match(styles, /\.recipe-detail__ingredient-amount\s*\{[^}]*overflow-wrap:\s*anywhere/s)
})
