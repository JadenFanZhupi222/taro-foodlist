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

test('recipe deletion reports exactly one truthful outcome after persistence settles', async () => {
  const helperPath = path.join(root, 'src/pages/index/recipeDeletion.js')
  assert.equal(fs.existsSync(helperPath), true, 'recipe deletion controller must exist')
  const { runRecipeDeletion } = require(helperPath)

  const successEvents = []
  assert.equal(await runRecipeDeletion({
    remove: async () => { successEvents.push('remove') },
    onSuccess: () => { successEvents.push('success') },
    onFailure: () => { successEvents.push('failure') }
  }), true)
  assert.deepEqual(successEvents, ['remove', 'success'])

  const failureEvents = []
  assert.equal(await runRecipeDeletion({
    remove: async () => { failureEvents.push('remove'); throw new Error('rejected') },
    onSuccess: () => { failureEvents.push('success') },
    onFailure: () => { failureEvents.push('failure') }
  }), false)
  assert.deepEqual(failureEvents, ['remove', 'failure'])

  const page = read('src/pages/index/index.tsx')
  const thunks = read('src/thunks/recipe/thunks.ts')
  const deleteThunk = thunks.slice(thunks.indexOf('export const deleteRecipeById'), thunks.indexOf('export const fetchComments'))
  assert.match(page, /import recipeDeletionModule = require\('\.\/recipeDeletion'\)/)
  assert.match(page, /remove:\s*async \(\) => dispatch\(deleteRecipeById\([\s\S]*?\)\)\.unwrap\(\)/)
  assert.doesNotMatch(deleteThunk, /toast\(/)
})

test('recipe deletion awaits one selected outcome and propagates callback errors', async () => {
  const { runRecipeDeletion } = require(path.join(root, 'src/pages/index/recipeDeletion.js'))

  const syncEvents = []
  await assert.rejects(runRecipeDeletion({
    remove: async () => { syncEvents.push('remove') },
    onSuccess: () => { syncEvents.push('success'); throw new Error('success callback failed') },
    onFailure: () => { syncEvents.push('failure') }
  }), /success callback failed/)
  assert.deepEqual(syncEvents, ['remove', 'success'])

  const asyncEvents = []
  await assert.rejects(runRecipeDeletion({
    remove: async () => { asyncEvents.push('remove'); throw new Error('persistence failed') },
    onSuccess: () => { asyncEvents.push('success') },
    onFailure: async () => {
      await Promise.resolve()
      asyncEvents.push('failure')
      throw new Error('failure callback failed')
    }
  }), /failure callback failed/)
  assert.deepEqual(asyncEvents, ['remove', 'failure'])

  const awaitedEvents = []
  assert.equal(await runRecipeDeletion({
    remove: async () => { awaitedEvents.push('remove') },
    onSuccess: async () => {
      await Promise.resolve()
      awaitedEvents.push('success')
    },
    onFailure: () => { awaitedEvents.push('failure') }
  }), true)
  assert.deepEqual(awaitedEvents, ['remove', 'success'])
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
  assert.equal(classifyTodayState({ userId: 'user', familyId: 'family', menu: { recipes: [{ recipe_id: 'r1' }, { recipe_id: 'r2' }] }, totalRecipeCount: 2, resolvedRecipeCount: 1 }), 'resolving')
})

test('today page reports the planned count while recipe hydration is partial', () => {
  const source = read('src/pages/today/index.tsx')

  assert.match(source, /totalRecipeCount:\s*todayMenu\?\.recipes\.length\s*\|\|\s*0/)
  assert.match(source, /const todayRecipeCount = todayMenu\?\.recipes\.length \|\| 0/)
  assert.match(source, /todayRecipeCount > 0 \? `[^`]*\$\{todayRecipeCount\}/)
  assert.match(source, /menu-summary__count[^\n]*\{todayRecipeCount\}/)
})

