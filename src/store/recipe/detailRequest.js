/** @param {Record<string, { status: string } | undefined>} requests @param {string} recipeId */
function canStartDetailRequest(requests, recipeId) {
  return requests[recipeId]?.status !== 'loading'
}

/** @param {{ detailRequests: Record<string, any> }} state @param {string} recipeId @param {string} requestId */
function startDetailRequest(state, recipeId, requestId) {
  state.detailRequests[recipeId] = { status: 'loading', requestId }
}

/** @param {Record<string, { requestId: string } | undefined>} requests @param {string} recipeId @param {string} requestId */
function isCurrentDetailRequest(requests, recipeId, requestId) {
  return requests[recipeId]?.requestId === requestId
}

/**
 * @param {{ recipes: any[], detailRequests: Record<string, any> }} state
 * @param {string} recipeId
 * @param {string} requestId
 * @param {any | null} recipe
 */
function fulfillDetailRequest(state, recipeId, requestId, recipe) {
  if (!isCurrentDetailRequest(state.detailRequests, recipeId, requestId)) return false
  if (!recipe) {
    state.detailRequests[recipeId] = { status: 'not-found', requestId }
    return true
  }
  const index = state.recipes.findIndex(item => item._id === recipeId)
  if (index === -1) state.recipes.push(recipe)
  else state.recipes[index] = recipe
  delete state.detailRequests[recipeId]
  return true
}

/** @param {{ detailRequests: Record<string, any> }} state @param {string} recipeId @param {string} requestId */
function rejectDetailRequest(state, recipeId, requestId) {
  if (!isCurrentDetailRequest(state.detailRequests, recipeId, requestId)) return false
  state.detailRequests[recipeId] = { status: 'failed', requestId }
  return true
}

export {
  canStartDetailRequest,
  startDetailRequest,
  fulfillDetailRequest,
  rejectDetailRequest
}
