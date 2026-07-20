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
  assert.match(slice, /fulfillDetailRequest\(state, action\.meta\.arg/)
})

test('recipe detail request transitions handle duplicate, retry, stale, and reset races', () => {
  const helperPath = path.join(root, 'src/store/recipe/detailRequest.js')
  assert.equal(fs.existsSync(helperPath), true, 'detail request identity helper must exist')
  const transitions = require(helperPath)
  for (const name of ['canStartDetailRequest', 'startDetailRequest', 'fulfillDetailRequest', 'rejectDetailRequest']) {
    assert.equal(typeof transitions[name], 'function', `${name} must be production-callable`)
  }

  const state = { recipes: [], detailRequests: {} }
  assert.equal(transitions.canStartDetailRequest(state.detailRequests, 'recipeA'), true)
  transitions.startDetailRequest(state, 'recipeA', 'first')
  assert.equal(transitions.canStartDetailRequest(state.detailRequests, 'recipeA'), false)
  transitions.rejectDetailRequest(state, 'recipeA', 'first')
  assert.equal(state.detailRequests.recipeA.status, 'failed')
  transitions.startDetailRequest(state, 'recipeA', 'retry')
  assert.equal(state.detailRequests.recipeA.requestId, 'retry')
  assert.equal(transitions.fulfillDetailRequest(state, 'recipeA', 'first', { _id: 'recipeA', name: 'stale' }), false)
  assert.equal(transitions.rejectDetailRequest(state, 'recipeA', 'first'), false)
  assert.equal(state.recipes.length, 0)
  assert.equal(transitions.fulfillDetailRequest(state, 'recipeA', 'retry', { _id: 'recipeA', name: 'fresh' }), true)
  assert.equal(state.recipes[0].name, 'fresh')

  transitions.startDetailRequest(state, 'recipeB', 'before-reset')
  state.detailRequests = {}
  assert.equal(transitions.fulfillDetailRequest(state, 'recipeB', 'before-reset', { _id: 'recipeB' }), false)
  assert.equal(transitions.rejectDetailRequest(state, 'recipeB', 'before-reset'), false)
  assert.equal(state.recipes.some(recipe => recipe._id === 'recipeB'), false)
})

test('recipe detail reducers gate completions by request id and suppress duplicate loads', () => {
  const slice = read('src/store/recipe/recipeSlice.ts')
  const thunks = read('src/thunks/recipe/thunks.ts')

  assert.match(slice, /import detailRequestModule = require\('\.\/detailRequest'\)/)
  assert.match(slice, /startDetailRequest\(state, action\.meta\.arg, action\.meta\.requestId\)/)
  assert.match(slice, /fulfillDetailRequest\(state, action\.meta\.arg, action\.meta\.requestId, action\.payload\)/)
  assert.match(slice, /rejectDetailRequest\(state, action\.meta\.arg, action\.meta\.requestId\)/)
  assert.match(thunks, /condition:\s*\(recipeId, \{ getState \}\)/)
  assert.match(thunks, /canStartDetailRequest\(\(getState\(\) as RootState\)\.recipe\.detailRequests, recipeId\)/)
})

test('recipe save controller owns ordering, failures, unlocking, and same-tick deduplication', async () => {
  const helperPath = path.join(root, 'src/pages/recipe/edit/recipeSave.js')
  assert.equal(fs.existsSync(helperPath), true, 'recipe save controller must exist')
  const { createRecipeSaveController } = require(helperPath)
  assert.equal(typeof createRecipeSaveController, 'function')

  const events = []
  const controller = createRecipeSaveController(locked => events.push(locked ? 'lock' : 'unlock'))
  let persistCalls = 0
  let successCalls = 0
  let failureCalls = 0
  const uploadFailure = await controller.run({
    upload: async () => { events.push('upload'); throw new Error('upload failed') },
    persist: async () => { persistCalls += 1 },
    onSuccess: () => { successCalls += 1 },
    onFailure: () => { failureCalls += 1 }
  })
  assert.equal(uploadFailure, false)
  assert.equal(persistCalls, 0)
  assert.equal(successCalls, 0)
  assert.equal(failureCalls, 1)
  assert.deepEqual(events, ['lock', 'upload', 'unlock'])

  events.length = 0
  const persistFailure = await controller.run({
    upload: async () => { events.push('upload'); return 'image' },
    persist: async () => { events.push('persist'); throw new Error('persist failed') },
    onSuccess: () => { successCalls += 1 },
    onFailure: () => { failureCalls += 1 }
  })
  assert.equal(persistFailure, false)
  assert.equal(successCalls, 0)
  assert.equal(failureCalls, 2)
  assert.deepEqual(events, ['lock', 'upload', 'persist', 'unlock'])

  events.length = 0
  let releaseUpload
  const first = controller.run({
    upload: () => {
      events.push('upload')
      return new Promise(resolve => { releaseUpload = resolve })
    },
    persist: async image => { events.push(`persist:${image}`) },
    onSuccess: () => { events.push('success') },
    onFailure: () => { events.push('failure') }
  })
  const duplicate = await controller.run({
    upload: async () => 'duplicate', persist: async () => {}, onSuccess: () => {}, onFailure: () => {}
  })
  assert.equal(duplicate, false)
  releaseUpload('fresh-image')
  assert.equal(await first, true)
  assert.deepEqual(events, ['lock', 'upload', 'persist:fresh-image', 'success', 'unlock'])
})

test('recipe saves unwrap dispatch results and only leave after fulfillment', () => {
  const source = read('src/pages/recipe/edit/index.tsx')
  const thunks = read('src/thunks/recipe/thunks.ts')

  assert.doesNotMatch(source, /updateRecipeInStore/)
  assert.match(source, /import recipeSaveModule = require\('\.\/recipeSave'\)/)
  assert.match(source, /const \[saving, setSaving\] = useState\(false\)/)
  assert.match(source, /createRecipeSaveController\(setSaving\)/)
  assert.match(source, /saveController\.run\(\{/)
  assert.match(source, /upload:\s*async \(\) =>[\s\S]*useCloudUpload/)
  assert.match(source, /persist:\s*async imageUrl =>/)
  assert.match(source, /onSuccess:\s*\(\) =>/)
  assert.match(source, /onFailure:\s*\(\) =>/)
  assert.match(source, /<Loading visible=\{saving\} \/>/)
  assert.match(source, /disabled=\{saving\}/)
  assert.match(source, /await dispatch\(updateRecipeById\([\s\S]*?\)\)\.unwrap\(\)/)
  assert.match(source, /await dispatch\(createRecipe\([\s\S]*?\)\)\.unwrap\(\)/)
  assert.match(source, /onSuccess:[\s\S]*toast\(\{ title: '[^']*', icon: 'success' \}\)[\s\S]*Taro\.navigateBack\(\)/)
  assert.match(source, /onFailure:[\s\S]*toast\(\{ title: '[^']*', icon: 'none' \}\)/)
  assert.doesNotMatch(thunks, /createRecipe[\s\S]*?toast\([\s\S]*?updateRecipeById/)
  assert.doesNotMatch(thunks, /updateRecipeById[\s\S]*?toast\([\s\S]*?deleteRecipeById/)
})