test('daily menu loading transitions ignore stale fetches and count overlapping writes', () => {
  const requests = require(path.join(root, 'src/store/dailyMenu/loadingState.js'))
  const state = {
    fetchLoading: false,
    fetchDailyLoading: false,
    createLoading: false,
    removeLoading: false,
    createPendingRequests: {},
    removePendingRequests: {},
    familyRequests: {},
    dateRequests: {}
  }

  requests.syncFetchLoading(state)
  state.familyRequests.a = { status: 'loading', requestId: 'new' }
  requests.syncFetchLoading(state)
  assert.equal(state.fetchLoading, true)
  requests.syncFetchLoading(state)
  assert.equal(state.fetchLoading, true, 'a stale completion must not clear a current family request')
  state.familyRequests.a.status = 'loaded'
  requests.syncFetchLoading(state)
  assert.equal(state.fetchLoading, false)

  state.dateRequests.first = { status: 'loaded', requestId: 'old' }
  state.dateRequests.second = { status: 'loading', requestId: 'current' }
  requests.syncFetchLoading(state)
  assert.equal(state.fetchDailyLoading, true)
  state.dateRequests.second.status = 'empty'
  requests.syncFetchLoading(state)
  assert.equal(state.fetchDailyLoading, false)

  requests.startWrite(state, 'create', 'create-a')
  requests.startWrite(state, 'create', 'create-b')
  requests.finishWrite(state, 'create', 'create-a')
  assert.equal(state.createLoading, true)
  requests.finishWrite(state, 'create', 'create-b')
  assert.equal(state.createLoading, false)

  requests.startWrite(state, 'remove', 'remove-a')
  requests.startWrite(state, 'remove', 'remove-b')
  requests.finishWrite(state, 'remove', 'remove-a')
  assert.equal(state.removeLoading, true)
  requests.finishWrite(state, 'remove', 'remove-b')
  requests.finishWrite(state, 'remove', 'unknown')
  assert.equal(Object.keys(state.removePendingRequests).length, 0)
  assert.equal(state.removeLoading, false)

  const slice = read('src/store/dailyMenu/dailyMenuSlice.ts')
  assert.match(slice, /syncFetchLoading\(state\)/)
  assert.match(slice, /startWrite\(state, 'create', action\.meta\.requestId\)/)
  assert.match(slice, /finishWrite\(state, 'remove', action\.meta\.requestId\)/)
})

test('daily menu write requests survive reset and ignore stale pre-reset completions', () => {
  const loading = require(path.join(root, 'src/store/dailyMenu/loadingState.js'))
  for (const kind of ['create', 'remove']) {
    const pendingKey = `${kind}PendingRequests`
    const loadingKey = `${kind}Loading`
    const state = { [pendingKey]: {}, [loadingKey]: false }

    loading.startWrite(state, kind, 'request-a')
    state[pendingKey] = {}
    state[loadingKey] = false
    loading.startWrite(state, kind, 'request-b')
    loading.finishWrite(state, kind, 'request-a')

    assert.equal(state[loadingKey], true)
    assert.deepEqual(Object.keys(state[pendingKey]), ['request-b'])
    loading.finishWrite(state, kind, 'request-b')
    assert.equal(state[loadingKey], false)
  }

  const slice = read('src/store/dailyMenu/dailyMenuSlice.ts')
  assert.match(slice, /startWrite\(state, 'create', action\.meta\.requestId\)/)
  assert.match(slice, /finishWrite\(state, 'remove', action\.meta\.requestId\)/)
})

