function startDateRequest(state, date, requestId) {
  state.dateRequests[date] = { status: 'loading', requestId }
}

function isCurrentDateRequest(state, date, requestId) {
  return state.dateRequests[date]?.requestId === requestId
}

function fulfillDateRequest(state, date, requestId, menu) {
  if (!isCurrentDateRequest(state, date, requestId)) return false
  state.dateRequests[date] = { status: menu ? 'loaded' : 'empty', requestId }
  return true
}

function rejectDateRequest(state, date, requestId, error) {
  if (!isCurrentDateRequest(state, date, requestId)) return false
  state.dateRequests[date] = { status: 'failed', requestId, error: error || 'request failed' }
  return true
}

module.exports = { startDateRequest, fulfillDateRequest, rejectDateRequest }
