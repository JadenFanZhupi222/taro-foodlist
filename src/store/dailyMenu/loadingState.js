function syncFetchLoading(state) {
  state.fetchLoading = Object.values(state.familyRequests).some(request => request.status === 'loading')
  state.fetchDailyLoading = Object.values(state.dateRequests).some(request => request.status === 'loading')
}

function startWrite(state, kind, requestId) {
  const requestsKey = `${kind}PendingRequests`
  const loadingKey = `${kind}Loading`
  state[requestsKey][requestId] = true
  state[loadingKey] = Object.keys(state[requestsKey]).length > 0
}

function finishWrite(state, kind, requestId) {
  const requestsKey = `${kind}PendingRequests`
  const loadingKey = `${kind}Loading`
  delete state[requestsKey][requestId]
  state[loadingKey] = Object.keys(state[requestsKey]).length > 0
}

export { syncFetchLoading, startWrite, finishWrite }
