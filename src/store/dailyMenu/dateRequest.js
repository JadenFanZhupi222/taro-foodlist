function getDateRequestKey(familyId, date) {
  return `${familyId}::${date}`
}

function startDateRequest(state, familyId, date, requestId) {
  state.dateRequests[getDateRequestKey(familyId, date)] = { status: 'loading', requestId }
}

function isCurrentDateRequest(state, familyId, date, requestId) {
  return state.dateRequests[getDateRequestKey(familyId, date)]?.requestId === requestId
}

function fulfillDateRequest(state, familyId, date, requestId, menu) {
  if (!isCurrentDateRequest(state, familyId, date, requestId)) return false
  state.dateRequests[getDateRequestKey(familyId, date)] = { status: menu ? 'loaded' : 'empty', requestId }
  return true
}

function rejectDateRequest(state, familyId, date, requestId, error) {
  if (!isCurrentDateRequest(state, familyId, date, requestId)) return false
  state.dateRequests[getDateRequestKey(familyId, date)] = { status: 'failed', requestId, error: error || 'request failed' }
  return true
}

function startFamilyRequest(state, familyId, requestId) {
  state.familyRequests[familyId] = { status: 'loading', requestId }
}

function fulfillFamilyRequest(state, familyId, requestId) {
  if (state.familyRequests[familyId]?.requestId !== requestId) return false
  state.familyRequests[familyId] = { status: 'loaded', requestId }
  return true
}

function rejectFamilyRequest(state, familyId, requestId) {
  if (state.familyRequests[familyId]?.requestId !== requestId) return false
  state.familyRequests[familyId] = { status: 'failed', requestId }
  return true
}

module.exports = {
  getDateRequestKey,
  startDateRequest,
  fulfillDateRequest,
  rejectDateRequest,
  startFamilyRequest,
  fulfillFamilyRequest,
  rejectFamilyRequest
}