test('today recipe hydration distinguishes in-flight refs from terminal missing recipes', () => {
  const hydration = require(path.join(root, 'src/pages/today/recipeHydration.js'))
  const menu = { recipes: [
    { recipe_id: 'known', order: 1 },
    { recipe_id: 'snapshot', order: 2, name: '旧菜名', type: '其他' },
    { recipe_id: 'missing', order: 3 }
  ] }
  const recipes = [{ _id: 'known', name: '已加载', type: '其他', image: 'known.png' }]

  const loading = hydration.hydrateTodayRecipes(menu, recipes, 'loading')
  assert.equal(loading.length, 1)
  assert.equal(loading[0]._id, 'known')

  const ready = hydration.hydrateTodayRecipes(menu, recipes, 'ready')
  assert.equal(ready.length, 3)
  assert.equal(ready[1].name, '旧菜名')
  assert.equal(ready[1].unavailable, true)
  assert.equal(ready[2].name, '食谱已移除')
  assert.equal(ready[2].unavailable, true)

  const failed = hydration.hydrateTodayRecipes(menu, recipes, 'failed')
  assert.equal(failed[2].name, '食谱信息暂不可用')
})

test('today consumes catalog status and guards unavailable recipe navigation', () => {
  const page = read('src/pages/today/index.tsx')
  const recipeSlice = read('src/store/recipe/recipeSlice.ts')
  const selectors = read('src/store/recipe/selectors.ts')
  const initialState = read('src/store/recipe/initialState.ts')

  assert.match(page, /selectRecipeCatalogStatus/)
  assert.match(page, /hydrateTodayRecipes\(todayMenu, allRecipes, recipeCatalogStatus\)/)
  assert.match(page, /if \(recipe\.unavailable\) return/)
  assert.match(recipeSlice, /catalogStatus = 'loading'/)
  assert.match(recipeSlice, /catalogStatus = 'ready'/)
  assert.match(recipeSlice, /catalogStatus = 'failed'/)
  assert.match(recipeSlice, /resetRecipes: \(\) => initialState/)
  assert.match(initialState, /catalogStatus: 'idle'/)
  assert.match(selectors, /selectRecipeCatalogStatus/)
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

test('add-recipe grids stay contained in pages and floating panels', () => {
  const panelStyles = read('src/components/today/AddRecipes/index.scss')
  const pageStyles = read('src/pages/today/addRecipes/index.scss')

  assert.match(panelStyles, /\.planner-content\s*\{[^}]*width:\s*100%[^}]*max-width:\s*100%/s)
  assert.match(panelStyles, /\.available-recipes\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)[^}]*gap:\s*[\d.]+rem/s)
  assert.match(panelStyles, /\.available-recipe\s*\{[^}]*width:\s*100%[^}]*max-width:\s*100%/s)
  assert.match(panelStyles, /&\.add-placeholder\s*\{[^}]*grid-column:\s*1\s*\/\s*-1[^}]*width:\s*100%[^}]*max-width:\s*100%/s)
  assert.doesNotMatch(panelStyles, /(?:width|max-width|min-width|gap):\s*[\d.]+vw/)

  assert.match(pageStyles, /\.add-recipes-list\s*\{[^}]*width:\s*100%[^}]*max-width:\s*100%[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)[^}]*gap:\s*[\d.]+rem/s)
  assert.match(pageStyles, /\.add-recipes-empty\s*\{[^}]*grid-column:\s*1\s*\/\s*-1[^}]*width:\s*100%[^}]*max-width:\s*100%/s)
  assert.doesNotMatch(pageStyles, /(?:width|max-width|min-width|gap):\s*[\d.]+vw/)
  assert.match(pageStyles, /\.add-recipes-footer\{[^}]*position:fixed[^}]*bottom:0[^}]*env\(safe-area-inset-bottom\)/s)
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

