async function runRecipeDeletion({ remove, onSuccess, onFailure }) {
  try {
    await remove()
  } catch (error) {
    await onFailure(error)
    return false
  }

  await onSuccess()
  return true
}

export { runRecipeDeletion }
