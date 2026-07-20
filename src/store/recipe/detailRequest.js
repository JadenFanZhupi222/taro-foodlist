/**
 * @param {string} requestId
 * @returns {{ status: 'loading', requestId: string }}
 */
function createDetailRequest(requestId) {
  return { status: 'loading', requestId }
}

/**
 * @param {Record<string, { requestId: string } | undefined>} requests
 * @param {string} recipeId
 * @param {string} requestId
 */
function isCurrentDetailRequest(requests, recipeId, requestId) {
  return requests[recipeId]?.requestId === requestId
}

module.exports = { createDetailRequest, isCurrentDetailRequest }