test('family request transitions preserve known data on failure and ignore stale completions', () => {
  const helperPath = path.join(root, 'src/store/family/familyRequest.js')
  assert.equal(fs.existsSync(helperPath), true, 'family request transition helper must exist')
  const requests = require(helperPath)
  const family = { _id: 'family-a', membersInfo: [{ openId: 'member-a' }] }
  const state = { currentFamily: family, membersInfo: family.membersInfo, fetchLoading: false, fetchError: null }

  requests.startFamilyRequest(state, 'first')
  requests.rejectFamilyRequest(state, 'first', 'network')
  assert.equal(state.currentFamily, family)
  assert.equal(state.membersInfo, family.membersInfo)
  assert.equal(state.fetchError, 'network')

  requests.startFamilyRequest(state, 'retry')
  assert.equal(state.fetchError, null)
  assert.equal(requests.fulfillFamilyRequest(state, 'first', null), false)
  assert.equal(state.currentFamily, family)
  assert.equal(requests.fulfillFamilyRequest(state, 'retry', null), true)
  assert.equal(state.currentFamily, null)
  assert.deepEqual(state.membersInfo, [])
})

test('invite transitions suppress unresolved data, record errors, and reject stale or reset results', () => {
  const requests = require(path.join(root, 'src/store/family/familyRequest.js'))
  const state = { inviteFamily: { _id: 'old' }, inviteFamilyLoading: false, inviteError: 'old error' }

  requests.startInviteRequest(state, 'family-a', 'first')
  assert.equal(state.inviteFamily, null)
  assert.equal(state.inviteError, null)
  requests.startInviteRequest(state, 'family-b', 'second')
  assert.equal(requests.fulfillInviteRequest(state, 'family-a', 'first', { _id: 'family-a' }), false)
  assert.equal(requests.rejectInviteRequest(state, 'family-a', 'first', 'stale'), false)
  assert.equal(requests.fulfillInviteRequest(state, 'family-b', 'second', null), true)
  assert.equal(state.inviteFamily, null)
  assert.match(state.inviteError, /not found/i)
  assert.equal(state.inviteErrorFamilyId, 'family-b')

  requests.startInviteRequest(state, 'family-b', 'third')
  delete state.inviteRequest
  assert.equal(requests.fulfillInviteRequest(state, 'family-b', 'third', { _id: 'family-b' }), false)
})

