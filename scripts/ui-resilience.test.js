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

test('today state distinguishes access, resolving, failed, and confirmed empty menus', () => {
  const helperPath = path.join(root, 'src/pages/today/todayState.js')
  assert.equal(fs.existsSync(helperPath), true, 'Today state helper must exist')
  const { classifyTodayState, getTodayAddAction } = require(helperPath)

  assert.equal(getTodayAddAction({ userId: '', familyId: '' }), 'login')
  assert.equal(getTodayAddAction({ userId: 'user', familyId: '' }), 'family')
  assert.equal(getTodayAddAction({ userId: 'user', familyId: 'family' }), 'add')
  assert.equal(classifyTodayState({ userId: '', familyId: '', menu: null }), 'login')
  assert.equal(classifyTodayState({ userId: 'user', familyId: '', menu: null }), 'family')
  assert.equal(classifyTodayState({ userId: 'user', familyId: 'family', requestStatus: 'failed', menu: null }), 'failed')
  assert.equal(classifyTodayState({ userId: 'user', familyId: 'family', requestStatus: 'loading', menu: null }), 'resolving')
  assert.equal(classifyTodayState({ userId: 'user', familyId: 'family', requestStatus: 'empty', menu: null }), 'empty')
  assert.equal(classifyTodayState({ userId: 'user', familyId: 'family', menu: { recipes: [] } }), 'empty')
  assert.equal(classifyTodayState({ userId: 'user', familyId: 'family', menu: { recipes: [{ recipe_id: 'r1' }] }, resolvedRecipeCount: 0 }), 'resolving')
  assert.equal(classifyTodayState({ userId: 'user', familyId: 'family', menu: { recipes: [{ recipe_id: 'r1' }] }, resolvedRecipeCount: 1 }), 'ready')
})

test('per-date menu request transitions ignore stale completion and allow retry', () => {
  const helperPath = path.join(root, 'src/store/dailyMenu/dateRequest.js')
  assert.equal(fs.existsSync(helperPath), true, 'date request helper must exist')
  const requests = require(helperPath)
  const state = { dateRequests: {} }

  const key = requests.getDateRequestKey('family', '2026-07-20')
  requests.startDateRequest(state, 'family', '2026-07-20', 'first')
  requests.startDateRequest(state, 'family', '2026-07-20', 'retry')
  assert.equal(requests.rejectDateRequest(state, 'family', '2026-07-20', 'first', 'stale'), false)
  assert.equal(state.dateRequests[key].status, 'loading')
  assert.equal(requests.rejectDateRequest(state, 'family', '2026-07-20', 'retry', 'network'), true)
  assert.equal(state.dateRequests[key].status, 'failed')
  assert.equal(state.dateRequests[key].error, 'network')
  requests.startDateRequest(state, 'family', '2026-07-20', 'third')
  assert.equal(requests.fulfillDateRequest(state, 'family', '2026-07-20', 'retry', null), false)
  assert.equal(requests.fulfillDateRequest(state, 'family', '2026-07-20', 'third', null), true)
  assert.equal(state.dateRequests[key].status, 'empty')
})

