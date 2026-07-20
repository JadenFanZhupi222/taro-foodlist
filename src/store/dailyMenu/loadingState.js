function syncFetchLoading(state) {
  state.fetchLoading = Object.values(state.familyRequests).some(request => request.status === 'loading')
  state.fetchDailyLoading = Object.values(state.dateRequests).some(request => request.status === 'loading')
}

function startWrite(state, kind) {
  const countKey = `${kind}PendingCount`
  const loadingKey = `${kind}Loading`
  state[countKey] = (state[countKey] || 0) + 1
  state[loadingKey] = true
}

function finishWrite(state, kind) {
  const countKey = `${kind}PendingCount`
  const loadingKey = `${kind}Loading`
  state[countKey] = Math.max(0, (state[countKey] || 0) - 1)
  state[loadingKey] = state[countKey] > 0
}

module.exports = { syncFetchLoading, startWrite, finishWrite }
