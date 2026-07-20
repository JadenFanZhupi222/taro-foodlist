async function runRecipeDeletion({ remove, onSuccess, onFailure }) {
  try {
    await remove()
    onSuccess()
    return true
  } catch (error) {
    onFailure(error)
    return false
  }
}

module.exports = { runRecipeDeletion }