test('today page guards writes and renders actionable access and retry states', () => {
  const source = read('src/pages/today/index.tsx')
  const slice = read('src/store/dailyMenu/dailyMenuSlice.ts')

  assert.match(source, /getTodayAddAction\(\{ userId: user\?\._id, familyId: family\?\._id \}\)/)
  assert.match(source, /if \(addAction !== 'add'\)/)
  assert.match(source, /Taro\.switchTab\(\{ url: '\/pages\/profile\/index' \}\)/)
  assert.match(source, /Taro\.navigateTo\(\{ url: '\/pages\/family\/index' \}\)/)
  assert.match(source, /dispatch\(createOrUpdateDailyMenu\(\{/)
  assert.doesNotMatch(source, /familyId: family\?\._id \|\| ''/)
  assert.doesNotMatch(source, /userId: user\?\._id \|\| ''/)
  assert.match(source, /todayState === 'failed'/)
  assert.match(source, /retryDateFetch/)
  assert.match(slice, /startDateRequest\(state, action\.meta\.arg\.familyId, action\.meta\.arg\.date, action\.meta\.requestId\)/)
  assert.match(slice, /fulfillDateRequest\(state, familyId, date, action\.meta\.requestId, action\.payload\)/)
  assert.match(slice, /rejectDateRequest\(state, action\.meta\.arg\.familyId, action\.meta\.arg\.date, action\.meta\.requestId/)
})

test('today date requests and menu lookup are scoped by family', () => {
  const requests = require(path.join(root, 'src/store/dailyMenu/dateRequest.js'))
  const today = require(path.join(root, 'src/pages/today/todayState.js'))
  const state = { dateRequests: {} }
  const date = '2026-07-20'

  assert.equal(requests.getDateRequestKey('family-a', date), 'family-a::2026-07-20')
  requests.startDateRequest(state, 'family-a', date, 'a-request')
  requests.startDateRequest(state, 'family-b', date, 'b-request')
  assert.equal(state.dateRequests[requests.getDateRequestKey('family-a', date)].status, 'loading')
  assert.equal(state.dateRequests[requests.getDateRequestKey('family-b', date)].status, 'loading')
  assert.equal(requests.fulfillDateRequest(state, 'family-a', date, 'a-request', { family_id: 'family-a' }), true)
  assert.equal(state.dateRequests[requests.getDateRequestKey('family-b', date)].status, 'loading')

  const menus = [
    { _id: 'a-menu', family_id: 'family-a', date, recipes: [] },
    { _id: 'b-menu', family_id: 'family-b', date, recipes: [] }
  ]
  assert.equal(today.findFamilyMenu(menus, 'family-b', date)._id, 'b-menu')
  assert.equal(today.shouldFetchDate({ familyId: 'family-b', menu: null, requestStatus: undefined }), true)
})

test('daily menu reducers protect family-scoped date and background list results', () => {
  const page = read('src/pages/today/index.tsx')
  const slice = read('src/store/dailyMenu/dailyMenuSlice.ts')
  const thunks = read('src/thunks/dailyMenu/thunks.ts')

  assert.match(page, /getDateRequestKey\(family\._id, dateKey\)/)
  assert.match(page, /findFamilyMenu\(dailyMenus, family\?\._id, dateKey\)/)
  assert.doesNotMatch(page, /hasFetchedToday/)
  assert.doesNotMatch(page, /hasFetchedAll/)
  assert.match(slice, /startDateRequest\(state, action\.meta\.arg\.familyId, action\.meta\.arg\.date, action\.meta\.requestId\)/)
  assert.match(slice, /m\.family_id !== familyId \|\| !isSameDay\(m\.date, date\)/)
  assert.match(slice, /startFamilyRequest\(state, action\.meta\.arg\.familyId, action\.meta\.requestId\)/)
  assert.match(slice, /fulfillFamilyRequest\(state, action\.meta\.arg\.familyId, action\.meta\.requestId\)/)
  assert.match(thunks, /return \{ familyId, menus:/)
  assert.doesNotMatch(thunks, /dispatch\(setDailyMenus/)
})

test('older bulk menus preserve newer family-date state while refreshing other dates', () => {
  const merge = require(path.join(root, 'src/store/dailyMenu/menuMerge.js'))
  const requests = require(path.join(root, 'src/store/dailyMenu/dateRequest.js'))
  const state = {
    dailyMenus: [
      { _id: 'a-new', family_id: 'family-a', date: '2026-07-20', recipes: [{ recipe_id: 'new' }] },
      { _id: 'b-local', family_id: 'family-b', date: '2026-07-20', recipes: [] }
    ],
    menuRevisions: {},
    menuRevision: 0,
    familyRequests: {}
  }
  const incoming = [
    { _id: 'a-stale', family_id: 'family-a', date: '2026-07-20', recipes: [{ recipe_id: 'stale' }] },
    { _id: 'a-refresh', family_id: 'family-a', date: '2026-07-21', recipes: [{ recipe_id: 'remote' }] }
  ]

  requests.startFamilyRequest(state, 'family-a', 'bulk-request')
  const bulkRevision = state.familyRequests['family-a'].revision
  merge.markMenuRevision(state, 'family-a', '2026-07-20')
  merge.mergeBulkMenus(state, 'family-a', incoming, bulkRevision)
  assert.equal(state.dailyMenus.find(menu => menu.family_id === 'family-a' && menu.date === '2026-07-20')._id, 'a-new')
  assert.equal(state.dailyMenus.find(menu => menu.family_id === 'family-a' && menu.date === '2026-07-21')._id, 'a-refresh')
  assert.equal(state.dailyMenus.find(menu => menu.family_id === 'family-b')._id, 'b-local')

  merge.markMenuRevision(state, 'family-a', '2026-07-22')
  assert.equal(state.menuRevisions['family-a::2026-07-22'], 2)
})

test('optimistic removal only mutates the requested family menu', () => {
  const merge = require(path.join(root, 'src/store/dailyMenu/menuMerge.js'))
  const menus = [
    { family_id: 'family-a', date: '2026-07-20', recipes: [{ recipe_id: 'shared' }] },
    { family_id: 'family-b', date: '2026-07-20', recipes: [{ recipe_id: 'shared' }] }
  ]

  assert.equal(merge.removeRecipeForFamilyDate(menus, 'family-b', '2026-07-20', 'shared'), true)
  assert.equal(menus[0].recipes.length, 1)
  assert.equal(menus[1].recipes.length, 0)

  const slice = read('src/store/dailyMenu/dailyMenuSlice.ts')
  const thunks = read('src/thunks/dailyMenu/thunks.ts')
  assert.match(slice, /PayloadAction<\{ date: string; familyId: string; recipeId: string \}>/)
  assert.match(thunks, /optimisticRemoveRecipe\(\{ familyId, date, recipeId \}\)/)
})
