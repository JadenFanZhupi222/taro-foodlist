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

module.exports = { startCatalogRequest, fulfillCatalogRequest, rejectCatalogRequest }