test('family pages distinguish retryable failures from confirmed absence and unresolved invites', () => {
  const familyPage = read('src/pages/family/index.tsx')
  const invitePage = read('src/pages/family/acceptInvite/index.tsx')
  const slice = read('src/store/family/familySlice.ts')
  const thunks = read('src/thunks/family/thunks.ts')

  assert.match(familyPage, /selectFamilyError/)
  assert.match(familyPage, /kind='error'/)
  assert.match(familyPage, /onAction=\{\(\) => dispatch\(fetchFamily\(\)\)\}/)
  assert.match(familyPage, /family \? \(/)
  assert.match(familyPage, /fetchError \? \(/)
  assert.match(familyPage, /NoFamilyScreen/)

  assert.match(invitePage, /selectInviteFamilyError/)
  assert.match(invitePage, /if \(familyId\) dispatch\(fetchFamilyById\(familyId\)\)/)
  assert.doesNotMatch(invitePage, /fetchFamilyById\(''\)/)
  assert.match(invitePage, /classifyInviteView/)
  assert.match(invitePage, /kind='error'/)
  assert.match(invitePage, /inviteFamily && familyId/)
  assert.match(invitePage, /disabled=\{joined \|\| !inviteFamily \|\| !familyId\}/)

  assert.match(slice, /startFamilyRequest\(state, action\.meta\.requestId\)/)
  assert.match(slice, /rejectFamilyRequest\(state, action\.meta\.requestId/)
  assert.match(slice, /startInviteRequest\(state, action\.meta\.arg, action\.meta\.requestId\)/)
  assert.match(slice, /fulfillInviteRequest\(state, action\.meta\.arg, action\.meta\.requestId, action\.payload\)/)
  assert.match(thunks, /fetchFamily = createAsyncThunk\(/)
  assert.match(thunks, /async \(\) => \{[\s\S]*?return r\.data \?\? null/)
  assert.match(slice, /setFamily\(state, action\)[\s\S]*?state\.fetchRequestId = null/)
  assert.match(slice, /clearInviteFamily\(state\)[\s\S]*?state\.inviteRequest = null/)
})

test('member lists render a dedicated compact centered empty state', () => {
  const source = read('src/components/family/memberCardList/index.tsx')
  const styles = read('src/components/family/memberCardList/index.scss')

  assert.match(source, /className='member-list-empty'/)
  assert.match(styles, /\.member-list-empty\s*\{[^}]*display:\s*flex[^}]*align-items:\s*center[^}]*justify-content:\s*center[^}]*min-height:\s*[\d.]+rem/s)
})

test('profile and member cards share the default avatar fallback', () => {
  const avatar = read('src/constants/avatar.ts')
  const profile = read('src/pages/profile/index.tsx')
  const userCard = read('src/components/profile/userCard/index.tsx')
  const memberCard = read('src/components/family/memberCard/index.tsx')

  assert.match(avatar, /export const DEFAULT_AVATAR_URL\s*=/)
  assert.match(profile, /user\?\.avatar\?\.trim\(\)\s*\|\|\s*DEFAULT_AVATAR_URL/)
  assert.match(userCard, /useState\(avatar\?\.trim\(\)\s*\|\|\s*DEFAULT_AVATAR_URL\)/)
  assert.match(userCard, /useEffect\([\s\S]*setAvatarSrc\(avatar\?\.trim\(\)\s*\|\|\s*DEFAULT_AVATAR_URL\)[\s\S]*\[avatar\]\)/)
  assert.match(userCard, /onError=\{\(\) => \{[\s\S]*avatarSrc !== DEFAULT_AVATAR_URL[\s\S]*setAvatarSrc\(DEFAULT_AVATAR_URL\)/)
  assert.match(memberCard, /avatar\?\.trim\(\)\s*\|\|\s*DEFAULT_AVATAR_URL/)
  assert.match(memberCard, /onError=/)
})

test('long setting values yield space to labels and wrap safely', () => {
  const styles = read('src/components/SettingPage/index.scss')

  assert.match(styles, /\.setting-page__value\s*\{[^}]*max-width:\s*[^;]+[^}]*min-width:\s*0[^}]*flex-shrink:\s*1[^}]*text-align:\s*right[^}]*overflow-wrap:\s*anywhere/s)
})

test('invite view treats a valid unresolved route as loading and a missing route as error', () => {
  const helperPath = path.join(root, 'src/pages/family/acceptInvite/inviteView.js')
  assert.equal(fs.existsSync(helperPath), true, 'invite view classifier must exist')
  const { classifyInviteView } = require(helperPath)

  assert.equal(classifyInviteView({ familyId: 'family-a', inviteFamily: null, inviteError: null }), 'loading')
  assert.equal(classifyInviteView({ familyId: '', inviteFamily: null, inviteError: null }), 'error')
  assert.equal(classifyInviteView({ familyId: 'family-a', inviteFamily: null, inviteError: 'network', inviteErrorFamilyId: 'family-a' }), 'error')
  assert.equal(classifyInviteView({ familyId: 'family-b', inviteFamily: null, inviteError: 'network', inviteErrorFamilyId: 'family-a' }), 'loading')
  assert.equal(classifyInviteView({ familyId: 'family-a', inviteFamily: { _id: 'family-a' }, inviteError: null }), 'ready')
  assert.equal(classifyInviteView({ familyId: 'family-b', inviteFamily: { _id: 'family-a' }, inviteError: null }), 'loading')

  const source = read('src/pages/family/acceptInvite/index.tsx')
  assert.match(source, /useState\(\(\) => getRouteFamilyId\(\)\)/)
  assert.match(source, /classifyInviteView\(\{ familyId, inviteFamily, inviteError, inviteErrorFamilyId \}\)/)
  assert.doesNotMatch(source, /fetchFamilyById\(''\)/)
  assert.match(source, /inviteView === 'loading'/)
  assert.match(source, /inviteView === 'error'/)
})
