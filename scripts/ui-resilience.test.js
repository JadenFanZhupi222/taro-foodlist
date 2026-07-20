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

test('signed-in cold recipe details fetch by id without requesting guest fixtures', () => {
  const source = read('src/pages/recipe/detail/index.tsx')
  const thunks = read('src/thunks/recipe/thunks.ts')

  assert.match(source, /dispatch\(fetchRecipeById\(id\)\)/)
  assert.match(source, /if \(!user \|\| !id \|\| recipe \|\| isGuestRecipeId\(id\)\) return/)
  assert.match(source, /const \{[^}]*isGuestRecipeId[^}]*\} = guestRecipeModule/)
  assert.doesNotMatch(thunks, /callCloud<[^>]+>\('get-recipe'/)
  assert.match(thunks, /async \(recipeId: string, \{ getState \}\)/)
  assert.match(thunks, /callCloud<Recipe\[\]>\('get-recipes', \{ familyId \}\)/)
  assert.match(thunks, /r\.data\?\.find\(recipe => recipe\._id === recipeId\) \?\? null/)
})

test('cold recipe detail distinguishes loading, retryable failure, and confirmed not found', () => {
  const source = read('src/pages/recipe/detail/index.tsx')
  const slice = read('src/store/recipe/recipeSlice.ts')

  assert.match(source, /detailRequest\?\.status === 'loading'/)
  assert.match(source, /detailRequest\?\.status === 'failed'/)
  assert.match(source, /actionLabel='[^']*'/)
  assert.match(source, /onAction=\{\(\) => dispatch\(fetchRecipeById\(id!\)\)\}/)
  assert.match(source, /detailRequest\?\.status === 'not-found'/)
  assert.match(slice, /addCase\(fetchRecipeById\.pending/)
  assert.match(slice, /addCase\(fetchRecipeById\.rejected/)
  assert.match(slice, /addCase\(fetchRecipeById\.fulfilled/)
  assert.match(slice, /state\.detailRequests\[action\.meta\.arg\]/)
})

test('recipe detail request identity rejects stale completions and completions after reset', () => {
  const helperPath = path.join(root, 'src/store/recipe/detailRequest.js')
  assert.equal(fs.existsSync(helperPath), true, 'detail request identity helper must exist')
  const { createDetailRequest, isCurrentDetailRequest } = require(helperPath)

  let requests = { recipeA: createDetailRequest('first') }
  assert.equal(isCurrentDetailRequest(requests, 'recipeA', 'first'), true)
  requests = { recipeA: createDetailRequest('retry') }
  assert.equal(isCurrentDetailRequest(requests, 'recipeA', 'first'), false)
  assert.equal(isCurrentDetailRequest(requests, 'recipeA', 'retry'), true)
  requests = {}
  assert.equal(isCurrentDetailRequest(requests, 'recipeA', 'retry'), false)
})

test('recipe detail reducers gate completions by request id and suppress duplicate loads', () => {
  const slice = read('src/store/recipe/recipeSlice.ts')
  const thunks = read('src/thunks/recipe/thunks.ts')

  assert.match(slice, /import detailRequestModule = require\('\.\/detailRequest'\)/)
  assert.match(slice, /createDetailRequest\(action\.meta\.requestId\)/)
  assert.match(slice, /isCurrentDetailRequest\(state\.detailRequests, recipeId, action\.meta\.requestId\)/)
  assert.match(thunks, /condition:\s*\(recipeId, \{ getState \}\)/)
  assert.match(thunks, /detailRequests\[recipeId\]\?\.status !== 'loading'/)
})

test('recipe saves unwrap dispatch results and only leave after fulfillment', () => {
  const source = read('src/pages/recipe/edit/index.tsx')
  const thunks = read('src/thunks/recipe/thunks.ts')

  assert.doesNotMatch(source, /updateRecipeInStore/)
  assert.match(source, /const \[saving, setSaving\] = useState\(false\)/)
  assert.match(source, /if \(saving\) return/)
  assert.match(source, /const savingRef = useRef\(false\)/)
  assert.match(source, /if \(savingRef\.current\) return/)
  assert.match(source, /savingRef\.current = true/)
  assert.match(source, /savingRef\.current = false/)
  assert.match(source, /setSaving\(true\)[\s\S]*try\s*\{[\s\S]*await useCloudUpload/)
  assert.match(source, /finally\s*\{[\s\S]*savingRef\.current = false[\s\S]*setSaving\(false\)[\s\S]*\}/)
  assert.match(source, /<Loading visible=\{saving\} \/>/)
  assert.match(source, /disabled=\{saving\}/)
  assert.match(source, /await dispatch\(updateRecipeById\([\s\S]*?\)\)\.unwrap\(\)/)
  assert.match(source, /await dispatch\(createRecipe\([\s\S]*?\)\)\.unwrap\(\)/)
  assert.match(source, /try\s*\{[\s\S]*toast\(\{ title: '[^']*', icon: 'success' \}\)[\s\S]*Taro\.navigateBack\(\)[\s\S]*\}\s*catch/)
  assert.match(source, /catch[\s\S]*toast\(\{ title: '[^']*', icon: 'none' \}\)/)
  assert.doesNotMatch(thunks, /createRecipe[\s\S]*?toast\([\s\S]*?updateRecipeById/)
  assert.doesNotMatch(thunks, /updateRecipeById[\s\S]*?toast\([\s\S]*?deleteRecipeById/)
})
