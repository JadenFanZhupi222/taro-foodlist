function isCurrentCatalogRequest(state, familyId, requestId) {
  return state.catalogRequest?.familyId === familyId && state.catalogRequest?.requestId === requestId
}

function startCatalogRequest(state, familyId, requestId) {
  state.catalogRequest = { familyId, requestId }
  state.fetchLoading = true
  state.catalogStatus = 'loading'
}

function fulfillCatalogRequest(state, familyId, requestId, recipes) {
  if (!isCurrentCatalogRequest(state, familyId, requestId)) return false
  state.recipes = recipes
  state.fetchLoading = false
  state.catalogStatus = 'ready'
  state.catalogRequest = null
  return true
}

function rejectCatalogRequest(state, familyId, requestId) {
  if (!isCurrentCatalogRequest(state, familyId, requestId)) return false
  state.fetchLoading = false
  state.catalogStatus = 'failed'
  state.catalogRequest = null
  return true
}

/** @param {{ fetchLoading: boolean, catalogStatus: string, catalogRequest: any }} state */
function invalidateCatalogRequest(state) {
  state.fetchLoading = false
  state.catalogStatus = 'ready'
  state.catalogRequest = null
}

/** @param {{ recipes: any[], fetchLoading: boolean, catalogStatus: string, catalogRequest: any }} state @param {any[]} recipes */
function replaceLocalRecipes(state, recipes) {
  state.recipes = recipes
  invalidateCatalogRequest(state)
}

/** @param {{ recipes: any[], fetchLoading: boolean, catalogStatus: string, catalogRequest: any }} state @param {any} recipe */
function addLocalRecipe(state, recipe) {
  state.recipes.push(recipe)
  invalidateCatalogRequest(state)
}

/** @param {{ recipes: any[], fetchLoading: boolean, catalogStatus: string, catalogRequest: any }} state @param {any} recipe */
function updateLocalRecipe(state, recipe) {
  const index = state.recipes.findIndex(item => item._id === recipe._id)
  if (index !== -1) state.recipes[index] = recipe
  invalidateCatalogRequest(state)
}

/** @param {{ recipes: any[], fetchLoading: boolean, catalogStatus: string, catalogRequest: any }} state @param {string} recipeId @param {any} patch */
function patchLocalRecipe(state, recipeId, patch) {
  const index = state.recipes.findIndex(item => item._id === recipeId)
  if (index !== -1) state.recipes[index] = { ...state.recipes[index], ...patch }
  invalidateCatalogRequest(state)
}

/** @param {{ recipes: any[], fetchLoading: boolean, catalogStatus: string, catalogRequest: any }} state @param {string} recipeId */
function deleteLocalRecipe(state, recipeId) {
  state.recipes = state.recipes.filter(recipe => recipe._id !== recipeId)
  invalidateCatalogRequest(state)
}

module.exports = {
  isCurrentCatalogRequest,
  startCatalogRequest,
  fulfillCatalogRequest,
  rejectCatalogRequest,
  invalidateCatalogRequest,
  replaceLocalRecipes,
  addLocalRecipe,
  updateLocalRecipe,
  patchLocalRecipe,
  deleteLocalRecipe
}
